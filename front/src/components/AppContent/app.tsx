"use client";

import React, { useState } from "react";
import { Rocket } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Textarea } from "../ui/textarea";
import ReactCodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { AIButton } from "../AIButton";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { useToast } from "../../hooks/useToast";
import { ILlmResponse } from "../../interfaces/llm";
import { aura } from "@uiw/codemirror-theme-aura";

interface TipCardProps {
  children: React.ReactNode;
}

const TipCard = ({ children }: TipCardProps) => (
  <div className="p-3 bg-gray-500/10 rounded-lg">{children}</div>
);

interface TipProps {
  children: React.ReactNode;
  emoji?: string;
}

const TipTitle = ({ children, emoji }: TipProps) => (
  <h3 className="font-medium mb-2 flex text-center">
    {emoji && <span className="text-xl mr-2">{emoji}</span>}
    {children}
  </h3>
);

const TipsList = () => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center cursor-pointer">
        <h2 className="text-xl font-semibold">Help & Tips</h2>
      </div>

      <div className="mt-4 space-y-4">
        <TipCard>
          <TipTitle emoji="🤔">Effective Prompts</TipTitle>
          <p className="text-sm text-gray-300">
            Be specific about what you want. For example, instead of
            &quot;Create a calculator&quot;, try &quot;Create a service that
            returns the sum of two numbers&quot;.
          </p>
        </TipCard>

        <TipCard>
          <TipTitle emoji="✍️">Example Prompts:</TipTitle>
          <ul className="text-sm text-gray-300 list-disc list-inside space-y-1">
            <li>
              Create a json parser that can parse a json string and return an
              object
            </li>
            <li>
              Create a random data generator that can generate random name,
              email and address
            </li>
            <li>
              Create a service that scrapes data from the homepage of wikipedia
            </li>
          </ul>
        </TipCard>

        <TipCard>
          <TipTitle emoji="🤓">Editor Tips:</TipTitle>
          <ul className="text-sm text-gray-300 list-disc list-inside space-y-1">
            <li>Review and edit the generated code before deploying</li>
            <li>
              The editor supports syntax highlighting for better readability
            </li>
            <li>
              Click &quot;Deploy Code&quot; to send your code to a container
            </li>
          </ul>
        </TipCard>
      </div>
    </CardContent>
  </Card>
);

export function AppContent() {
  const [payload, setPayload] = useState(
    "Create a service that returns the sum of two numbers.",
  );
  const [response, setResponse] = useState<ILlmResponse>();
  const { toast } = useToast();

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
        description: "You will be notified when it is ready.",
        variant: "success",
      });
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
            content: value ? value.toString() : "",
            role: response?.choices?.[0]?.message.role,
          },
          finish_reason: "",
          index: 0,
          logprobs: {
            content: "",
            refusal: "",
          },
        },
      ],
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Prompt Input</h2>
          </CardHeader>
          <CardContent className="flex flex-col items-end">
            <span className="text-xs text-gray-500/70">Model: deepseek-r1</span>
            <Textarea
              placeholder="Describe the functionality you want to generate..."
              className="min-h-[150px] mb-4 bg-background resize-none"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
            />
            <div className="w-full mt-2">
              <AIButton
                className="transition-transform duration-300 ease-in-out"
                isLoading={generateMutation.isPending}
                onClick={() => generateMutation.mutate()}
              />
            </div>
          </CardContent>
        </Card>

        <TipsList />
      </div>

      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row justify-between">
          <h2 className="text-xl font-semibold">Code Editor</h2>
          <Button
            onClick={() => deployMutation.mutate()}
            isLoading={deployMutation.isPending}
            className="bg-purple-600 hover:bg-purple-500"
          >
            <Rocket className="mr-2 h-4 w-4" />
            Deploy Code
          </Button>
        </CardHeader>
        <CardContent className="h-full flex">
          <div className="relative flex-1">
            <div className="absolute top-0 left-0 right-0 bg-purple-600 text-xs font-semibold px-4 py-1 rounded-t-md w-fit">
              main.py
            </div>
            <ReactCodeMirror
              value={response?.choices?.[0].message.content}
              theme={aura}
              extensions={[python()]}
              className="pt-6 h-full"
              onChange={handleCodeEditorChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
