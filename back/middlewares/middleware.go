package middlewares

import (
	"back/types"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/models"
)

// RequireContainerOwnership is a middleware function that ensures the authenticated user
// is the owner of the container they are trying to access.
//
// Parameters:
//   - app: A pointer to a PocketBase instance, used for database queries.
//
// Returns:
//   - echo.MiddlewareFunc: An Echo middleware function that validates container ownership.
//
// Behavior:
// 1. Retrieves the authenticated user record from the request context.
// 2. If no authenticated record is found, returns an unauthorized error.
// 3. Extracts the container ID from the request path parameter ("id").
// 4. Queries the database to fetch the container record matching the given ID.
// 5. If the container does not exist, returns a bad request error.
// 6. Checks if the authenticated user is the owner of the container.
// 7. If the user is not the owner, returns a forbidden error.
// 8. If ownership is verified, the request is passed to the next handler.
//
// Example usage:
//   e := echo.New()
//   app := pocketbase.New()
//   e.Use(RequireContainerOwnership(app))
func RequireContainerOwnership(app *pocketbase.PocketBase) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			record, _ := c.Get(apis.ContextAuthRecordKey).(*models.Record)
			if record == nil {
				return apis.NewUnauthorizedError("The request requires valid record authorization token to be set.", nil)
			}

			containerId := c.PathParam("id")
			container := types.ContainerDTO{}

			err := app.Dao().DB().Select("*").
				From("containers").
				Where(dbx.NewExp("id = {:id}", dbx.Params{"id": containerId})).
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
