"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpDown, MoreHorizontal, Play, RefreshCw, Square, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { toDate } from "date-fns"
import { IContainer, getUserContainers } from "../../api/containers"
import { ContainerStatusBadge } from "../ContainerStatusBadge"
import Loading from "../Loading"
import { Button } from "../ui/button"
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "../ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"


export default function ContainerList() {
  // const { containers, startContainer, stopContainer } = useContainers()
  const [sortField, setSortField] = useState<keyof IContainer>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const { data: containers, isLoading } = useQuery({
    refetchOnWindowFocus: true,
    queryKey: ["getUserContainers"],
    queryFn: () => getUserContainers(),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return <Loading />;
  }

  const handleSort = (field: keyof IContainer) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedContainers = [...containers?.data].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1
    if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  return (
    <div className="rounded-md border-border border p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">
              <Button
                variant="ghost"
                onClick={() => handleSort("id")}
                className="flex items-center gap-1 p-0 font-medium"
              >
                ID
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("name")}
                className="flex items-center gap-1 p-0 font-medium"
              >
                Name
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("status")}
                className="flex items-center gap-1 p-0 font-medium"
              >
                Status
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("image")}
                className="flex items-center gap-1 p-0 font-medium"
              >
                Image
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("created")}
                className="flex items-center gap-1 p-0 font-medium"
              >
                Created
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedContainers.map((container) => (
            <TableRow key={container.id}>
              <TableCell className="font-mono text-xs">{container.id.slice(0, 8)}</TableCell>
              <TableCell>
                <Link href={`/app/containers/${container.id}`} className="font-medium hover:underline">
                  {container.name}
                </Link>
              </TableCell>
              <TableCell>
                <ContainerStatusBadge status={container.status} />
              </TableCell>
              <TableCell>{container.image}</TableCell>
              <TableCell>{toDate(container.created).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {container.status === "Up" ? (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => { }}
                      title="Stop Container"
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => { }}
                      title="Start Container"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Restart
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
