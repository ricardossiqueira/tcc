package main

import (
	"back/cronjobs"
	"back/docker"
	"back/llm"
	"back/middlewares"
	"back/services"
	"back/sse"
	"back/types"
	"back/utils"
	"bytes"
	"context"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/forms"
	"github.com/pocketbase/pocketbase/models"

	dockerTypes "github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
)

func main() {
	godotenv.Load()

	app := pocketbase.New()

	dockerCtx := context.Background()
	dockerCli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		panic(err)
	}
	defer dockerCli.Close()

	cn := services.NewContainer(app, dockerCtx, dockerCli)

	app.OnBeforeServe().Add(cronjobs.ContainerCleaner(app))
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.GET("/*", apis.StaticDirectoryHandler(os.DirFS("./pb_public"), false))

		e.Router.GET("/api/sse", func(c echo.Context) error {
			w := c.Response()
			w.Header().Set("Content-Type", "text/event-stream")
			w.Header().Set("Cache-Control", "no-cache")
			w.Header().Set("Connection", "keep-alive")

			ticker := time.NewTicker(1 * time.Second)
			defer ticker.Stop()
			for {
				select {
				case <-c.Request().Context().Done():
					log.Printf("SSE client disconnected, ip: %v", c.RealIP())
					return nil
				case <-ticker.C:
					event := sse.Event{
						Data: []byte("time: " + time.Now().Format(time.RFC3339Nano)),
					}
					if err := event.MarshalTo(w); err != nil {
						return err
					}
					w.Flush()
				}
			}
		})

		e.Router.GET("/docker/containers/list", cn.List, apis.RequireRecordAuth())

		e.Router.GET("/docker/containers/:status", cn.ListByStatus, apis.RequireRecordAuth())

		e.Router.POST("/docker/containers/:containerId/stop", cn.StopContainer, middlewares.RequireContainerOwnership(app))

		e.Router.POST("/docker/containers/:containerId/start", cn.StartContainer, middlewares.RequireContainerOwnership(app))

		e.Router.POST("/docker/containers/:containerId/post", cn.PostToContainer)

		e.Router.GET("/llama/test", func(c echo.Context) error {
			chatCompletion := llm.Run()
			return c.JSON(200, chatCompletion)
		})

		return nil
	})

	app.OnModelAfterCreate().Add(func(e *core.ModelEvent) error {
		if e.Model.TableName() == "generated_scripts" {
			generated_script := types.GeneratedScript{}

			//GET generated_script
			app.Dao().DB().
				Select("*").
				From("generated_scripts").
				Where(dbx.NewExp("id = {:id}", dbx.Params{"id": e.Model.GetId()})).
				One(&generated_script)

			//Parse python_script to .tar
			var tar bytes.Buffer
			if err := utils.ScriptToTar(&tar, generated_script.PythonScript); err != nil {
				app.Logger().Error(err.Error())
			}

			port, err := services.AllocatePort()
			if err != nil {
				app.Logger().Error(err.Error())
			}

			resp, err := docker.CreateContainer(app, dockerCli, dockerCtx, tar, port)
			if err != nil {
				app.Logger().Error(err.Error())
			}

			//Create container_registry
			collection, err := app.Dao().FindCollectionByNameOrId("containers_registry")
			if err != nil {
				app.Logger().Error(err.Error())
			}

			record := models.NewRecord(collection)
			form := forms.NewRecordUpsert(app, record)

			form.LoadData(map[string]any{
				"container_id":     resp.ID,
				"container_status": "Up",
				"container_image":  docker.GetImage(),
				"generated_script": generated_script.Id,
				"port":             port,
			})

			if err := form.Submit(); err != nil {
				app.Logger().Error(err.Error())
			}

			if err := dockerCli.ContainerStart(dockerCtx, resp.ID, dockerTypes.StartOptions{}); err != nil {
				app.Logger().Error(err.Error())
			}

		}

		return nil
	})

	if err := app.Start(); err != nil {
		app.Logger().Error(err.Error())
	}
}
