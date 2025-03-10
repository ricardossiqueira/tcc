"use client"
import { ArrowLeft, Play, RefreshCw, Square, Trash2 } from "lucide-react"
import Link from "next/link"
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query"
import { useParams, usePathname } from "next/navigation"
import { api } from "../../api/axios"
import { getContainerDetails } from "../../api/containers"
import { ContainerStatusBadge } from "../ContainerStatusBadge"
import Loading from "../Loading"
import { Button } from "../ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Chart } from "../Charts"
import { ContainerApiSimulator } from "../ContainerAPISimulator"


export function ContainerDetails() {
  const { id } = useParams();
  const path = usePathname();

  const queryClient = useQueryClient();

  const { data: container, isLoading } = useQuery({
    refetchOnWindowFocus: true,
    queryKey: ["getContainerDetails", id],
    queryFn: () => getContainerDetails(id as string),
  });

  const { mutateAsync: startContainer, isPending: startPending } = useMutation({
    mutationFn: () => {
      return api.post(`/docker/containers/${id}/start`);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["getContainerDetails", id as string],
      }),
  });

  const { mutateAsync: stopContainer, isPending: stopPending } = useMutation({
    mutationFn: () => {
      return api.post(`/docker/containers/${id}/stop`);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["getContainerDetails", id as string],
      }),
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/app/containers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{container.data.name}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">{container.data.id.slice(0, 12)}</span>
            <ContainerStatusBadge status={container.data.status} />
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          {container.data.status === "Up" ? (
            <Button variant="outline" onClick={() => stopContainer()} isLoading={stopPending}>
              <Square className="mr-2 h-4 w-4" />
              Stop
            </Button>
          ) : (
            <Button variant="outline" onClick={() => startContainer()} isLoading={startPending}>
              <Play className="mr-2 h-4 w-4" />
              Start
            </Button>
          )}

          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Restart
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="metrics">
        <TabsList>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="api">API Simulator</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="metrics">
          {/* <ContainerMetrics containerId={container.id} /> */}
          <Chart id={container.data.id} />
        </TabsContent>
        <TabsContent value="api">
          <ContainerApiSimulator containerId={container.data.id} />
        </TabsContent>
        <TabsContent value="details">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Container Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-[1fr_2fr] gap-2 text-sm">
                  <dt className="font-medium">ID:</dt>
                  <dd className="font-mono">{container.data.id}</dd>

                  <dt className="font-medium">Name:</dt>
                  <dd>{container.data.name}</dd>

                  <dt className="font-medium">Image:</dt>
                  <dd>{container.data.image}</dd>

                  <dt className="font-medium">Status:</dt>
                  <dd>
                    <ContainerStatusBadge status={container.data.status} />
                  </dd>

                  <dt className="font-medium">Created:</dt>
                  <dd>{container.data.created}</dd>

                  <dt className="font-medium">Ports:</dt>
                  <dd>{container.data.port}</dd>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generation Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Prompt</h4>
                    <div className="rounded-md bg-muted p-3 text-sm">
                      {container.data.prompt || "No prompt information available"}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1">Generation Code</h4>
                    <div className="rounded-md bg-muted p-3 font-mono text-xs">
                      {container.data.script || "No generation code available"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Container Logs</CardTitle>
              <CardDescription>Real-time logs from the container</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-md h-80 overflow-auto">
                <div>Starting container {container.data.id.slice(0, 8)}...</div>
                <div>Container started successfully</div>
                <div>Initializing services...</div>
                <div>Services initialized</div>
                <div>Listening on port {container.data.port || "None"}</div>
                <div>Ready to accept connections</div>
                {container.data.status === "Stopped" && (
                  <>
                    <div className="text-red-500">ERROR: Connection refused</div>
                    <div className="text-red-500">ERROR: Service unavailable</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}