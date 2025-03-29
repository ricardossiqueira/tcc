package middlewares

import (
	"back/types"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/hook"
)

const DefaultRequireContainerOwnershipMiddlewareId = "pbRequireContainerOwnership"

// RequireContainerOwnership is a middleware function that ensures the authenticated user
// is the owner of the container they are trying to access.
func RequireContainerOwnership(optCollectionNames ...string) *hook.Handler[*core.RequestEvent] {
	return &hook.Handler[*core.RequestEvent]{
		Id:   DefaultRequireContainerOwnershipMiddlewareId,
		Func: requireContainerOwnership(optCollectionNames...),
	}
}

func requireContainerOwnership(optCollectionNames ...string) func(*core.RequestEvent) error {
	return func(re *core.RequestEvent) error {
		if re.Auth == nil {
			return re.UnauthorizedError("The request requires valid record authorization token.", nil)
		}

		containerId := re.Request.PathValue("id")
		container := types.ContainerDTO{}

		err := re.App.DB().Select("*").
			From("containers").
			Where(dbx.NewExp("id = {:id}", dbx.Params{"id": containerId})).
			One(&container)

		if err != nil {
			return apis.NewBadRequestError("This record does not exist.", nil)
		}

		if container.Owner != re.Auth.Id {
			return apis.NewForbiddenError("The current user is not owner of the record.", nil)
		}

		return re.Next()
	}
}
