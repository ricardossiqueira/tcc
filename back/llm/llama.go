package llm

import (
	"context"
	"os"
	"strings"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

var systemPrompt = strings.Join([]string{
	"You are to generate a flask web service.",
	"Requirements:",
	"1. The service should run on port 5000.",
	"2. It must be a single Python file.",
	"3. The service should have only one route at the root ('/').",
	"4. Only GET or POST requests are allowed.",
	"5. Return ONLY the Python code, without formatting or explanations.",
	"6. Responses MUST ALWAYS be in JSON fromat.",
	"7. DO NOT format code using markdown ```.",
}, " ")

func Run(userMessage string) (*openai.ChatCompletion, error) {
	apiKey := os.Getenv("LLAMA_API_KEY")
	client := openai.NewClient(
		option.WithAPIKey(apiKey), // defaults to os.LookupEnv("OPENAI_API_KEY")
		option.WithBaseURL("https://api.llama-api.com"),
	)

	chatCompletion, err := client.Chat.Completions.New(context.TODO(), openai.ChatCompletionNewParams{
		MaxTokens:        openai.Int(2000),
		Temperature:      openai.Float(0.1),
		TopP:             openai.Float(1.0),
		FrequencyPenalty: openai.Float(1.0),
		Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
			openai.FunctionMessage("System", systemPrompt),
			openai.UserMessage(userMessage),
		}),
		Model: openai.F("llama3.1-70b"),
	})
	if err != nil {
		return nil, err
	}

	return chatCompletion, nil
}
