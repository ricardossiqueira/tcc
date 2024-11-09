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
import React, { useState } from "react";
import { getUserContainers } from "../../api/containers";



export function ContainerManagement() {



  const [selected, setSelected] = useState("");

  const { data: containers, refetch } = useQuery({
    refetchOnWindowFocus: true,
    queryKey: ["getUserContainers"],
    queryFn: () => getUserContainers(),
    refetchInterval: 5000,
  });


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
            </TableRow>
          </TableHeader>
          <TableBody>
            {containers?.data.map((container) => {
              return (
                <TableRow key={container.id} onClick={() => { setSelected(container.id) }} className={`cursor-pointer ${selected === container.id && "bg-yellow-500 hover:bg-yellow-400 text-black"}`} >
                  <TableCell className="font-medium">{container.id}</TableCell>
                  <TableCell>{container.status ?? "N/A"}</TableCell>
                  <TableCell>{container.image ?? "N/A"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
