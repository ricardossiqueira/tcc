"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import CodeEditor from "../../components/CodeEditor/index";
import { Textarea } from "../../components/ui/textarea";
import { ChangeEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { useToast } from "../../hooks/useToast";
import { ILlmResponse } from "../../interfaces/llm";
import React from "react";
import { useRouter } from "next/navigation";

export default function App() {
  const [payload, setPayload] = useState(
    "Generate a function to say hello world!",
  );
  const [response, setResponse] = useState<ILlmResponse>();
  const { toast } = useToast();
  const { push } = useRouter();

  const handleSetPayload = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setPayload(e.target.value);

  const generateMutation = useMutation({
    mutationFn: () => {
      return api.post<ILlmResponse>("/llm/chat", {
        message: payload,
      });
    },
    onSuccess: (res) => {
      setResponse(res.data);
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
    retry: 3,
  });

  const deployMutation = useMutation({
    mutationFn: () => {
      return api.post("/docker/containers/new", {
        payload: response,
        prompt: payload,
      });
    },
    onSuccess: () => {
      toast({
        title: "Container created",
        description: "Redirecting to your container list.",
        variant: "success",
      });
      push("/app/containers");
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleCodeEditorChange = (value: string | undefined) => {
    setResponse({
      ...response,
      choices: [
        {
          message: {
            content: value.toString(),
            role: response?.choices[0].message.role,
          },
          finish_reason: "",
          index: 0,
          logprobs: undefined,
        },
      ],
    });
  };

  return (
    <>
      <section className="grid grid-cols-5 grid-rows-4 gap-8 w-full p-3 px-[20%] sm:px-[5%] lg:px-[15%] xl:px-[5%]">
        <Card className="w-full h-full col-span-2 row-span-1">
          <CardHeader className="px-5 py-4">
            <CardTitle>Generate your function</CardTitle>
            <CardDescription>
              Describe the funcion you want to be generated and we handle the
              complexity.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5">
            <Textarea
              className="resize-none h-28"
              onChange={handleSetPayload}
              value={payload}
            />
          </CardContent>
          <CardFooter className="px-5">
            <Button
              loading={generateMutation.isPending}
              onClick={() => generateMutation.mutate()}
            >
              Generate
            </Button>
          </CardFooter>
        </Card>

        <Card className="col-span-3 row-span-4 h-fit">
          <CardHeader>
            <CardTitle>Your generated function</CardTitle>
            <CardDescription>
              This is your AI generated function! Here you can edit it before
              deploing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeEditor
              value={response?.choices?.[0].message.content}
              onChange={handleCodeEditorChange}
            />
          </CardContent>
          <CardFooter>
            <Button
              loading={deployMutation.isPending}
              onClick={() => deployMutation.mutate()}
            >
              Deploy
            </Button>
          </CardFooter>
        </Card>

        <Alert className="h-fit col-span-2 row-span-1">
          <div className="flex space-x-2">
            <span className="text-lg">🚀</span>
            <div>
              <AlertTitle className="font-bold text-base">
                Welcome to the AI Function Generator!
              </AlertTitle>
              <AlertDescription>
                This is a simple AI function generator. Describe the function
                you want to be generated and we will handle the complexity.
              </AlertDescription>
            </div>
          </div>
        </Alert>
      </section>
    </>
  );
}
