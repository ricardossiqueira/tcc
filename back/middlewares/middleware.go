package middlewares

import (
	"back/types"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/models"
)

func RequireContainerOwnership(app *pocketbase.PocketBase) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			record, _ := c.Get(apis.ContextAuthRecordKey).(*models.Record)
			if record == nil {
				return apis.NewUnauthorizedError("The request requires valid record authorization token to be set.", nil)
			}

			containerId := c.PathParam("containerId")
			container := types.ContainerDTO{}

			err := app.Dao().DB().Select("*").
				From("containers").
				Where(dbx.NewExp("docker_id = {:id}", dbx.Params{"id": containerId})).
				One(&container)
			if err != nil {
				return apis.NewBadRequestError("This record does not exist.", nil)
			}

			if container.Owner != record.Id {
				return apis.NewForbiddenError("The current user is not owner of the record.", nil)
			}

			return next(c)
		}
	}
}
