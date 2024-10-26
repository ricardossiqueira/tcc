package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"slices"
	"strconv"
	"time"
)

const MAX_PORT int = 65535 // 2^16-1 max for TCP

type portError struct {
	message string
}

func Proxy(targetURL string, data map[string]any) (int, map[string]*json.RawMessage) {
	body, _ := json.Marshal(data)
	resp, err := http.Post(targetURL, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return http.StatusBadRequest, nil
	}

	body, err = io.ReadAll(resp.Body)
	if err != nil {
		return http.StatusBadRequest, nil
	}
	defer resp.Body.Close()

	var v map[string]*json.RawMessage
	json.Unmarshal(body, &v)

	return http.StatusOK, v
}

func portScan(server string) []int {
	var available []int
	for i := 1; i <= MAX_PORT; i++ {
		ip := server + ":" + strconv.Itoa(i)
		_, err := net.DialTimeout("tcp", ip, time.Duration(300)*time.Millisecond)
		if err == nil {
			available = append(available, i)
		}
	}
	return available
}

func (e *portError) Error() string {
	return fmt.Sprintf("%s", e.message)
}

func AllocatePort() (string, error) {
	unavailablePorts := portScan("localhost")
	for port := 2; port <= MAX_PORT; port++ {
		if !slices.Contains(unavailablePorts, port) {
			return strconv.Itoa(port), nil
		}
	}
	return "", &portError{"No ports available"}
}
