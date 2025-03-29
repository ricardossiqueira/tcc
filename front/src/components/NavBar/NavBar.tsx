"use client";

import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import NavBreadcrumb from "./Breadcrumb";
import { usePathname } from "next/navigation";
import useUser from "../../hooks/useUser";
import { Notifications } from "./Notifications";
import { Separator } from "../ui/separator";

export function AppHeader() {
  const { user, logout } = useUser();
  const path = usePathname();

  const pathIncludes = (urlList: string[]) => {
    return urlList.some((url) => path === url);
  };

  if (pathIncludes(["/login", "/register"]) || !user?.token) return <></>;

  return (
    <nav className="px-3 sm:px-6 flex items-center justify-between bg-white dark:bg-[#0F0F12] border-b border-gray-200 dark:border-[#1F1F23] h-16">
      <div className="font-medium text-sm hidden sm:flex items-center space-x-1 truncate">
        <NavBreadcrumb />
      </div>
      <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
        <DropdownMenu>
          <Notifications />
          <Separator orientation="vertical" className=" h-9" />
          <DropdownMenuTrigger className="focus:outline-none" asChild>
            <Avatar className="rounded-full ring-2 ring-gray-200 dark:ring-[#2B2B30]  w-8 h-8 cursor-pointer">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-[280px] sm:w-80 bg-background border-border rounded-lg shadow-lg"
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="ring-2 h-8 w-8 rounded-full ring-gray-200 dark:ring-[#2B2B30]">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt={user.name}
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="h-6 w-6" />
                <span className="ml-2">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
