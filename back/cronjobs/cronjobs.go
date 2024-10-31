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
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/cron"
)

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

func cleanContainer(app *pocketbase.PocketBase, cn *services.Container, c types.ContainerDTO) {
	if err := cn.DockerCli.ContainerStop(cn.DockerCtx, c.DockerId, dockerContainer.StopOptions{}); err != nil {
		logContainerCleanerError(app, err, c.Id)
		return
	}
	if err := cn.DockerCli.ContainerRemove(cn.DockerCtx, c.DockerId, dockerContainer.RemoveOptions{}); err != nil {
		logContainerCleanerError(app, err, c.Id)
		return
	}

	record, err := app.Dao().FindRecordById("containers", c.Id)
	if err != nil {
		logContainerCleanerError(app, err, c.Id)
		return
	}

	record.Set("status", "Stopped")
	record.Set("port", 0)

	if err := app.Dao().SaveRecord(record); err != nil {
		logContainerCleanerError(app, err, c.Id)
		return
	}
}

func ContainerCleaner(app *pocketbase.PocketBase, cn *services.Container) func(e *core.ServeEvent) error {
	return func(e *core.ServeEvent) error {
		scheduler := cron.New()

		scheduler.MustAdd("hello", "*/1 * * * *", func() {
			containers := []types.ContainerDTO{}

			app.Dao().DB().
				Select("*").
				From("containers").
				Where(
					dbx.NewExp("updated > {:time}", dbx.Params{"time": time.Now().UTC().Add(-5 * time.Minute)}),
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

		scheduler.Start()

		return nil
	}
}
