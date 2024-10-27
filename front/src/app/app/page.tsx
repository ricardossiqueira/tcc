"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.tsx";
import { Button } from "../../components/ui/button.tsx";
import CodeEditor from "../../components/CodeEditor/index.tsx";
import { Textarea } from "../../components/ui/textarea.tsx";
import { ChangeEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ContainerManagement } from "../../components/ContainerManagement/index.tsx";
import { api } from "../../api/axios.ts";
import { useToast } from "../../hooks/useToast.ts";
import { ILlmResponse } from "../../interfaces/llm.ts";
import React from "react";

export default function App() {
  const [payload, setPayload] = useState(
    "Generate a function to say hello world!",
  );
  const [response, setResponse] = useState<ILlmResponse>();
  const { toast } = useToast();

  const handleSetPayload = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setPayload(e.target.value);

  const generateMutation = useMutation(
    {
      mutationFn: () => {
        return api.post<ILlmResponse>(
          "/llm/chat",
          {
            "message": payload,
          },
        );
      },
      onSuccess: (res) => {
        setResponse(res.data);
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
        });
      },
    },
  );

  const deployMutation = useMutation(
    {
      mutationFn: () => {
        return api.post(
          "/docker/containers/new",
          {
            payload: response,
          },
        );
      },
    },
  );

  return (
    <section className="flex flex-col w-full sm:flex-row p-3">
      <div>
        <Card className="w-full rounded-md h-fit">
          <CardHeader className="px-5 py-4">
            <CardTitle>
              Generate your function
            </CardTitle>
            <CardDescription>
              Describe the funcion you want to be generated and we handle the
              complexity.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5">
            <Textarea
              className="resize-none"
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
        <ContainerManagement />
      </div>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>
            Your generated function
          </CardTitle>
          <CardDescription>
            This is your AI generated function! Here you can edit it before
            deploing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeEditor value={response?.choices[0].message.content} />
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
    </section>
  );
}
