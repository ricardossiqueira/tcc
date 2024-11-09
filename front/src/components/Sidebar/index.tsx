"use client"

import { Home, Container } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../components/ui/sidebar"
import useUser from "../../hooks/useUser";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "../ui/tooltip";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/app",
    icon: Home,
  },
  {
    title: "Containers",
    url: "/app/containers",
    icon: Container,
  },
]

export function AppSidebar() {
  const { user } = useUser();

  const path = usePathname();

  const pathIncludes = (urlList: string[]) => {
    return urlList.some((url) => path === url);
  }


  if (pathIncludes(["/"])) return <></>;

  return (
    <Sidebar className="bg-transparent" collapsible="icon">
      <SidebarContent className="bg-black/5 backdrop-blur-sm">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>{user?.email}</SidebarGroupLabel>
          <SidebarGroupContent >

            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} >
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="group-data-[state=expanded]:hidden">
          <SidebarGroupContent >
            <SidebarMenu>
              <SidebarMenuItem >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <TooltipContent side="right" >
                        {user?.email}
                      </TooltipContent>
                    </TooltipTrigger>
                  </Tooltip>
                </TooltipProvider>
              </SidebarMenuItem>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} >
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
