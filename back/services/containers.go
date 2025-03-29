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
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/forms"
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
	collection, err := cn.app.FindCollectionByNameOrId("container_stats")
	if err != nil {
		return err
	}

	record := core.NewRecord(collection)
	form := forms.NewRecordUpsert(cn.app, record)
	form.Load(map[string]any{
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
func (cn Container) List(re *core.RequestEvent) error {
	containers := []types.ContainerListDTO{}
	info, _ := re.RequestInfo()
	user := info.Auth

	cn.app.DB().
		Select("*").
		From("containers").
		Where(dbx.NewExp("owner = {:id}", dbx.Params{"id": user.Id})).
		All(&containers)

	return re.JSON(http.StatusOK, containers)
}

// * List containers by status
func (cn Container) ListByStatus(re *core.RequestEvent) error {
	status := re.Request.PathValue("status")
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
	return re.JSON(http.StatusOK, containers_list)
}

// * Stop a container
func (cn Container) StopContainer(re *core.RequestEvent) error {
	containerId := re.Request.PathValue("id")
	started_at := time.Now().UnixMilli()
	info, _ := re.RequestInfo()
	user := info.Auth

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

	record, err := cn.app.FindRecordById("containers", containerId)
	if err != nil {
		cn.app.Logger().Error(fmt.Sprintf("[CONTAINER_STOP_CONTAINER] %s", err.Error()))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	record.Set("status", "Stopped")
	record.Set("port", nil)

	if err := cn.app.Save(record); err != nil {
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

	return re.JSON(http.StatusOK, nil)
}

// * Start a container
func (cn Container) StartContainer(re *core.RequestEvent) error {
	containerId := re.Request.PathValue("id")
	started_at := time.Now().UnixMilli()
	info, _ := re.RequestInfo()
	user := info.Auth

	container, err := cn.GetContainerById(containerId)
	if err != nil {
		cn.app.Logger().Error(fmt.Sprintf("[CONTAINER_START_CONTAINER]: %s", err.Error()))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	script := types.ScriptDTO{}
	err = cn.app.DB().Select("*").
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

	record, err := cn.app.FindRecordById("containers", containerId)
	if err != nil {
		cn.app.Logger().Error(fmt.Sprintf("[CONTAINER_START_CONTAINER]: %s", err.Error()))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	form := forms.NewRecordUpsert(cn.app, record)

	form.Load(map[string]any{
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

	return re.JSON(http.StatusOK, nil)
}

func (cn Container) ContainerPOST(re *core.RequestEvent) error {
	info, _ := re.RequestInfo()
	containerId := re.Request.PathValue("id")
	container, err := cn.GetContainerById(containerId)
	if err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_CONTAINER_POST]: %v", err))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	status, value := ProxyPOST(fmt.Sprintf("http://localhost:%s", container.Port), info.Body)
	return re.JSON(status, value)
}

func (cn Container) ContainerGET(re *core.RequestEvent) error {
	containerId := re.Request.PathValue("id")
	container, err := cn.GetContainerById(containerId)
	if err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_CONTAINER_GET]: %v", err))
		return apis.NewBadRequestError(err.Error(), nil)
	}
	status, value := ProxyGET(fmt.Sprintf("http://localhost:%s", container.Port))
	return re.JSON(status, value)
}

func (cn Container) Create(re *core.RequestEvent) error {
	info, _ := re.RequestInfo()
	user := info.Auth

	data := types.ScriptCreateDTO{}
	if err := re.BindBody(&data); err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_CREATE]: %v", err))
		return apis.NewBadRequestError(err.Error(), nil)
	}
	script := data.Payload.Choices[0].Message.Content

	//CREATE script
	collection, err := cn.app.FindCollectionByNameOrId("scripts")
	if err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_CREATE]: %v", err))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	record := core.NewRecord(collection)
	form := forms.NewRecordUpsert(cn.app, record)

	form.Load(map[string]any{
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

func (cn Container) Delete(re *core.RequestEvent) error {
	containerId := re.Request.PathValue("id")
	info, _ := re.RequestInfo()
	user := info.Auth

	containerRecord, err := cn.app.FindRecordById("containers", containerId)
	if err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_DELETE]: %v", err))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	scriptRecord, err := cn.app.FindRecordById("scripts", containerRecord.GetString("script"))
	if err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_DELETE]: %v", err))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	containerName := containerRecord.GetString("name")
	containerDockerId := containerRecord.GetString("docker_id")
	containerStatus := containerRecord.GetString("status")
	port := containerRecord.Get("port")

	if containerStatus == "Up" {
		if err := cn.DockerCli.ContainerStop(cn.DockerCtx, containerDockerId, dockerTypes.StopOptions{}); err != nil {
			cn.app.Logger().Error(fmt.Sprintf("[CONTAINER_DELETE] %s", err.Error()))
			return apis.NewBadRequestError(err.Error(), nil)
		}
		if err := cn.DockerCli.ContainerRemove(cn.DockerCtx, containerDockerId, dockerTypes.RemoveOptions{}); err != nil {
			cn.app.Logger().Error(fmt.Sprintf("[CONTAINER_DELETE] %s", err.Error()))
			return apis.NewBadRequestError(err.Error(), nil)
		}
	}

	if err := cn.app.Delete(containerRecord); err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_DELETE]: %v", err))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	if err := cn.app.Delete(scriptRecord); err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_DELETE]: %v", err))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	if port != nil {
		cn.portMap.ReleasePort(containerRecord.GetString("port"))
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

	return re.JSON(http.StatusOK, nil)
}

func (cn Container) Details(re *core.RequestEvent) error {
	containerId := re.Request.PathValue("id")
	container, err := cn.GetContainerById(containerId)
	if err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_DETAILS]: %v", err))
		return apis.NewBadRequestError(err.Error(), nil)
	}

	return re.JSON(http.StatusOK, container)
}

func (cn Container) Notifications(re *core.RequestEvent) error {
	info, _ := re.RequestInfo()
	userId := re.Request.PathValue("userId")
	userToken := info.Query["token"]

	claims, _ := security.ParseUnverifiedJWT(userToken)
	jwtUserId := cast.ToString(claims["id"])

	re.Response.Header().Set("Content-Type", "text/event-stream")
	re.Response.Header().Set("Cache-Control", "no-cache")
	re.Response.Header().Set("Connection", "keep-alive")

	for {
		select {
		case <-re.Request.Context().Done():
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

			if err := event.MarshalTo(re.Response); err != nil {
				return err
			}

			if f, ok := re.Response.(http.Flusher); ok {
				f.Flush()
			}
		}
	}
}

func (cn *Container) TestSSE(re *core.RequestEvent) error {
	info, _ := re.RequestInfo()
	user := info.Auth
	cn.notificationsChan <- sse.Notification{
		ID:          uuid.New().String(),
		Type:        "success",
		Data:        "test",
		Message:     "Test SSE",
		Timestamp:   time.Now(),
		UserID:      user.Id,
		ContainerID: "",
	}
	return re.JSON(http.StatusOK, nil)
}

func (cn Container) Deploy(e *core.ModelEvent) error {
	script := types.ScriptDTO{}
	started_at := time.Now().UnixMilli()

	//GET script
	cn.app.DB().
		Select("*").
		From("scripts").
		Where(dbx.NewExp("id = {:id}", dbx.Params{"id": e.Model.PK()})).
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
	collection, err := cn.app.FindCollectionByNameOrId("containers")
	if err != nil {
		cn.app.App.Logger().Error(fmt.Sprintf("[CONTAINER_DEPLOY]: %v", err))
		return err
	}

	record := core.NewRecord(collection)
	form := forms.NewRecordUpsert(cn.app, record)

	containerName := namesgenerator.GetRandomName(0)

	form.Load(map[string]any{
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
