package cronjobs

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/cron"
)

// TODO: Remove running containers w/ stale time longer than 5 minutes
// TODO: Add last last_request_at
func ContainerCleaner(app *pocketbase.PocketBase) func(e *core.ServeEvent) error {
	return func(e *core.ServeEvent) error {
		scheduler := cron.New()

		scheduler.MustAdd("hello", "*/1 * * * *", func() {
			app.Logger().Log(
				context.Background(),
				slog.LevelInfo,
				fmt.Sprintf(
					"[%s] ContainerCleaner(): Not implemented",
					time.Now().Format(time.DateTime),
				),
			)
		})

		scheduler.Start()

		return nil
	}
}
