package cronjobs

import (
	"back/services"
	"back/types"
	"context"
	"fmt"
	"log/slog"
	"strings"
	"time"

	dockerContainer "github.com/docker/docker/api/types/container"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
)

const TIMEOUT = 5

// logContainerCleanerError logs an error that occurred during the container cleanup process.
func logContainerCleanerError(app *pocketbase.PocketBase, err error, containerId string) {
	app.Logger().Log(
		context.Background(),
		slog.LevelError,
		fmt.Sprintf(
			"[%s] ContainerCleaner(): %s - %s",
			time.Now().Format(time.DateTime),
			err.Error(),
			containerId,
		),
	)
}

// cleanContainer stops and removes a Docker container, then updates its status in the database.
func cleanContainer(app *pocketbase.PocketBase, cn *services.Container, c types.ContainerDTO) {
	if err := cn.DockerCli.ContainerStop(cn.DockerCtx, c.DockerId, dockerContainer.StopOptions{}); err != nil {
		logContainerCleanerError(app, err, c.Id)
		return
	}
	if err := cn.DockerCli.ContainerRemove(cn.DockerCtx, c.DockerId, dockerContainer.RemoveOptions{}); err != nil {
		logContainerCleanerError(app, err, c.Id)
		return
	}

	record, err := app.FindRecordById("containers", c.Id)
	if err != nil {
		logContainerCleanerError(app, err, c.Id)
		return
	}

	record.Set("status", "Stopped")
	record.Set("port", 0)

	if err := app.Save(record); err != nil {
		logContainerCleanerError(app, err, c.Id)
		return
	}

	cn.PortMap.ReleasePort(c.Port)
}

// ContainerCleaner sets up a scheduled task to clean up inactive containers.
func RegisterCleanContainers(app *pocketbase.PocketBase, cn *services.Container) {
	app.Cron().MustAdd("clean_containers", "*/1 * * * *", func() {
		containers := []types.ContainerDTO{}

		app.DB().
			Select("*").
			From("containers").
			Where(
				dbx.NewExp("updated < {:time}", dbx.Params{"time": time.Now().UTC().Add(TIMEOUT * time.Minute)}),
			).
			AndWhere(
				dbx.NewExp("status = {:status}", dbx.Params{"status": "Up"}),
			).
			All(&containers)

		var containersIds []string
		for _, container := range containers {
			go cleanContainer(app, cn, container)
		}

		var message string
		if len(containersIds) > 0 {
			message = fmt.Sprintf("Stopped - %s", strings.Join(containersIds, ", "))
		} else {
			message = "Nothing to do"
		}
		app.Logger().Log(
			context.Background(),
			slog.LevelInfo,
			fmt.Sprintf(
				"[%s] ContainerCleaner(): %s",
				time.Now().Format(time.DateTime),
				message,
			),
		)
	})
}
