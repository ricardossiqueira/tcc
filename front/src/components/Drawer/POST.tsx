"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios.ts";

interface IPOSTProps {
  containerId: string;
}

export const POST = (props: IPOSTProps) => {
  const { data } = useQuery({
    refetchOnWindowFocus: true,
    queryKey: ["containersPOST"],
    queryFn: async () => {
      const res = await api.post(`/docker/containers/${props.containerId}`);
      return res.data;
    },
  });

  return (
    <div className="mx-2">
      <div className="flex py-1">
        <p className="font-JetBrainsMono mx-2 text-lg">🚀</p>
        <pre className="font-JetBrainsMono">{JSON.stringify(data, null, 2)}</pre>
      </div>
      <div className="flex py-1 items-center">
        <p className="font-JetBrainsMono mx-2 text-lg">
          🚀 <span className="text-base">Done...</span>
        </p>
        <pre className="w-[.50rem] h-[1.25rem] bg-white animate-terminal-blink" />
      </div>
    </div>
  );
};
