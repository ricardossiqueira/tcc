package services

import (
	"back/types"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase/apis"
)

func (cn Container) GetContainerStatsById(containerId string) ([]types.ContainersStatsDTO, error) {
	container := []types.ContainersStatsDTO{}

	err := cn.
		app.
		Dao().
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
		Dao().
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

func (cn Container) Stats(c echo.Context) error {
	containerId := c.PathParam("id")

	container, err := cn.GetContainerStatsById(containerId)
	if err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}

	return c.JSON(http.StatusOK, container)
}

func (cn Container) ComputedStats(c echo.Context) error {
	containerId := c.PathParam("id")

	container, err := cn.GetContainerStatsComputedById(containerId)
	if err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}

	return c.JSON(http.StatusOK, container)
}
