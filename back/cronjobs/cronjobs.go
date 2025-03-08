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

// logContainerCleanerError logs an error that occurred during the container cleanup process.
//
// Parameters:
//   - app: A pointer to a PocketBase instance, used to access the application's logger.
//   - err: The error that occurred and will be logged.
//   - containerId: The identifier of the container associated with the error.
//
// Behavior:
// This function logs an error message using the PocketBase logger, including the timestamp,
// the error message, and the affected container ID.
//
// Example log output:
//   [2025-03-06 15:04:05] ContainerCleaner(): failed to remove container - abc123
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
//
// Parameters:
//   - app: A pointer to a PocketBase instance, used to interact with the application's database and logger.
//   - cn: A pointer to a Container service, which provides access to the Docker client.
//   - c: A ContainerDTO struct containing container-related data.
//
// Behavior:
// This function attempts to stop and remove the specified Docker container using the provided
// Docker client. If successful, it updates the container's status in the PocketBase database.
//
// Steps:
//  1. Stops the container using Docker API.
//  2. Removes the container from Docker.
//  3. Retrieves the corresponding database record by container ID.
//  4. Updates the status to "Stopped" and resets the port to 0.
//  5. Saves the updated record in the database.
//
// If any of these steps fail, the function logs the error and stops execution.
//
// Example log output (in case of an error):
//   [2025-03-06 15:04:05] ContainerCleaner(): failed to stop container - abc123
//   [2025-03-06 15:04:06] ContainerCleaner(): failed to remove container - abc123
//   [2025-03-06 15:04:07] ContainerCleaner(): failed to find record - abc123
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

// ContainerCleaner sets up a scheduled task to clean up inactive containers.
//
// Parameters:
//   - app: A pointer to a PocketBase instance, used to access the database and logger.
//   - cn: A pointer to a Container service, providing access to the Docker client.
//
// Returns:
//   - A function that takes a *core.ServeEvent and returns an error.
//
// Behavior:
// This function initializes a cron job that runs every minute. The job:
//  1. Queries the database for containers that have been "Up" and not updated in the last 5 minutes.
//  2. Iterates through the retrieved containers and calls cleanContainer() on each one in a goroutine.
//  3. Logs a message indicating whether any containers were stopped or if there was nothing to do.
//
// Example log output:
//   [2025-03-06 15:04:00] ContainerCleaner(): Stopped - abc123, xyz789
//   [2025-03-06 15:05:00] ContainerCleaner(): Nothing to do
//
// Notes:
// - This function is meant to be used as a PocketBase event handler, typically on server startup.
// - The cleanup process runs concurrently using goroutines for efficiency.
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
