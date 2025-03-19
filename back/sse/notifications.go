package sse

import "time"

type Notification struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"`
	Timestamp   time.Time `json:"timestamp"`
	Data        string    `json:"data"`
	UserID      string    `json:"user_id"`
	Message     string    `json:"message"`
	ContainerID string    `json:"container_id"`
}
