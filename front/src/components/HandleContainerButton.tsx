"use client";

import { useMutation } from "@tanstack/react-query";
import React from "react";
import { api } from "../api/axios";
import { Button } from "./ui/button";

interface IContainer {
  id: string;
  generated_script: string;
  status: string;
  image: string;
}

export function HandleContainerButton(props: {
  container: IContainer;
  refetch: () => void;
}) {
  const { mutateAsync: startMutation, isPending: startPending } = useMutation({
    mutationFn: (id: string) => {
      return api.post(`/docker/containers/${id}/start`);
    },
    onSuccess: () => {
      props.refetch();
    },
  });

  const { mutateAsync: stopMutation, isPending: stopPending } = useMutation({
    mutationFn: (id: string) => {
      return api.post(`/docker/containers/${id}/stop`);
    },
    onSuccess: () => {
      props.refetch();
    },
  });

  return props.container.status === "Stopped" ? (
    <Button
      variant="default"
      isLoading={startPending}
      onClick={() => startMutation(props.container.id)}
    >
      Start
    </Button>
  ) : (
    <Button
      variant="destructive"
      isLoading={stopPending}
      onClick={() => stopMutation(props.container.id)}
    >
      Stop
    </Button>
  );
}
