package router

import (
	"back/middlewares"
	"back/services"

	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

func Docker(se *core.ServeEvent, cn *services.Container) {
	g := se.Router.Group("/docker/containers")

	//* Create a new container
	g.POST("/new", cn.Create).Bind(apis.RequireAuth())

	//* Delete a container
	g.DELETE("/{id}", cn.Delete).Bind(middlewares.RequireContainerOwnership())

	//* List all user containers
	g.GET("/list", cn.List).Bind(apis.RequireAuth())

	// //* List containers by status
	// g.GET("/containers/{status}", cn.ListByStatus).Bind(apis.RequireAuth())

	//* Stop a container
	g.POST("/{id}/stop", cn.StopContainer).Bind(middlewares.RequireContainerOwnership())

	//* Start a container
	g.POST("/{id}/start", cn.StartContainer).Bind(middlewares.RequireContainerOwnership())

	//* POST to a container
	g.POST("/{id}", cn.ContainerPOST)

	//* GET from a container
	g.GET("/{id}", cn.ContainerGET)

	//* GET details from the container
	g.GET("/{id}/details", cn.Details).Bind(middlewares.RequireContainerOwnership())

	//* GET raw stats from the container
	g.GET("/{id}/stats", cn.Stats).Bind(middlewares.RequireContainerOwnership())

	//* GET computed stats from the container //TODO: fix create stats on container creation
	g.GET("/{id}/computed-stats", cn.ComputedStats).Bind(middlewares.RequireContainerOwnership())
}
