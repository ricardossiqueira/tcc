package types

import "github.com/pocketbase/pocketbase/tools/types"

type GeneratedScript struct {
	Id           string        `db:"id" json:"id"`
	PythonScript string        `db:"python_script" json:"python_script"`
	Payload      types.JsonMap `db:"payload" json:"payload"`
}

type Container struct {
	Id              string `db:"id" json:"id"`
	ContainerId     string `db:"container_id" json:"container_id"`
	GeneratedScript string `db:"generated_script" json:"generated_script"`
	ContainerStatus string `db:"container_status" json:"status"`
	ContainerImage  string `db:"container_image" json:"image"`
	Owner           string `db:"owner" json:"owner"`
}

type ContainerStatusDTO struct {
	ContainerId string `json:"container_id"`
	ImageName   string `json:"image_name"`
	Status      string `json:"status"`
}

type ContainerListDTO struct {
	ContainerId     string `db:"container_id" json:"id"`
	GeneratedScript string `db:"generated_script" json:"generated_script"`
	ContainerStatus string `db:"container_status" json:"status"`
	ContainerImage  string `db:"container_image" json:"image"`
	Port            string `db:"port" json:"port"`
}
