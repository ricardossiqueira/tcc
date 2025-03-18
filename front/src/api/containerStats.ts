import { api } from "./axios";

export interface IContainerStats {
  id: string;
  container: string;
  start_duration: number;
  stop_duration: number;
  method: string;
  created: string;
  updated: string;
}

async function getStatsByContainerId(containerId: string) {
  const res = await api.get<IContainerStats[]>(
    `/docker/containers/${containerId}/stats`,
  );
  return res;
}

const useGetStatsByContainerIdQuery = (containerId: string) => {
  return {
    queryKey: ["getContainerDetails", containerId, "getStatsByContainerId"],
    queryFn: () => getStatsByContainerId(containerId),
  };
}

export interface IComputedContainerStats {
  id: string;
  count_requests: number;
  avg_start_duration: number;
  avg_stop_duration: number;
}

async function getComputedSatsByContainerId(containerId: string) {
  const res = await api.get<IComputedContainerStats>(
    `/docker/containers/${containerId}/computed-stats`,
  );
  return res;
}

const useGetComputedStatsByContainerIdQuery = (containerId: string) => {
  return {
    queryKey: ["getContainerDetails", containerId, "getComputedSatsByContainerId"],
    queryFn: () => getComputedSatsByContainerId(containerId),
  };
}

export { useGetComputedStatsByContainerIdQuery, useGetStatsByContainerIdQuery };