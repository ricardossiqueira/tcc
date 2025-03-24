package services

import (
	"errors"
	"net"
	"strconv"
	"sync"
	"time"
)

const MAX_PORT int = 65535 // 2^16-1 max for TCP

func portScan(server string) map[string]int {
	available := make(map[string]int)
	for i := 1; i <= MAX_PORT; i++ {
		ip := server + ":" + strconv.Itoa(i)
		_, err := net.DialTimeout("tcp", ip, time.Duration(300)*time.Millisecond)
		if err == nil {
			available[strconv.Itoa(i)] = i
		}
	}
	return available
}

type PortMap struct {
	AllocatedPorts map[string]int
	mu             sync.Mutex
}

func NewPortMap() *PortMap {
	return &PortMap{
		AllocatedPorts: portScan("localhost"),
		mu:             sync.Mutex{},
	}
}

func (pm *PortMap) AllocatePort() (string, error) {
	pm.mu.Lock()
	defer pm.mu.Unlock()
	for port := 2; port <= MAX_PORT; port++ {
		if _, ok := pm.AllocatedPorts[strconv.Itoa(port)]; !ok {
			pm.AllocatedPorts[strconv.Itoa(port)] = port
			return strconv.Itoa(port), nil
		}
	}

	return "", errors.New("No ports available")
}

func (pm *PortMap) ReleasePort(port string) {
	pm.mu.Lock()
	defer pm.mu.Unlock()
	delete(pm.AllocatedPorts, port)
}
