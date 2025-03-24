package services

import (
	"back/docker"
	"back/llm"
	"back/sse"
	"back/types"
	"back/utils"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	dockerTypes "github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/namesgenerator"
	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/forms"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/tools/security"
	"github.com/spf13/cast"
)

type Container struct {
	app               *pocketbase.PocketBase
	DockerCtx         context.Context
	DockerCli         *client.Client
	notificationsChan chan sse.Notification
	statusChan        chan types.CreateContainerStatsDTO
	portMap           *PortMap
}

func NewContainer(app *pocketbase.PocketBase, dockerCtx context.Context, dockerCli *client.Client, notificationsChan chan sse.Notification, statusChan chan types.CreateContainerStatsDTO) *Container {
	cn := &Container{
		app:               app,
		DockerCtx:         dockerCtx,
		DockerCli:         dockerCli,
		notificationsChan: notificationsChan,
		statusChan:        statusChan,
		portMap:           NewPortMap(),
	}

	go cn.HandleStatusChan()

	return cn
}

func (cn Container) GetContainerById(containerId string) (types.ContainerDetailsDTO, error) {
	container := types.ContainerDetailsDTO{}

	err := cn.
		app.
		Dao().
		DB().
		NewQuery(
			fmt.Sprintf(
				"SELECT containers.*, scripts.id AS script_id, scripts.*, containers.id AS id  FROM containers JOIN scripts ON scripts.id == containers.script WHERE containers.id = '%s'", containerId,
			),
		).
		One(&container)
	if err != nil {
		return container, err
	}
	return container, nil
}

// * Create container stats
func (cn Container) CreateStats(payload types.CreateContainerStatsDTO) error {
	collection, err := cn.app.Dao().FindCollectionByNameOrId("container_stats")
	if err != nil {
		return err
	}

	record := models.NewRecord(collection)
	form := forms.NewRecordUpsert(cn.app, record)
	form.LoadData(map[string]any{
		"container":      payload.Container,
		"start_duration": payload.StartDuration,
		"stop_duration":  payload.StopDuration,
		"method":         payload.Method,
	})

	if err := form.Submit(); err != nil {
		return err
	}

	cn.app.Logger().Info(fmt.Sprintf("Container stats created for container %s", payload.Container))

	return nil
}

func (cn Container) HandleStatusChan() {
	for {
		select {
		case status := <-cn.statusChan:
			if err := cn.CreateStats(status); err != nil {
				cn.app.Logger().Error(err.Error())
			}
		}
	}
}

// * List all containers
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

// * List containers by status
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

// * Stop a container
func (cn Container) StopContainer(c echo.Context) error {
	containerId := c.PathParam("id")
	started_at := time.Now().UnixMilli()
	user := c.Get(apis.ContextAuthRecordKey).(*models.Record)

	container, err := cn.GetContainerById(containerId)
	if err != nil {
		cn.app.Logger().Error(fmt.Sprintf("[CONTAINER_STOP_CONTAINER] %s", err.Error()))
		return apis.NewBadRequestError(err.Error(), nil)
	}
	if err := cn.DockerCli.ContainerStop(cn.DockerCtx, container.DockerId, dockerTypes.StopOptions{}); err != nil {
		cn.app.Logger().Error(fmt.Sprintf("[CONTAINER_STOP_CONTAINER] %s", err.Error()))
		return apis.NewBadRequestError(err.Error(), nil)
	}
	if err := cn.DockerCli.ContainerRemove(cn.DockerCtx, container.DockerId, dockerTypes.RemoveOptions{}); err != nil {
		cn.app.Logger().Error(fmt.Sprintf("[CONTAINER_STOP_CONTAINER] %s", err.Error()))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	cn.portMap.ReleasePort(container.Port)

	record, err := cn.app.Dao().FindRecordById("containers", containerId)
	if err != nil {
		cn.app.Logger().Error(fmt.Sprintf("[CONTAINER_STOP_CONTAINER] %s", err.Error()))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	record.Set("status", "Stopped")
	record.Set("port", nil)

	if err := cn.app.Dao().SaveRecord(record); err != nil {
		cn.app.Logger().Error(fmt.Sprintf("[CONTAINER_STOP_CONTAINER] %s", err.Error()))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	duration := time.Now().UnixMilli() - started_at
	cn.statusChan <- types.CreateContainerStatsDTO{
		Container:    containerId,
		StopDuration: duration,
	}

	cn.notificationsChan <- sse.Notification{
		ID:          uuid.New().String(),
		Type:        "success",
		Data:        containerId,
		Message:     fmt.Sprintf("Container %s stopped.", container.Name),
		Timestamp:   time.Now(),
		UserID:      user.Id,
		ContainerID: containerId,
	}

	return c.JSON(http.StatusOK, nil)
}

// * Start a container
func (cn Container) StartContainer(c echo.Context) error {
	containerId := c.PathParam("id")
	started_at := time.Now().UnixMilli()
	user := c.Get(apis.ContextAuthRecordKey).(*models.Record)

	container, err := cn.GetContainerById(containerId)
	if err != nil {
		cn.app.Logger().Error(fmt.Sprintf("[CONTAINER_START_CONTAINER]: %s", err.Error()))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	script := types.ScriptDTO{}
	err = cn.app.Dao().DB().Select("*").
		From("scripts").
		Where(dbx.NewExp("id = {:id}", dbx.Params{"id": container.ScriptId})).
		One(&script)
	if err != nil {
		cn.app.Logger().Error(fmt.Sprintf("[CONTAINER_START_CONTAINER]: %s", err.Error()))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	//Parse script to .tar
	var tar bytes.Buffer
	if err := utils.ScriptToTar(&tar, script.Script); err != nil {
		cn.app.Logger().Error(fmt.Sprintf("[CONTAINER_START_CONTAINER]: %s", err.Error()))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	port, err := cn.portMap.AllocatePort()
	if err != nil {
		cn.app.Logger().Error(fmt.Sprintf("[CONTAINER_START_CONTAINER]: %s", err.Error()))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	resp, err := docker.CreateContainer(cn.app, cn.DockerCli, cn.DockerCtx, tar, port)
	if err != nil {
		cn.app.Logger().Error(fmt.Sprintf("[CONTAINER_START_CONTAINER]: %s", err.Error()))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	record, err := cn.app.Dao().FindRecordById("containers", containerId)
	if err != nil {
		cn.app.Logger().Error(fmt.Sprintf("[CONTAINER_START_CONTAINER]: %s", err.Error()))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	form := forms.NewRecordUpsert(cn.app, record)

	form.LoadData(map[string]any{
		"docker_id": resp.ID,
		"status":    "Up",
		"port":      port,
	})

	if err := form.Submit(); err != nil {
		cn.app.Logger().Error(fmt.Sprintf("[CONTAINER_START_CONTAINER]: %s", err.Error()))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	if err := cn.DockerCli.ContainerStart(cn.DockerCtx, resp.ID, dockerTypes.StartOptions{}); err != nil {
		cn.app.Logger().Error(fmt.Sprintf("[CONTAINER_START_CONTAINER]: %s", err.Error()))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	duration := time.Now().UnixMilli() - started_at
	cn.statusChan <- types.CreateContainerStatsDTO{
		Container:     containerId,
		StartDuration: duration,
	}

	cn.notificationsChan <- sse.Notification{
		ID:          uuid.New().String(),
		Type:        "success",
		Data:        containerId,
		Message:     fmt.Sprintf("Container %s started.", container.Name),
		Timestamp:   time.Now(),
		UserID:      user.Id,
		ContainerID: containerId,
	}

	return c.JSON(http.StatusOK, nil)
}

func (cn Container) ContainerPOST(c echo.Context) error {
	data := apis.RequestInfo(c).Data
	containerId := c.PathParam("id")

	container, err := cn.GetContainerById(containerId)
	if err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_CONTAINER_POST]: %v", err))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	status, value := ProxyPOST(fmt.Sprintf("http://localhost:%s", container.Port), data)
	return c.JSON(status, value)
}

func (cn Container) ContainerGET(c echo.Context) error {
	containerId := c.PathParam("id")

	container, err := cn.GetContainerById(containerId)
	if err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_CONTAINER_GET]: %v", err))
		return apis.NewBadRequestError(err.Error(), nil)
	}
	status, value := ProxyGET(fmt.Sprintf("http://localhost:%s", container.Port))
	return c.JSON(status, value)
}

func (cn Container) Create(c echo.Context) error {
	user, _ := c.Get(apis.ContextAuthRecordKey).(*models.Record)

	data := types.ScriptCreateDTO{}
	if err := c.Bind(&data); err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_CREATE]: %v", err))
		return apis.NewBadRequestError(err.Error(), nil)
	}
	script := data.Payload.Choices[0].Message.Content

	//CREATE script
	collection, err := cn.app.Dao().FindCollectionByNameOrId("scripts")
	if err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_CREATE]: %v", err))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	record := models.NewRecord(collection)
	form := forms.NewRecordUpsert(cn.app, record)

	form.LoadData(map[string]any{
		"script":  script,
		"payload": data.Payload,
		"owner":   user.Id,
		"prompt":  data.Prompt,
	})

	if err := form.Submit(); err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_CREATE]: %v", err))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	return nil
}

func (cn Container) Delete(c echo.Context) error {
	containerId := c.PathParam("id")
	user := c.Get(apis.ContextAuthRecordKey).(*models.Record)

	containerRecord, err := cn.app.Dao().FindRecordById("containers", containerId)
	if err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_DELETE]: %v", err))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	scriptRecord, err := cn.app.Dao().FindRecordById("scripts", containerRecord.GetString("script"))
	if err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_DELETE]: %v", err))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	if err := cn.app.Dao().DeleteRecord(containerRecord); err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_DELETE]: %v", err))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	if err := cn.app.Dao().DeleteRecord(scriptRecord); err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_DELETE]: %v", err))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	containerName := containerRecord.GetString("name")
	containerDockerId := containerRecord.GetString("docker_id")
	port := containerRecord.Get("port")
	if port != nil {
		cn.portMap.ReleasePort(containerRecord.GetString("port"))
	}

	if err := cn.DockerCli.ContainerStop(cn.DockerCtx, containerDockerId, dockerTypes.StopOptions{}); err != nil {
		cn.app.Logger().Error(fmt.Sprintf("[CONTAINER_DELETE] %s", err.Error()))
		return apis.NewBadRequestError(err.Error(), nil)
	}
	if err := cn.DockerCli.ContainerRemove(cn.DockerCtx, containerDockerId, dockerTypes.RemoveOptions{}); err != nil {
		cn.app.Logger().Error(fmt.Sprintf("[CONTAINER_DELETE] %s", err.Error()))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	cn.notificationsChan <- sse.Notification{
		ID:          uuid.New().String(),
		Type:        "success",
		Data:        containerId,
		Message:     fmt.Sprintf("Container %s deleted.", containerName),
		Timestamp:   time.Now(),
		UserID:      user.Id,
		ContainerID: containerId,
	}

	return c.JSON(http.StatusOK, nil)
}

func (cn Container) Details(c echo.Context) error {
	containerId := c.PathParam("id")

	container, err := cn.GetContainerById(containerId)
	if err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_DETAILS]: %v", err))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	return c.JSON(http.StatusOK, container)
}

func (cn Container) Notifications(c echo.Context) error {
	w := c.Response()
	userId := c.PathParam("userId")
	userToken := c.QueryParam("token")

	claims, _ := security.ParseUnverifiedJWT(userToken)
	jwtUserId := cast.ToString(claims["id"])

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	for {
		select {
		case <-c.Request().Context().Done():
			return nil

		case eventData := <-cn.notificationsChan:
			if jwtUserId != userId {
				continue
			}

			jsonData, err := json.Marshal(eventData)
			if err != nil {
				continue
			}

			if eventData.UserID != userId {
				continue
			}
			event := sse.Event{
				Data: append(jsonData, '\n', '\n'), // Fixes the SSE format
			}

			if err := event.MarshalTo(w); err != nil {
				return err
			}

			w.Flush()
		}
	}
}

func (cn *Container) TestSSE(c echo.Context) error {
	user := c.Get(apis.ContextAuthRecordKey).(*models.Record)
	cn.notificationsChan <- sse.Notification{
		ID:          uuid.New().String(),
		Type:        "success",
		Data:        "test",
		Message:     "Test SSE",
		Timestamp:   time.Now(),
		UserID:      user.Id,
		ContainerID: "",
	}
	return c.JSON(http.StatusOK, nil)
}

func (cn Container) Deploy(e *core.ModelEvent) error {
	script := types.ScriptDTO{}
	started_at := time.Now().UnixMilli()

	//GET script
	cn.app.Dao().DB().
		Select("*").
		From("scripts").
		Where(dbx.NewExp("id = {:id}", dbx.Params{"id": e.Model.GetId()})).
		One(&script)

	//Parse script to .tar
	var tar bytes.Buffer
	if err := utils.ScriptToTar(&tar, script.Script); err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_DEPLOY]: %v", err))
		return err
	}

	port, err := cn.portMap.AllocatePort()
	if err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_DEPLOY]: %v", err))
		return err
	}

	resp, err := docker.CreateContainer(cn.app, cn.DockerCli, cn.DockerCtx, tar, port)
	if err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_DEPLOY]: %v", err))
		return err
	}

	llmClient := llm.NewClient()
	response, err := llmClient.SetModel(llm.Llama3_3_70b).SetSystemPrompt(llm.DescribeService).Run(script.Script)
	description := ""
	if err != nil {
		description = "Could not generate description for this service."
		fmt.Print("err", description)
	} else {
		description = response.Choices[0].Message.Content
	}

	//Create container
	collection, err := cn.app.Dao().FindCollectionByNameOrId("containers")
	if err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_DEPLOY]: %v", err))
		return err
	}

	record := models.NewRecord(collection)
	form := forms.NewRecordUpsert(cn.app, record)

	containerName := namesgenerator.GetRandomName(0)

	form.LoadData(map[string]any{
		"docker_id":   resp.ID,
		"status":      "Up",
		"image":       docker.GetImage(),
		"script":      script.Id,
		"port":        port,
		"owner":       script.Owner,
		"name":        containerName,
		"description": description,
	})

	if err := form.Submit(); err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_DEPLOY]: %v", err))
		return err
	}

	if err := cn.DockerCli.ContainerStart(cn.DockerCtx, resp.ID, dockerTypes.StartOptions{}); err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_DEPLOY]: %v", err))
		return err
	}

	duration := time.Now().UnixMilli() - started_at
	cn.statusChan <- types.CreateContainerStatsDTO{
		Container:     record.Id,
		StartDuration: duration,
	}

	cn.notificationsChan <- sse.Notification{
		ID:          uuid.New().String(),
		Type:        "created",
		Data:        resp.ID,
		Message:     fmt.Sprintf("Container %s started.", containerName),
		Timestamp:   time.Now(),
		UserID:      script.Owner,
		ContainerID: record.Id,
	}

	return nil
}
