"use client"

import { usePathname } from "next/navigation";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "../ui/breadcrumb";


export default function NavBreadcrumb() {
  const path = usePathname();
  const pathList = path.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathList.map((path, index) => (
          index < pathList.length - 1 ?
            <span key={index} className="flex items-center space-x-2">
              <BreadcrumbItem >
                <BreadcrumbLink href={`/${pathList.map((p, i) => i <= index ? p : "").join("/")}`}>{path}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </span>
            :
            <BreadcrumbItem key={index}>
              <BreadcrumbPage>{path}</BreadcrumbPage>
            </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}