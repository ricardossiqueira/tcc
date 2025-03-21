"use client";

import { useEffect, useState } from "react";
import { ClipboardIcon, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Label } from "../ui/label";
import { useMutation, useMutationState } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { useForm } from "react-hook-form";
import {
  postRequestRawJSONSchema,
  PostRequestRawJSONSchema,
} from "../../zod/postRequestPayload";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import SyntaxHighlighter from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useToast } from "../../hooks/useToast";
import dayjs from "dayjs";

interface ContainerApiSimulatorTabProps {
  containerId: string;
}

interface HistoryItem {
  method: string;
  endpoint: string;
  response: string;
  timestamp: string;
}

export function ContainerApiSimulatorTab({
  containerId,
}: ContainerApiSimulatorTabProps) {
  const path = api.defaults.baseURL;
  const endpoint = path + "/docker/containers/" + containerId;
  const mutationKey = ["container", containerId];

  const [method, setMethod] = useState<"GET" | "POST">("GET");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The endpoint has been copied to your clipboard.",
      variant: "success",
    });
  }

  function processApiSuccess({ data, headers, config }) {
    setResponse(JSON.stringify(data, null, 2));
    setHistory((prev) => [
      {
        endpoint: config?.url,
        method: config?.method?.toUpperCase(),
        response: JSON.stringify(data, null, 2),
        timestamp: dayjs(headers?.["Date"])?.format("MMM, DD HH:mm:ss"),
      },
      ...prev.slice(0, 4),
    ]);
  }

  const { mutate: mutateGET, isPending: isGETPending } = useMutation({
    mutationFn: () => {
      return api.get(`/docker/containers/${containerId}`);
    },
    onSuccess: processApiSuccess,
    mutationKey,
  });

  const { mutate: mutatePOST, isPending: isPOSTPending } = useMutation({
    mutationFn: (payload) => {
      return api.post(`/docker/containers/${containerId}`, payload);
    },
    onSuccess: processApiSuccess,
    mutationKey,
  });

  const form = useForm<PostRequestRawJSONSchema>({
    resolver: zodResolver(postRequestRawJSONSchema),
    defaultValues: {
      payload: "",
    },
  });

  function onSubmit(values: PostRequestRawJSONSchema) {
    mutatePOST(JSON.parse(values.payload));
  }

  const handleRequest = () => {
    if (method === "GET") {
      mutateGET();
    } else if (method === "POST") {
      form.handleSubmit(onSubmit)();
    }
  };

  const data = useMutationState({
    filters: { mutationKey },
    select: (mutation) => mutation.state.data,
  });

  useEffect(() => {
    data && data.forEach(processApiSuccess);
  }, []);

  const isLoading = isGETPending || isPOSTPending;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>API Request</CardTitle>
          <CardDescription>
            Simulate API requests to the container
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Method</Label>
              <RadioGroup
                defaultValue="GET"
                className="flex"
                onValueChange={(value) => setMethod(value as "GET" | "POST")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="GET"
                    id="get"
                    className="cursor-pointer"
                  />
                  <Label htmlFor="get" className="cursor-pointer">
                    GET
                  </Label>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <RadioGroupItem
                    value="POST"
                    id="post"
                    className="cursor-pointer"
                  />
                  <Label htmlFor="post" className="cursor-pointer">
                    POST
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="endpoint"
                  value={endpoint}
                  readOnly
                  className="cursor-default"
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(endpoint)}
                  className="cursor-pointer"
                >
                  <ClipboardIcon />
                </Button>
              </div>
            </div>
            {method === "POST" && (
              <Form {...form}>
                <form>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="payload"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Request Body (JSON)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder='{"key": "value"}'
                              className="font-mono"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleRequest}
            isLoading={isLoading}
            className="w-full"
          >
            <Send className="mr-2 h-4 w-4" />
            Send Request
          </Button>
        </CardFooter>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Response</CardTitle>
          <CardDescription>API response from the container</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="response">
            <TabsList>
              <TabsTrigger value="response">Response</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="response">
              <SyntaxHighlighter
                language="json"
                style={oneDark}
                className="rounded-md bg-muted p-4 font-mono text-sm h-80 overflow-auto"
                showLineNumbers
              >
                {response ||
                  "// No response yet. Send a request to see the response."}
              </SyntaxHighlighter>
            </TabsContent>
            <TabsContent value="history">
              <div className="space-y-4 h-80 overflow-auto">
                {history.length > 0 ? (
                  history.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-md border border-border p-3 text-sm"
                    >
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">
                          {item.method} {item.endpoint}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.timestamp}
                        </span>
                      </div>
                      <SyntaxHighlighter
                        language="json"
                        style={oneDark}
                        className="bg-muted p-2 rounded font-mono text-xs overflow-auto max-h-32"
                        showLineNumbers
                      >
                        {item.response}
                      </SyntaxHighlighter>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No request history yet
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
