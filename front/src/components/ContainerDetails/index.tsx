"use client"
import { ArrowLeft, Play, RefreshCw, Square, Trash2 } from "lucide-react"
import Link from "next/link"
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { api } from "../../api/axios"
import { getContainerDetails } from "../../api/containers"
import { ContainerStatusBadge } from "../ContainerStatusBadge"
import Loading from "../Loading"
import { Button } from "../ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { ContainerMetricsTab } from "./ContainerMetricsTab"
import { ContainerApiSimulatorTab } from "./ContainerAPISimulatorTab"
import { motion } from "framer-motion"
import { ContainerDetailsTab } from "./ContainerDetailsTab"


const TabsValue = {
  METRICS: "METRICS",
  API: "API",
  DETAILS: "DETAILS",
  LOGS: "LOGS",
}

const DefaultTab = TabsValue.METRICS

export function ContainerDetails() {
  const { id } = useParams();

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

  const motionInitial = { opacity: 0, y: 20 };
  const motionAnimate = { opacity: 1, y: 0 };
  const motionTransition = { duration: 0.5 };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/app/containers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{container.name}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">{container.id.slice(0, 12)}</span>
            <ContainerStatusBadge status={container.status} />
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          {container.status === "Up" ? (
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

      <Tabs defaultValue={DefaultTab}>
        <TabsList>
          <TabsTrigger value={TabsValue.METRICS}>Metrics</TabsTrigger>
          <TabsTrigger value={TabsValue.API}>API Simulator</TabsTrigger>
          <TabsTrigger value={TabsValue.DETAILS}>Details</TabsTrigger>
          <TabsTrigger value={TabsValue.LOGS}>Logs</TabsTrigger>
        </TabsList>
        <TabsContent value={TabsValue.METRICS}>
          <motion.div initial={motionInitial} animate={motionAnimate} transition={motionTransition} >
            <ContainerMetricsTab id={container.id} />
          </motion.div>
        </TabsContent>
        <TabsContent value={TabsValue.API}>
          <motion.div initial={motionInitial} animate={motionAnimate} transition={motionTransition} >
            <ContainerApiSimulatorTab containerId={container.id} />
          </motion.div>
        </TabsContent>
        <TabsContent value={TabsValue.DETAILS}>
          <motion.div initial={motionInitial} animate={motionAnimate} transition={motionTransition} >
            <ContainerDetailsTab containerId={container.id} />
          </motion.div>
        </TabsContent>
        <TabsContent value={TabsValue.LOGS}>
          <motion.div initial={motionInitial} animate={motionAnimate} transition={motionTransition} >
            <Card>
              <CardHeader>
                <CardTitle>Container Logs</CardTitle>
                <CardDescription>Real-time logs from the container</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-md h-80 overflow-auto">
                  <div>Starting container {container.id.slice(0, 8)}...</div>
                  <div>Container started successfully</div>
                  <div>Initializing services...</div>
                  <div>Services initialized</div>
                  <div>Listening on port {container.port || "None"}</div>
                  <div>Ready to accept connections</div>
                  {container.status === "Stopped" && (
                    <>
                      <div className="text-red-500">ERROR: Connection refused</div>
                      <div className="text-red-500">ERROR: Service unavailable</div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}