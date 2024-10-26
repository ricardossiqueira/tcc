"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CodeEditor from "@/components/CodeEditor";
import { Textarea } from "@/components/ui/textarea";
import { ChangeEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ContainerManagement } from "@/components/ContainerManagement";
import { api } from "@/api/axios";
import useUser from "@/hooks/useUser";

export default function App() {
  const [payload, setPayload] = useState(
    "Generate a function to say hello world!",
  );
  const [response, _setResponse] = useState("");
  const { user } = useUser();

  const handleSetPayload = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setPayload(e.target.value);

  // TODO: Use the golang be to handle this
  // const llamaMutation = useMutation(
  //   {
  //     mutationFn: () => {
  //       apiRequestBase.messages[1].content = payload
  //       return llamaAPI.run(apiRequestBase)
  //     }, onSuccess: (res) => {
  //       setResponse(trimCodeFormat(res.choices[0].message.content))
  //     }
  //   }
  // )

  const deployMutation = useMutation(
    {
      mutationFn: () => {
        return api.post(
          "http://localhost:8090/api/collections/generated_scripts/records",
          {
            "python_script": response,
            "payload": {},
            "owner": user?.id,
          },
        );
      },
    },
  );

  return (
    <section className="flex flex-col sm:flex-row p-3">
      <div className="flex justify-end px-1">
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
            <Button onClick={() => {}}>Generate</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="flex justify-end px-1">
        <Card className="w-full rounded-md">
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
            <CodeEditor value={response} />
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
      </div>

      <div className="flex justify-end px-1">
        <ContainerManagement />
      </div>
    </section>
  );
}
