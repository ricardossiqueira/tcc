package llm

import (
	"context"
	"os"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

func Run(userMessage string) (*openai.ChatCompletion, error) {
	apiKey := os.Getenv("LLAMA_API_KEY")
	client := openai.NewClient(
		option.WithAPIKey(apiKey), // defaults to os.LookupEnv("OPENAI_API_KEY")
		option.WithBaseURL("https://api.llama-api.com"),
	)

	systemPrompt1, err := os.ReadFile("llm/prompts/system_prompt_1.md")
	if err != nil {
		return nil, err
	}

	chatCompletion, err := client.Chat.Completions.New(context.TODO(), openai.ChatCompletionNewParams{
		MaxTokens: openai.Int(2000),
		Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
			openai.SystemMessage(string(systemPrompt1)),
			openai.UserMessage(userMessage),
		}),
		Model: openai.F("llama3.1-70b"),
	})
	if err != nil {
		return nil, err
	}

	return chatCompletion, nil
}
