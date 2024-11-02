"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { api } from "../../api/axios";
import React from "react";
import Drawer from "../../components/Drawer/index";
import { HandleContainerButton } from "../HandleContainerButton";
import { GET } from "../Drawer/GET";
import { POST } from "../Drawer/POST";

export function ContainerManagement() {
  async function getUserContainers() {
    const res = await api.get("/docker/containers/list");
    return res;
  }

  const { data: containers, refetch } = useQuery({
    refetchOnWindowFocus: true,
    queryKey: ["getUserContainers"],
    queryFn: () => getUserContainers(),
    refetchInterval: 5000,
  });

  interface IContainer {
    id: string;
    generated_script: string;
    status: string;
    image: string;
  }

  return (
    <Card className="h-fit max-h-[50%]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Your Containers
          <Button
            onClick={() => refetch()}
            variant={"ghost"}
            size={"icon"}
            className="rounded-full"
          >
            <ReloadIcon />
            <span className="sr-only">
              Reload
            </span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Image</TableHead>
              <TableHead className="text-right">Options</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {containers?.data.map((container: IContainer) => {
              return (
                <TableRow key={container.id}>
                  <TableCell className="font-medium">{container.id}</TableCell>
                  <TableCell>{container.status ?? "N/A"}</TableCell>
                  <TableCell>{container.image ?? "N/A"}</TableCell>
                  <TableCell className="text-right flex justify-end">
                    {container.status === "Up" &&
                      (
                        <div>
                          <span className="mr-2">
                            <Drawer buttonTitle="GET">
                              <GET containerId={container.id} />
                            </Drawer>
                          </span>
                          <span className="mr-2">
                            <Drawer buttonTitle="POST">
                              <POST containerId={container.id} />
                            </Drawer>
                          </span>
                        </div>
                      )}
                    <HandleContainerButton
                      container={container}
                      refetch={refetch}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
