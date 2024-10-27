package types

import (
	"github.com/openai/openai-go"
	"github.com/pocketbase/pocketbase/tools/types"
)

type ScriptCreateDTO struct {
	Payload openai.ChatCompletion `json:"payload"`
}

type ScriptDTO struct {
	Id      string        `db:"id" json:"id"`
	Script  string        `db:"script" json:"script"`
	Payload types.JsonMap `db:"payload" json:"payload"`
	Owner   string        `db:"owner" json:"owner"`
	Created string        `db:"created" json:"created"`
	Update  string        `db:"updated" json:"updated"`
}

type ContainerDTO struct {
	Id       string `db:"id" json:"id"`
	DockerId string `db:"docker_id" json:"docker_id"`
	Script   string `db:"script" json:"script"`
	Status   string `db:"status" json:"status"`
	Image    string `db:"image" json:"image"`
	Owner    string `db:"owner" json:"owner"`
	Port     string `db:"port" json:"port"`
	Created  string `db:"created" json:"created"`
	Update   string `db:"updated" json:"updated"`
}

type ContainerCretateDTO struct {
	Id       string `db:"id" json:"id"`
	DockerId string `db:"docker_id" json:"docker_id"`
	Script   string `db:"script" json:"script"`
	Status   string `db:"status" json:"status"`
	Image    string `db:"image" json:"image"`
	Owner    string `db:"owner" json:"owner"`
	Port     string `db:"port" json:"port"`
}

type ContainerStatusDTO struct {
	DockerId  string `json:"docker_id"`
	ImageName string `json:"image"`
	Status    string `json:"status"`
}

type ContainerListDTO struct {
	Id     string `db:"id" json:"id"`
	Status string `db:"status" json:"status"`
	Image  string `db:"image" json:"image"`
}

type ChatDTO struct {
	Message string `json:"message"`
}
