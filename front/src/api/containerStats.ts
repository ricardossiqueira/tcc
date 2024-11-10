import { api } from "./axios";

export interface IContainerStats {
  id: string
  container: string
  start_duration: number
  stop_duration: number
  method: string
  created: string
  updated: string
}

export async function getStatsByContainerId(containerId: string) {
  const res = await api.get<IContainerStats[]>(`/docker/containers/${containerId}/stats`);
  return res;
}

export interface IComputedContainerStats {
  id: string
  count_requests: number
  avg_start_duration: number
  avg_stop_duration: number
}

export async function getComputedSatsByContainerId(containerId: string) {
  const res = await api.get<IComputedContainerStats>(`/docker/containers/${containerId}/computed-stats`);
  return res;
}