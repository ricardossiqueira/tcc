"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { getUserContainers } from "../../api/containers";
import { ChevronDown } from "lucide-react";
import { Button } from "../ui/button";

export default function NavBreadcrumb() {
  const path = usePathname();
  const pathList = path.split("/").filter(Boolean);
  const { push } = useRouter();

  const { data: containers } = useQuery({
    refetchOnWindowFocus: true,
    queryKey: ["getUserContainers"],
    queryFn: () => getUserContainers(),
  });

  const containerName = (path: string) =>
    containers?.find((container) => container.id === path)?.name;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathList.map((path, index) =>
          index < pathList.length - 1 ? (
            <span key={index} className="flex items-center space-x-2">
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/${pathList.map((p, i) => (i <= index ? p : "")).join("/")}`}
                >
                  {path}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </span>
          ) : pathList
            .map((p, i) => (i <= index ? p : ""))
            .slice(0, pathList.length - 1)
            .join("/") === "app/containers" ? (
            <BreadcrumbItem key={index}>
              <DropdownMenu>
                {containerName(path)}
                <BreadcrumbPage className="flex items-center">
                  <DropdownMenuTrigger>
                    <Button variant="outline" size="icon" className="p-1 h-6 w-6" asChild>
                      <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                </BreadcrumbPage>
                <DropdownMenuContent>
                  {containers?.map((container) => (
                    <DropdownMenuItem
                      key={container.id}
                      onClick={() =>
                        push(
                          `/${[...pathList.map((p, i) => (i <= index ? p : "")).slice(0, pathList.length - 1), container.id].join("/")}`,
                        )
                      }
                      className="p-3 cursor-pointer "
                    >
                      {container.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          ) : (
            <BreadcrumbItem key={index}>
              <BreadcrumbPage>{path}</BreadcrumbPage>
            </BreadcrumbItem>
          ),
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
