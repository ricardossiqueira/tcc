"use client"

import { Home, Container } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../../components/ui/sidebar"
import useUser from "../../hooks/useUser";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

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

  const { toggleSidebar } = useSidebar()


  if (pathIncludes(["/"])) return <></>;

  return (
    <Sidebar className="border-none" collapsible="icon">
      <SidebarHeader >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild onClick={toggleSidebar} className="cursor-pointer">
              <div>
                <Avatar className="w-8 h-8">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <span>
                  {user?.email}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent >
            <SidebarMenu >
              {items.map((item) => (
                <SidebarMenuItem key={item.title} >
                  <SidebarMenuButton size="lg" asChild>
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
