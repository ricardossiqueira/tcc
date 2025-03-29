package router

import (
	"back/llm"
	"back/services"
	"back/types"
	"net/http"

	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

func LLM(se *core.ServeEvent, cn *services.Container) {
	g := se.Router.Group("/llm")

	//* Post to the llm chatbot //TODO: wrap this function in another file
	g.POST("/chat", func(re *core.RequestEvent) error {
		body := types.ChatDTO{}
		if err := re.BindBody(&body); err != nil {
			return apis.NewBadRequestError(err.Error(), nil)
		}
		if body.Message == "" {
			return apis.NewBadRequestError("Message is required", nil)
		}

		llmClient := llm.NewClient()
		chatCompletion, err := llmClient.SetModel(llm.DeepseekR1).SetSystemPrompt(llm.CreateService).Run(body.Message)
		if err != nil {
			return apis.NewBadRequestError(err.Error(), nil)
		}

		// return c.JSON(http.StatusOK, map[string]string{"message": chatCompletion.Choices[0].Message.Content})
		return re.JSON(http.StatusOK, chatCompletion)
	})
}
