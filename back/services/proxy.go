package services

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

func ProxyPOST(targetURL string, data map[string]any) (int, map[string]*json.RawMessage) {
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

func ProxyGET(targetURL string) (int, map[string]*json.RawMessage) {
	resp, err := http.Get(targetURL)
	if err != nil {
		return http.StatusBadRequest, nil
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return http.StatusBadRequest, nil
	}
	defer resp.Body.Close()

	var v map[string]*json.RawMessage
	json.Unmarshal(body, &v)

	return http.StatusOK, v
}
