package main

import (
	"back/llm"
	"back/middlewares"
	"back/services"
	"back/sse"
	"back/types"
	"context"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
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

	c := make(chan sse.Notification, 100)

	cn := services.NewContainer(app, dockerCtx, dockerCli, c)

	// app.OnBeforeServe().Add(cronjobs.ContainerCleaner(app, cn))
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {

		e.Router.GET("/*", apis.StaticDirectoryHandler(os.DirFS("./pb_public"), false))

		// SSE
		e.Router.GET("/sse/notifications/:userId", cn.Notifications, apis.LoadAuthContext(app))

		// Test SSE
		e.Router.GET("/sse/test", cn.TestSSE, apis.LoadAuthContext(app))

		//* Create a new container
		e.Router.POST("/docker/containers/new", cn.Create, apis.LoadAuthContext(app))

		//* List all user containers
		e.Router.GET("/docker/containers/list", cn.List, apis.RequireRecordAuth())

		//* List containers by status
		e.Router.GET("/docker/containers/:status", cn.ListByStatus, apis.RequireRecordAuth())

		//* Stop a container
		e.Router.POST("/docker/containers/:id/stop", cn.StopContainer, middlewares.RequireContainerOwnership(app))

		//* Start a container
		e.Router.POST("/docker/containers/:id/start", cn.StartContainer, middlewares.RequireContainerOwnership(app))

		//* POST to a container
		e.Router.POST("/docker/containers/:id", cn.ContainerPOST)

		//* GET from a container
		e.Router.GET("/docker/containers/:id", cn.ContainerGET)

		//* GET details from the container
		e.Router.GET("/docker/containers/:id/details", cn.Details, middlewares.RequireContainerOwnership(app))

		//* GET raw stats from the container
		e.Router.GET("/docker/containers/:id/stats", cn.Stats, middlewares.RequireContainerOwnership(app))

		//* GET computed stats from the container //TODO: fix create stats on container creation
		e.Router.GET("/docker/containers/:id/computed-stats", cn.ComputedStats, middlewares.RequireContainerOwnership(app))

		//* Post to the llm chatbot //TODO: wrap this function in another file
		e.Router.POST("/llm/chat", func(c echo.Context) error {
			body := types.ChatDTO{}
			if err := c.Bind(&body); err != nil {
				return apis.NewBadRequestError(err.Error(), nil)
			}
			if body.Message == "" {
				return apis.NewBadRequestError("Message is required", nil)
			}

			llmClient := llm.NewClient()
			chatCompletion, err := llmClient.SetModel(llm.DeepseekR1).SetSystemPrompt(llm.CreateService).Run(body.Message)
			if err != nil {
				return apis.NewBadRequestError(err.Error(), nil)
			}

			// return c.JSON(http.StatusOK, map[string]string{"message": chatCompletion.Choices[0].Message.Content})
			return c.JSON(http.StatusOK, chatCompletion)
		}, apis.LoadAuthContext(app))

		return nil
	})

	app.OnModelAfterCreate("scripts").Add(func(e *core.ModelEvent) error {
		go cn.Deploy(e)
		return nil
	})

	if err := app.Start(); err != nil {
		app.Logger().Error(err.Error())
	}
}
