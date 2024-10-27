package services

import (
	"back/types"
	"context"
	"net/http"
	"strings"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/forms"
	"github.com/pocketbase/pocketbase/models"
)

type Container struct {
	app       *pocketbase.PocketBase
	DockerCtx context.Context
	DockerCli *client.Client
}

func NewContainer(app *pocketbase.PocketBase, dockerCtx context.Context, dockerCli *client.Client) *Container {
	return &Container{
		app:       app,
		DockerCtx: dockerCtx,
		DockerCli: dockerCli,
	}
}

func (cn Container) List(c echo.Context) error {

	containers := []types.ContainerListDTO{}

	user := c.Get(apis.ContextAuthRecordKey).(*models.Record)

	cn.app.Dao().DB().
		Select("*").
		From("containers").
		Where(dbx.NewExp("owner = {:id}", dbx.Params{"id": user.Id})).
		All(&containers)

	return c.JSON(http.StatusOK, containers)
}

func (cn Container) ListByStatus(c echo.Context) error {
	status := c.PathParam("status")
	var containers_list []types.ContainerStatusDTO

	containers, err := cn.DockerCli.ContainerList(cn.DockerCtx, container.ListOptions{All: true})
	if err != nil {
		panic(err)
	}

	for _, ctr := range containers {
		ctrStatus, _, _ := strings.Cut(ctr.Status, " ")
		if ctrStatus == status {
			containers_list = append(containers_list, types.ContainerStatusDTO{ContainerId: ctr.ID, ImageName: ctr.Image, Status: ctrStatus})
		}
	}
	return c.JSON(http.StatusOK, containers_list)
}

func (cn Container) StopContainer(c echo.Context) error {
	containerId := c.PathParam("containerId")
	if err := cn.DockerCli.ContainerStop(cn.DockerCtx, containerId, container.StopOptions{}); err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}
	if err := cn.DockerCli.ContainerRemove(cn.DockerCtx, containerId, container.RemoveOptions{}); err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	container := types.ContainerDTO{}

	err := cn.app.Dao().DB().Select("*").
		From("containers").
		Where(dbx.NewExp("docker_id = {:id}", dbx.Params{"id": containerId})).
		One(&container)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	record, err := cn.app.Dao().FindRecordById("containers", container.Id)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	record.Set("status", "Stopped")
	record.Set("port", 0)

	if err := cn.app.Dao().SaveRecord(record); err != nil {
		return err
	}

	return c.JSON(http.StatusOK, nil)
}

// !WARN: DEPRECATED
func (cn Container) StartContainer(c echo.Context) error {
	containerId := c.PathParam("containerId")
	if err := cn.DockerCli.ContainerStart(cn.DockerCtx, containerId, container.StartOptions{}); err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	container := types.ContainerDTO{}

	err := cn.app.Dao().DB().Select("*").
		From("containers").
		Where(dbx.NewExp("docker_id = {:id}", dbx.Params{"id": containerId})).
		One(&container)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	record, err := cn.app.Dao().FindRecordById("containers", container.Id)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	record.Set("container_status", "Up")
	record.Set("port", 5000)

	if err := cn.app.Dao().SaveRecord(record); err != nil {
		return err
	}

	return c.JSON(http.StatusOK, nil)
}

// TODO: Use lookup table to listen to the right port
func (cn Container) PostToContainer(c echo.Context) error {
	data := apis.RequestInfo(c).Data
	status, value := Proxy("http://localhost:5000", data)
	return c.JSON(status, value)
}

func (cn Container) Create(c echo.Context) error {
	user, _ := c.Get(apis.ContextAuthRecordKey).(*models.Record)

	data := types.GeneratedScriptDTO{}
	if err := c.Bind(&data); err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	//CREATE script
	collection, err := cn.app.Dao().FindCollectionByNameOrId("scripts")
	if err != nil {
		cn.app.Logger().Error(err.Error())
		return err
	}

	record := models.NewRecord(collection)
	form := forms.NewRecordUpsert(cn.app, record)

	form.LoadData(map[string]any{
		"script":  data.Payload.Choices[0].Message.Content,
		"payload": data.Payload,
		"owner":   user.Id,
	})

	if err := form.Submit(); err != nil {
		cn.app.Logger().Error(err.Error())
		return err
	}

	return nil
}
