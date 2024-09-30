package main

import (
	"archive/tar"
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/forms"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/tools/types"

	"github.com/docker/docker/api/types/container"
	dockerTypes "github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
)

type GeneratedScript struct {
	Id           string        `db:"id" json:"id"`
	PythonScript string        `db:"python_script" json:"python_script"`
	Payload      types.JsonMap `db:"payload" json:"payload"`
}

type ContainerStatus struct {
	ContainerId string `json:"container_id"`
	ImageName   string `json:"image_name"`
	Status      string `json:"status"`
}

func scriptToTar(buf *bytes.Buffer, script string) error {
	tw := tar.NewWriter(buf)
	var files = []struct {
		Name, Body string
	}{
		{"app.py", script},
	}

	for _, file := range files {
		hdr := &tar.Header{
			Name: file.Name,
			Mode: 0600,
			Size: int64(len(file.Body)),
		}
		if err := tw.WriteHeader(hdr); err != nil {
			return err
		}
		if _, err := tw.Write([]byte(file.Body)); err != nil {
			return err
		}
	}
	if err := tw.Close(); err != nil {
		return err
	}
	return nil
}

func main() {
	app := pocketbase.New()

	dockerCtx := context.Background()
	dockerCli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		panic(err)
	}
	defer dockerCli.Close()

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.GET("/*", apis.StaticDirectoryHandler(os.DirFS("./pb_public"), false))

		e.Router.GET("/hello-admin", func(c echo.Context) error {
			return c.String(http.StatusOK, "congrats, you are a admin")
		}, apis.RequireAdminAuth())

		e.Router.GET("/hello", func(c echo.Context) error {
			return c.String(http.StatusOK, "congrats, you are a registered user")
		}, apis.RequireRecordAuth())

		e.Router.GET("/hello/:name", func(c echo.Context) error {
			name := c.PathParam("name")

			return c.JSON(http.StatusOK, map[string]string{"message": "hello" + name})
		})

		e.Router.GET("/docker/stauts/:status", func(c echo.Context) error {
			status := c.PathParam("status")
			var containers_list []ContainerStatus

			containers, err := dockerCli.ContainerList(dockerCtx, container.ListOptions{All: true})
			if err != nil {
				panic(err)
			}

			for _, ctr := range containers {
				ctrStatus, _, _ := strings.Cut(ctr.Status, " ")
				if ctrStatus == status {
					containers_list = append(containers_list, ContainerStatus{ContainerId: ctr.ID, ImageName: ctr.Image, Status: ctrStatus})
				}
			}
			return c.JSON(http.StatusOK, containers_list)
		}, apis.RequireRecordAuth())

		e.Router.POST("/docker/containers/:containerId/stop", func(c echo.Context) error {
			containerId := c.PathParam("containerId")
			if err := dockerCli.ContainerStop(dockerCtx, containerId, dockerTypes.StopOptions{}); err != nil {
				return c.JSON(http.StatusBadRequest, err)
			}
			return c.JSON(http.StatusOK, nil)
		}, apis.RequireRecordAuth())

		e.Router.POST("/docker/containers/:containerId/start", func(c echo.Context) error {
			containerId := c.PathParam("containerId")
			if err := dockerCli.ContainerStart(dockerCtx, containerId, dockerTypes.StartOptions{}); err != nil {
				return c.JSON(http.StatusBadRequest, err)
			}
			return c.JSON(http.StatusOK, nil)
		}, apis.RequireRecordAuth())

		e.Router.POST("/docker/containers/:containerId/post", func(c echo.Context) error {
			data := apis.RequestInfo(c).Data
			body, _ := json.Marshal(data)
			resp, err := http.Post("http://localhost:5000", "application/json", bytes.NewBuffer(body))
			if err != nil {
				return c.JSON(http.StatusBadRequest, nil)
			}

			body, err = io.ReadAll(resp.Body)
			if err != nil {
				return c.JSON(http.StatusBadRequest, nil)
			}
			defer resp.Body.Close()

			type V struct{ Message string }

			v := V{}
			json.Unmarshal(body, &v)

			return c.JSON(http.StatusOK, v)
		}, apis.RequireRecordAuth())

		return nil
	})

	app.OnModelAfterCreate().Add(func(e *core.ModelEvent) error {
		if e.Model.TableName() == "generated_scripts" {
			generated_script := GeneratedScript{}

			//GET generated_script
			app.Dao().DB().
				Select("*").
				From("generated_scripts").
				Where(dbx.NewExp("id = {:id}", dbx.Params{"id": e.Model.GetId()})).
				One(&generated_script)

			//Parse python_script to .tar
			var buf bytes.Buffer
			if err := scriptToTar(&buf, generated_script.PythonScript); err != nil {
				log.Fatal(err)
			}

			//Create docker container
			//TODO: hanndle multiple ports and container names
			resp, err := dockerCli.ContainerCreate(dockerCtx, &dockerTypes.Config{
				Image:        "devilbox/python-flask:3.8-dev",
				WorkingDir:   "/python-docker",
				Cmd:          []string{"python3", "-m", "flask", "run", "--host=0.0.0.0"},
				ExposedPorts: nat.PortSet{nat.Port("5000"): {}},
			}, &dockerTypes.HostConfig{
				PortBindings: nat.PortMap{
					nat.Port("5000"): []nat.PortBinding{
						{HostIP: "", HostPort: "5000"},
					},
				},
			}, nil, nil, "")
			if err != nil {
				log.Fatal(err)
			}
			log.Printf("Container created: %s\n", resp.ID)

			dockerCli.CopyToContainer(
				dockerCtx,
				resp.ID,
				"/python-docker",
				bufio.NewReader(&buf),
				dockerTypes.CopyToContainerOptions{AllowOverwriteDirWithFile: true},
			)
			log.Printf("Files copied to container: %s\n", resp.ID)

			if err := dockerCli.ContainerStart(dockerCtx, resp.ID, dockerTypes.StartOptions{}); err != nil {
				panic(err)
			}
			log.Printf("Container started: %s\n", resp.ID)

			//Create container_registry
			collection, err := app.Dao().FindCollectionByNameOrId("containers_registry")
			if err != nil {
				log.Fatal(err)
			}

			record := models.NewRecord(collection)
			form := forms.NewRecordUpsert(app, record)

			form.LoadData(map[string]any{
				"container_id":     resp.ID,
				"container_status": "Up",
				"container_image":  "",
				"generated_script": generated_script.Id,
			})

			if err := form.Submit(); err != nil {
				log.Fatal(err)
			}
		}

		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
