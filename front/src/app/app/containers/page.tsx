"use client";

import React from "react";
import { getUserContainers } from "../../../api/containers";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Loading from "../../../components/Loading";
import { AppHeader } from "../../../components/Headers/AppHeader";
import ContainerStatus from "../../../components/ContainerStatus";

export default function App() {

  const { push } = useRouter();

  const { data: containers, isLoading } = useQuery({
    refetchOnWindowFocus: true,
    queryKey: ["getUserContainers"],
    queryFn: () => getUserContainers(),
    refetchInterval: 5000,
  });


  const navigateToContainer = (containerId: string) => {
    push(`/app/containers/${containerId}`);
  }

  if (isLoading) {
    return (
      <Loading />
    )
  }


  return (
    <>
      <AppHeader />
      <section className="container mx-auto grid grid-cols-2 grid-rows-4 gap-2 p-3" >
        <span className="col-span-2 row-span-1 flex items-center">
          <h1 className="text-2xl font-bold align-middle">Containers</h1>
        </span>
        {
          containers?.data.map((container) =>
            <Card
              key={container.id}
              onClick={() => navigateToContainer(container.id)}
              className="col-span-1 row-span-1 hover:bg-gradient-to-br from-yellow-200 to-yellow-500 cursor-pointer hover:text-black group hover:scale-[1.01] transition-transform duration-300 hover:z-10">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {container.name}
                  <ContainerStatus status={container.status} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base">
                  {container.description}
                </p >
              </CardContent>
              <CardFooter className="flex justify-end">
                <ArrowRight />
              </CardFooter>
            </Card>)
        }
      </section>
    </>
  );
}
