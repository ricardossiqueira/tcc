"use client";

import { useMutation } from "@tanstack/react-query";
import React from "react";
import { api } from "../api/axios.ts";
import { Button } from "./ui/button.tsx";

interface IContainer {
  id: string;
  generated_script: string;
  status: string;
  image: string;
}

export function HandleContainerButton(
  props: { container: IContainer; refetch: () => void },
) {
  const { mutateAsync: startMutation, isPending: startPending } = useMutation(
    {
      mutationFn: (id: string) => {
        return api.post(
          `/docker/containers/${id}/start`,
        );
      },
      onSuccess: () => {
        props.refetch();
      },
    },
  );

  const { mutateAsync: stopMutation, isPending: stopPending } = useMutation(
    {
      mutationFn: (id: string) => {
        return api.post(
          `/docker/containers/${id}/stop`,
        );
      },
      onSuccess: () => {
        props.refetch();
      },
    },
  );

  return (props.container.status === "Stopped"
    ? (
      <Button
        variant="default"
        loading={startPending}
        onClick={() => startMutation(props.container.id)}
      >
        Start
      </Button>
    )
    : (
      <Button
        variant="destructive"
        loading={stopPending}
        onClick={() => stopMutation(props.container.id)}
      >
        Stop
      </Button>
    ));
}
