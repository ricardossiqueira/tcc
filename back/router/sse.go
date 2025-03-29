package router

import (
	"back/services"

	"github.com/pocketbase/pocketbase/core"
)

func SSE(se *core.ServeEvent, cn *services.Container) {
	g := se.Router.Group("/sse")

	// SSE
	g.GET("/notifications/{userId}", cn.Notifications)

	// Test SSE
	g.GET("/test", cn.TestSSE)

}
