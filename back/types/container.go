package types

import (
	"github.com/openai/openai-go"
	"github.com/pocketbase/pocketbase/tools/types"
)

type ScriptCreateDTO struct {
	Payload openai.ChatCompletion `json:"payload"`
	Prompt  string                `json:"prompt"`
}

type ScriptDTO struct {
	Id      string             `db:"id" json:"id"`
	Script  string             `db:"script" json:"script"`
	Payload types.JSONMap[any] `db:"payload" json:"payload"`
	Owner   string             `db:"owner" json:"owner"`
	Created string             `db:"created" json:"created"`
	Update  string             `db:"updated" json:"updated"`
}

type ContainerDetailsDTO struct {
	Id          string `db:"id" json:"id"`
	DockerId    string `db:"docker_id" json:"docker_id"`
	Script      string `db:"script" json:"script"`
	Status      string `db:"status" json:"status"`
	Image       string `db:"image" json:"image"`
	Owner       string `db:"owner" json:"owner"`
	Port        string `db:"port" json:"port"`
	Name        string `db:"name" json:"name"`
	Description string `db:"description" json:"description"`
	Prompt      string `db:"prompt" json:"prompt"`
	ScriptId    string `db:"script_id" json:"script_id"`
	Created     string `db:"created" json:"created"`
	Updated     string `db:"updated" json:"updated"`
}

type ContainerDTO struct {
	Id          string `db:"id" json:"id"`
	DockerId    string `db:"docker_id" json:"docker_id"`
	Script      string `db:"script" json:"script"`
	Status      string `db:"status" json:"status"`
	Image       string `db:"image" json:"image"`
	Owner       string `db:"owner" json:"owner"`
	Port        string `db:"port" json:"port"`
	Name        string `db:"name" json:"name"`
	Description string `db:"description" json:"description"`
	Created     string `db:"created" json:"created"`
	Updated     string `db:"updated" json:"updated"`
}

type ContainerCretateDTO struct {
	Id          string `db:"id" json:"id"`
	DockerId    string `db:"docker_id" json:"docker_id"`
	Script      string `db:"script" json:"script"`
	Status      string `db:"status" json:"status"`
	Image       string `db:"image" json:"image"`
	Owner       string `db:"owner" json:"owner"`
	Port        string `db:"port" json:"port"`
	Name        string `db:"name" json:"name"`
	Description string `db:"description" json:"description"`
}

type ContainerStatusDTO struct {
	DockerId  string `json:"docker_id"`
	ImageName string `json:"image"`
	Status    string `json:"status"`
}

type ContainerListDTO struct {
	Id          string `db:"id" json:"id"`
	Status      string `db:"status" json:"status"`
	Image       string `db:"image" json:"image"`
	Name        string `db:"name" json:"name"`
	Description string `db:"description" json:"description"`
	Created     string `db:"created" json:"created"`
}

type ChatDTO struct {
	Message string `json:"message"`
}

type ContainersStatsDTO struct {
	Id            string `db:"id" json:"id"`
	Container     string `db:"container" json:"container"`
	StartDuration int64  `db:"start_duration" json:"start_duration"`
	StopDuration  int64  `db:"stop_duration" json:"stop_duration"`
	Method        string `db:"method" json:"method"`
	Created       string `db:"created" json:"created"`
	Updated       string `db:"updated" json:"updated"`
}

type CreateContainerStatsDTO struct {
	Id            string `db:"id" json:"id"`
	Container     string `db:"container" json:"container"`
	StartDuration int64  `db:"start_duration" json:"start_duration"`
	StopDuration  int64  `db:"stop_duration" json:"stop_duration"`
	Method        string `db:"method" json:"method"`
}

type ContainersStatsComputedDTO struct {
	Id               string  `db:"id" json:"id"`
	CountRequests    int64   `db:"count_requests" json:"count_requests"`
	AvgStartDuration float32 `db:"avg_start_duration" json:"avg_start_duration"`
	AvgStopDuration  float32 `db:"avg_stop_duration" json:"avg_stop_duration"`
}
