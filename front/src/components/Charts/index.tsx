"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  getComputedSatsByContainerId,
  getStatsByContainerId,
} from "../../api/containerStats";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";

export interface IChartProps {
  id: string;
}

export function Chart(props: IChartProps) {
  const { data: containerStats, isLoading } = useQuery({
    refetchOnWindowFocus: true,
    queryKey: ["getContainerDetails", props.id, "getStatsByContainerId"],
    queryFn: () => getStatsByContainerId(props.id),
  });

  const { data: computedContainerStats } = useQuery({
    refetchOnWindowFocus: true,
    queryKey: ["getContainerDetails", props.id, "getComputedSatsByContainerId"],
    queryFn: () => getComputedSatsByContainerId(props.id),
  });

  if (isLoading) {
    return null;
  }

  const chartConfig = {
    desktop: {
      label: "Start Duration",
      color: "hsl(var(--chart-1))",
    },
    mobile: {
      label: "Stop Duration",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Container Stats</CardTitle>
          <CardDescription>
            Showing all the stats for the container
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">
              Avg. Start Duration
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {(computedContainerStats?.data.avg_start_duration / 1000).toFixed(
                2,
              )}
              s
            </span>
          </div>
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">
              Avg. Stop Duration
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {(computedContainerStats?.data.avg_stop_duration / 1000).toFixed(
                2,
              )}
              s
            </span>
          </div>
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground"># of Requests</span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {computedContainerStats?.data.count_requests}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            width={600}
            height={300}
            data={containerStats?.data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="created" />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              dataKey="start_duration"
              fill="hsl(var(--chart-1))"
              radius={4}
            />
            <Bar
              dataKey="stop_duration"
              fill="hsl(var(--chart-2))"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
