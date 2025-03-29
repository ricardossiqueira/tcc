package main

import (
	"back/router"
	"back/services"
	"back/sse"
	"back/types"
	"context"
	"os"

	"github.com/joho/godotenv"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"

	"github.com/docker/docker/client"
)

func main() {
	godotenv.Load()
	app := pocketbase.New()

	dockerCtx := context.Background()
	dockerCli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		panic(err)
	}
	defer dockerCli.Close()

	notificationsChan := make(chan sse.Notification, 100)
	statusChan := make(chan types.CreateContainerStatsDTO, 100)

	cn := services.NewContainer(app, dockerCtx, dockerCli, notificationsChan, statusChan)

	// app.Cron().MustAdd(cronjobs.ContainerCleaner(app, cn))

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), false))
		router.SSE(se, cn)
		router.Docker(se, cn)
		router.LLM(se, cn)

		return se.Next()
	})

	app.OnModelAfterCreateSuccess("scripts").BindFunc(func(e *core.ModelEvent) error {
		go cn.Deploy(e)
		return e.Next()
	})

	if err := app.Start(); err != nil {
		app.Logger().Error(err.Error())
	}
}
