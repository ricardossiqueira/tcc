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

type AvailableModels string

const (
	DeepseekR1   AvailableModels = "deepseek-r1"
	Llama3_3_70b AvailableModels = "llama3.3-70b"
)

var mapAvailableModels = map[AvailableModels]string{
	DeepseekR1:   "deepseek-r1",
	Llama3_3_70b: "llama3.3-70b",
}

type AvailablePrompts string

const (
	DescribeService AvailablePrompts = "llm/system_prompts/describe_service.md"
	CreateService   AvailablePrompts = "llm/system_prompts/create_service.md"
)

var mapAvailablePrompts = map[AvailablePrompts]string{
	DescribeService: "llm/system_prompts/describe_service.md",
	CreateService:   "llm/system_prompts/create_service.md",
}

type Client struct {
	APIKey       string
	SystemPrompt AvailablePrompts
	Model        AvailableModels
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

func NewClient() *Client {
	apiKey := os.Getenv("LLAMA_API_KEY")
	return &Client{APIKey: apiKey, SystemPrompt: "", Model: ""}
}

func (c *Client) SetSystemPrompt(systemPrompt AvailablePrompts) *Client {
	c.SystemPrompt = systemPrompt
	return c
}

func (c *Client) SetModel(model AvailableModels) *Client {
	c.Model = model
	return c
}

func (c *Client) generateText(prompt string) (ResponsePayload, error) {
	url := BaseURL + "/chat/completions"

	if c.SystemPrompt == "" || c.Model == "" {
		return nil, errors.New("system prompt and model are required")
	}

	systemPromptServiceGeneration, err := os.ReadFile(mapAvailablePrompts[c.SystemPrompt])
	if err != nil {
		return nil, err
	}

	payload := RequestPayload{
		MaxTokens: 2000,
		Messages: []Message{
			{
				Role:    "system",
				Content: string(systemPromptServiceGeneration),
			},
			{
				Role:    "user",
				Content: prompt,
			},
		},
		Model: mapAvailableModels[c.Model],
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

func (c *Client) Run(userMessage string) (ResponsePayload, error) {
	result, err := c.generateText(userMessage)
	if err != nil {
		return nil, err
	}
	return result, nil
}
