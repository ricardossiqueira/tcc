"use client";

import { useParams } from "next/navigation";
import React from "react";
import { Chart } from "../../../../components/Charts";
import CodeEditor from "../../../../components/CodeEditor";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { getContainerDetails } from "../../../../api/containers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Textarea } from "../../../../components/ui/textarea";
import { Bomb, ContainerIcon, FileDown, FileUp, Rocket } from "lucide-react";
import Loading from "../../../../components/Loading";
import Options from "../../../../components/Options";
import { api } from "../../../../api/axios";
import ContainerStatus from "../../../../components/ContainerStatus";
import Drawer from "../../../../components/Drawers";
import { GET } from "../../../../components/Drawers/GET";
import PostRequestPayloadForm from "../../../../components/Forms/PostRequestPayloadForm";
import { Dialog, DialogTrigger } from "../../../../components/ui/dialog";

export default function App() {
  const { id } = useParams();

  const queryClient = useQueryClient();

  const { data: container, isLoading } = useQuery({
    refetchOnWindowFocus: true,
    queryKey: ["getContainerDetails", id],
    queryFn: () => getContainerDetails(id as string),
  });

  const { mutateAsync: startMutation, isPending: startPending } = useMutation({
    mutationFn: () => {
      return api.post(`/docker/containers/${id}/start`);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["getContainerDetails", id as string],
      }),
  });

  const { mutateAsync: stopMutation, isPending: stopPending } = useMutation({
    mutationFn: () => {
      return api.post(`/docker/containers/${id}/stop`);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["getContainerDetails", id as string],
      }),
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <section className="p-10 grid grid-cols-6 grid-rows-* gap-4">
        <div className="col-span-full row-span-1 row-start-1">
          <div className="flex items-center w-full justify-between">
            <span className="flex items-center">
              <ContainerIcon />
              <h1 className="ml-3 text-2xl font-bold align-middle">
                {container?.data.name}
              </h1>
            </span>
            <ContainerStatus status={container?.data.status} />
          </div>
        </div>
        <div className="row-start-2 col-start-1 col-span-3 row-span-2 grid grid-rows-2 gap-4">
          <div className="row-start-1 row-span-1 col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="resize-none h-28"
                  defaultValue={container?.data.prompt}
                  readOnly={true}
                />
              </CardContent>
              <CardFooter></CardFooter>
            </Card>
          </div>
          <div className="row-start-2 row-span-1 col-span-3 grid grid-rows-2 grid-cols-2 gap-4">
            <Options
              onClick={startMutation}
              isLoading={startPending}
              disabled={container?.data.status === "Up"}
              title="Start"
              content="Start your container"
              icon={<Rocket className="scale-[8] text-zinc-800 mr-14 -z-10" />}
            />
            <Options
              onClick={stopMutation}
              isLoading={stopPending}
              disabled={container?.data.status === "Stopped"}
              title="Stop"
              content="Stop running container"
              icon={<Bomb className="scale-[8] text-zinc-800 mr-14 -z-10" />}
            />
            <Drawer
              content={<GET containerId={id as string} />}
              disabled={startPending || stopPending}
            >
              <Options
                disabled={startPending || stopPending}
                title="GET"
                content="Make a GET request"
                icon={
                  <FileDown className="scale-[8] text-zinc-800 mr-14 -z-10" />
                }
              />
            </Drawer>
            <Dialog>
              <DialogTrigger>
                <Options
                  disabled={startPending || stopPending}
                  title="POST"
                  content="Make a POST request"
                  icon={
                    <FileUp className="scale-[8] text-zinc-800 mr-14 -z-10" />
                  }
                />
              </DialogTrigger>
              <PostRequestPayloadForm />
            </Dialog>
          </div>
          <div className="row-start-3 row-span-1 col-span-3">
            <Chart id={id as string} />
          </div>
        </div>
        <div className="col-span-3 row-start-2 row-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Deployed script</CardTitle>
              <CardDescription>
                Script currently deployed to the container.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeEditor readOnly={true} value={container?.data.script} />
            </CardContent>
            <CardFooter></CardFooter>
          </Card>
        </div>
      </section>
    </>
  );
}
