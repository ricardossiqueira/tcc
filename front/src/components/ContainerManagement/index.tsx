"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { api } from "@/api/axios";

export function ContainerManagement() {
  async function getUserContainers() {
    const res = await api.get("/docker/containers/list");
    return res;
  }

  const { data: containers, refetch } = useQuery({
    refetchOnWindowFocus: true,
    queryKey: ["getUserContainers"],
    queryFn: () => getUserContainers(),
  });

  interface IContainer {
    id: string;
    generated_script: string;
    status: string;
    image: string;
  }

  return (
    <Card className="w-full rounded-md p-5">
      <CardTitle className="flex justify-between items-center">
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
      <CardContent>
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
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
                  <TableCell className="text-right">
                    Foo
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
