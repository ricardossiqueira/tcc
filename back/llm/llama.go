package llm

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"os"

	"github.com/openai/openai-go"
)

const BaseURL = "https://api.llama-api.com"
const Model = "deepseek-r1"

type Client struct {
	APIKey string
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type RequestPayload struct {
	MaxTokens int       `json:"max_tokens"`
	Messages  []Message `json:"messages"`
	Model     string    `json:"model"`
}

// let's use openai.ChatCompletion only for typing the response payload
// this lib isn't working anymore sadly
type ResponsePayload = *openai.ChatCompletion

func NewClient(apiKey string) *Client {
	return &Client{APIKey: apiKey}
}

func (c *Client) GenerateText(prompt string) (ResponsePayload, error) {
	url := BaseURL + "/chat/completions"

	systemPrompt1, err := os.ReadFile("llm/prompts/system_prompt_1.md")
	if err != nil {
		return nil, err
	}

	payload := RequestPayload{
		MaxTokens: 2000,
		Messages: []Message{
			{
				Role:    "system",
				Content: string(systemPrompt1),
			},
			{
				Role:    "user",
				Content: prompt,
			},
		},
		Model: Model,
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+c.APIKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("API request failed: " + string(body))
	}

	var responsePayload ResponsePayload
	err = json.NewDecoder(bytes.NewBuffer(body)).Decode(&responsePayload)
	if err != nil {
		return nil, err
	}

	return responsePayload, nil
}

func Run(userMessage string) (ResponsePayload, error) {
	apiKey := os.Getenv("LLAMA_API_KEY")
	client := NewClient(apiKey)

	result, err := client.GenerateText(userMessage)
	if err != nil {
		return nil, err
	}

	return result, nil
}
