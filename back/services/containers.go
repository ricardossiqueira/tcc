package services

import (
	"back/docker"
	"back/types"
	"back/utils"
	"bytes"
	"context"
	"net/http"
	"strings"

	dockerTypes "github.com/docker/docker/api/types/container"
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

func (cn Container) GetContainerById(containerId string) (types.ContainerDTO, error) {
	container := types.ContainerDTO{}
	err := cn.app.Dao().DB().Select("*").
		From("containers").
		Where(dbx.NewExp("id = {:id}", dbx.Params{"id": containerId})).
		One(&container)
	if err != nil {
		return container, err
	}
	return container, nil
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

	containers, err := cn.DockerCli.ContainerList(cn.DockerCtx, dockerTypes.ListOptions{All: true})
	if err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}

	for _, ctr := range containers {
		ctrStatus, _, _ := strings.Cut(ctr.Status, " ")
		if ctrStatus == status {
			containers_list = append(containers_list, types.ContainerStatusDTO{DockerId: ctr.ID, ImageName: ctr.Image, Status: ctrStatus})
		}
	}
	return c.JSON(http.StatusOK, containers_list)
}

func (cn Container) StopContainer(c echo.Context) error {
	containerId := c.PathParam("id")

	container, err := cn.GetContainerById(containerId)
	if err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}
	if err := cn.DockerCli.ContainerStop(cn.DockerCtx, container.DockerId, dockerTypes.StopOptions{}); err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}
	if err := cn.DockerCli.ContainerRemove(cn.DockerCtx, container.DockerId, dockerTypes.RemoveOptions{}); err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}

	record, err := cn.app.Dao().FindRecordById("containers", container.Id)
	if err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}

	record.Set("status", "Stopped")
	record.Set("port", 0)

	if err := cn.app.Dao().SaveRecord(record); err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}

	return c.JSON(http.StatusOK, nil)
}

func (cn Container) StartContainer(c echo.Context) error {
	containerId := c.PathParam("id")

	container, err := cn.GetContainerById(containerId)
	if err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}

	script := types.ScriptDTO{}
	err = cn.app.Dao().DB().Select("*").
		From("scripts").
		Where(dbx.NewExp("id = {:id}", dbx.Params{"id": container.Script})).
		One(&script)
	if err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}

	//Parse script to .tar
	var tar bytes.Buffer
	if err := utils.ScriptToTar(&tar, script.Script); err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}

	port, err := AllocatePort()
	if err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}

	resp, err := docker.CreateContainer(cn.app, cn.DockerCli, cn.DockerCtx, tar, port)
	if err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}

	record, err := cn.app.Dao().FindRecordById("containers", containerId)
	if err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}

	form := forms.NewRecordUpsert(cn.app, record)

	form.LoadData(map[string]any{
		"docker_id": resp.ID,
		"status":    "Up",
		"port":      port,
	})

	if err := form.Submit(); err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}

	if err := cn.DockerCli.ContainerStart(cn.DockerCtx, resp.ID, dockerTypes.StartOptions{}); err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
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

	data := types.ScriptCreateDTO{}
	if err := c.Bind(&data); err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}

	//CREATE script
	collection, err := cn.app.Dao().FindCollectionByNameOrId("scripts")
	if err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}

	record := models.NewRecord(collection)
	form := forms.NewRecordUpsert(cn.app, record)

	form.LoadData(map[string]any{
		"script":  data.Payload.Choices[0].Message.Content,
		"payload": data.Payload,
		"owner":   user.Id,
	})

	if err := form.Submit(); err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}

	return nil
}
