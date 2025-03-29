package services

import (
	"back/types"
	"fmt"
	"net/http"

	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

func (cn Container) GetContainerStatsById(containerId string) ([]types.ContainersStatsDTO, error) {
	container := []types.ContainersStatsDTO{}

	err := cn.
		app.
		DB().
		NewQuery(
			fmt.Sprintf(
				"SELECT * FROM container_stats WHERE container = '%s'", containerId,
			),
		).
		All(&container)
	if err != nil {
		return container, err
	}
	return container, nil
}

func (cn Container) GetContainerStatsComputedById(containerId string) (types.ContainersStatsComputedDTO, error) {
	container := types.ContainersStatsComputedDTO{}

	err := cn.
		app.
		DB().
		NewQuery(
			fmt.Sprintf(
				"SELECT * FROM container_stats_computed WHERE id = '%s'", containerId,
			),
		).
		One(&container)
	if err != nil {
		return container, err
	}
	return container, nil
}

func (cn Container) Stats(re *core.RequestEvent) error {
	containerId := re.Request.PathValue("id")

	container, err := cn.GetContainerStatsById(containerId)
	if err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}

	return re.JSON(http.StatusOK, container)
}

func (cn Container) ComputedStats(re *core.RequestEvent) error {
	containerId := re.Request.PathValue("id")

	container, err := cn.GetContainerStatsComputedById(containerId)
	if err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}

	return re.JSON(http.StatusOK, container)
}
