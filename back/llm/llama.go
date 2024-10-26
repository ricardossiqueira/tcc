package llm

import (
	"context"
	"fmt"
	"os"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

// TODO: Implement the prompt using openapi api
// Prompt:
//
// const apiRequestBase: IApiRequestJson = {
// 	"model": "gemma2-27b",
// 	"max_token": 2000,
// 	"temperature": 0.1,
// 	"top_p": 1.0,
// 	"frequency_penalty": 1.0,
// 	"messages":
// 		[
// 			{
// 				"role": "system",
// 				"content": (
// 					"You are to generate a flask web service. " +
// 					"Requirements: " +
// 					"1. The service should run on port 5000. " +
// 					"2. It must be a single Python file. " +
// 					"3. The service should have only one route at the root ('/'). " +
// 					"4. Only GET or POST requests are allowed. " +
// 					"5. Return only the Python code, without formatting or explanations." +
// 					"6. Responses MUST ALWAYS be in JSON fromat."
// 				)
// 			},
// 			{
// 				"role": "user",
// 				"content": ""
// 			}
// 		],
// 	"stream": false,
// };

func Run() *openai.ChatCompletion {
	apiKey := os.Getenv("LLAMA_API_KEY")
	fmt.Println("API Key: ", apiKey)
	client := openai.NewClient(
		option.WithAPIKey(apiKey), // defaults to os.LookupEnv("OPENAI_API_KEY")
		option.WithBaseURL("https://api.llama-api.com"),
	)
	chatCompletion, err := client.Chat.Completions.New(context.TODO(), openai.ChatCompletionNewParams{
		Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
			openai.UserMessage("Say this is a test"),
		}),
		Model: openai.F("llama3.1-70b"),
	})
	if err != nil {
		panic(err.Error())
	}
	return chatCompletion
}
