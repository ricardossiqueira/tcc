package types

import (
	"github.com/openai/openai-go"
	"github.com/pocketbase/pocketbase/tools/types"
)

type GeneratedScriptDTO struct {
	Payload openai.ChatCompletion `json:"payload"`
}

type ScriptDTO struct {
	Id        string        `db:"id" json:"id"`
	Script    string        `db:"script" json:"script"`
	Payload   types.JsonMap `db:"payload" json:"payload"`
	Owner     string        `db:"owner" json:"owner"`
	CreatedAt string        `db:"created_at" json:"created_at"`
	UpdateAt  string        `db:"updated_at" json:"updated_at"`
}

type ContainerDTO struct {
	Id              string `db:"id" json:"id"`
	ContainerId     string `db:"docker_id" json:"docker_id"`
	GeneratedScript string `db:"script" json:"script"`
	ContainerStatus string `db:"status" json:"status"`
	ContainerImage  string `db:"image" json:"image"`
	Owner           string `db:"owner" json:"owner"`
	CreatedAt       string `db:"created_at" json:"created_at"`
	UpdatedAt       string `db:"updated_at" json:"updated_at"`
}

type ContainerCretateDTO struct {
	Id              string `db:"id" json:"id"`
	ContainerId     string `db:"docker_id" json:"docker_id"`
	GeneratedScript string `db:"script" json:"script"`
	ContainerStatus string `db:"status" json:"status"`
	ContainerImage  string `db:"image" json:"image"`
	Owner           string `db:"owner" json:"owner"`
	Port            string `db:"port" json:"port"`
}

type ContainerStatusDTO struct {
	ContainerId string `json:"docker_id"`
	ImageName   string `json:"image_name"`
	Status      string `json:"status"`
}

type ContainerListDTO struct {
	ContainerId     string `db:"docker_id" json:"id"`
	GeneratedScript string `db:"script" json:"script"`
	ContainerStatus string `db:"status" json:"status"`
	ContainerImage  string `db:"image" json:"image"`
	Port            string `db:"port" json:"port"`
}

type ChatDTO struct {
	Message string `json:"message"`
}
