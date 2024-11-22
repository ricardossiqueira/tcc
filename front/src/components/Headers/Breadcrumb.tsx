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
    containers?.data.find((container) => container.id === path)?.name;

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
                <DropdownMenuTrigger>
                  <BreadcrumbPage className="flex items-center">
                    {containerName(path)} <ChevronDown className="scale-75" />
                  </BreadcrumbPage>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black/5 backdrop-blur-sm">
                  {containers?.data.map((container) => (
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
