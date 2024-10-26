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
	"github.com/pocketbase/pocketbase/models"
)

type Container struct {
	app       *pocketbase.PocketBase
	dockerCtx context.Context
	dockerCli *client.Client
}

func NewContainer(app *pocketbase.PocketBase, dockerCtx context.Context, dockerCli *client.Client) *Container {
	return &Container{
		app:       app,
		dockerCtx: dockerCtx,
		dockerCli: dockerCli,
	}
}

func (cn Container) List(c echo.Context) error {

	containers := []types.ContainerListDTO{}

	user := c.Get(apis.ContextAuthRecordKey).(*models.Record)

	cn.app.Dao().DB().
		Select("*").
		From("containers_registry").
		Where(dbx.NewExp("owner = {:id}", dbx.Params{"id": user.Id})).
		All(&containers)

	return c.JSON(http.StatusOK, containers)
}

func (cn Container) ListByStatus(c echo.Context) error {
	status := c.PathParam("status")
	var containers_list []types.ContainerStatusDTO

	containers, err := cn.dockerCli.ContainerList(cn.dockerCtx, container.ListOptions{All: true})
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
	if err := cn.dockerCli.ContainerStop(cn.dockerCtx, containerId, container.StopOptions{}); err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}
	if err := cn.dockerCli.ContainerRemove(cn.dockerCtx, containerId, container.RemoveOptions{}); err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	container := types.Container{}

	err := cn.app.Dao().DB().Select("*").
		From("containers_registry").
		Where(dbx.NewExp("container_id = {:id}", dbx.Params{"id": containerId})).
		One(&container)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	record, err := cn.app.Dao().FindRecordById("containers_registry", container.Id)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	record.Set("container_status", "Stopped")
	record.Set("port", 0)

	if err := cn.app.Dao().SaveRecord(record); err != nil {
		return err
	}

	return c.JSON(http.StatusOK, nil)
}

// !WARN: DEPRECATED
func (cn Container) StartContainer(c echo.Context) error {
	containerId := c.PathParam("containerId")
	if err := cn.dockerCli.ContainerStart(cn.dockerCtx, containerId, container.StartOptions{}); err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	container := types.Container{}

	err := cn.app.Dao().DB().Select("*").
		From("containers_registry").
		Where(dbx.NewExp("container_id = {:id}", dbx.Params{"id": containerId})).
		One(&container)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	record, err := cn.app.Dao().FindRecordById("containers_registry", container.Id)
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
