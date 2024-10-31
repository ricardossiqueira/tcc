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
import WaveParticles from "../../components/WaveBackground/index.tsx";

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
    <section className="grid grid-cols-5 grid-rows-4 gap-8 w-full sm:flex-row p-3 px-[10%]">
      <WaveParticles />
      <Card className="w-full h-full col-span-2 row-span-1">
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

      <Card className="col-span-3 row-span-5 h-fit">
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

      <div className="col-span-2 row-span-4">
        <ContainerManagement />
      </div>
    </section>
  );
}
