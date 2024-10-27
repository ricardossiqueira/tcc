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
	"net/http"
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

		e.Router.POST("/docker/containers/new", cn.Create)

		e.Router.GET("/docker/containers/list", cn.List, apis.RequireRecordAuth())

		e.Router.GET("/docker/containers/:status", cn.ListByStatus, apis.RequireRecordAuth())

		e.Router.POST("/docker/containers/:containerId/stop", cn.StopContainer, middlewares.RequireContainerOwnership(app))

		e.Router.POST("/docker/containers/:containerId/start", cn.StartContainer, middlewares.RequireContainerOwnership(app))

		e.Router.POST("/docker/containers/:containerId/post", cn.PostToContainer, apis.RequireAdminOrRecordAuth())

		e.Router.POST("/llm/chat", func(c echo.Context) error {
			body := types.ChatDTO{}
			if err := c.Bind(&body); err != nil {
				return apis.NewBadRequestError(err.Error(), nil)
			}
			if body.Message == "" {
				return apis.NewBadRequestError("Message is required", nil)
			}

			chatCompletion, err := llm.Run(body.Message)
			if err != nil {
				return apis.NewBadRequestError(err.Error(), nil)
			}

			// return c.JSON(http.StatusOK, map[string]string{"message": chatCompletion.Choices[0].Message.Content})
			return c.JSON(http.StatusOK, chatCompletion)
		}, apis.LoadAuthContext(app))

		return nil
	})

	app.OnModelAfterCreate().Add(func(e *core.ModelEvent) error {
		if e.Model.TableName() == "scripts" {
			script := types.ScriptDTO{}

			//GET script
			app.Dao().DB().
				Select("*").
				From("scripts").
				Where(dbx.NewExp("id = {:id}", dbx.Params{"id": e.Model.GetId()})).
				One(&script)

			//Parse script to .tar
			var tar bytes.Buffer
			if err := utils.ScriptToTar(&tar, script.Script); err != nil {
				app.Logger().Error(err.Error())
				return err
			}

			port, err := services.AllocatePort()
			if err != nil {
				app.Logger().Error(err.Error())
				return err
			}

			resp, err := docker.CreateContainer(app, dockerCli, dockerCtx, tar, port)
			if err != nil {
				app.Logger().Error(err.Error())
				return err
			}

			//Create container
			collection, err := app.Dao().FindCollectionByNameOrId("containers")
			if err != nil {
				app.Logger().Error(err.Error())
				return err
			}

			record := models.NewRecord(collection)
			form := forms.NewRecordUpsert(app, record)

			form.LoadData(map[string]any{
				"docker_id": resp.ID,
				"status":    "Up",
				"image":     docker.GetImage(),
				"script":    script.Id,
				"port":      port,
				"owner":     script.Owner,
			})

			if err := form.Submit(); err != nil {
				app.Logger().Error(err.Error())
				return err
			}

			if err := dockerCli.ContainerStart(dockerCtx, resp.ID, dockerTypes.StartOptions{}); err != nil {
				app.Logger().Error(err.Error())
				return err
			}
		}

		return nil
	})

	if err := app.Start(); err != nil {
		app.Logger().Error(err.Error())
	}
}
