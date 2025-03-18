import { api } from "./axios";

export type ContainerStatuses = "Up" | "Stopped";

export interface IContainer {
  id: string;
  generated_script: string;
  status: ContainerStatuses;
  image: string;
  name: string;
  description?: string;
  created: string;
}

async function getUserContainers() {
  const res = await api.get<IContainer[]>("/docker/containers/list");
  return res.data;
}

const useGetUserContainersQuery = <T = IContainer[]>() => {
  return {
    queryKey: ["getUserContainers"],
    queryFn: () => getUserContainers() as Promise<T>,
  };
}

export interface IContainerDetails {
  id: string;
  docker_id: string;
  script: string;
  status: ContainerStatuses;
  image: string;
  owner: string;
  port: string;
  name: string;
  description?: string;
  prompt: string;
  script_id: string;
  created: string;
  updated: string;
}

async function getContainerDetails(containerId: string) {
  const res = await api.get<IContainerDetails>(
    `/docker/containers/${containerId}/details`,
  );
  return res.data;
}

const useGetContainerDetailsQuery = (containerId: string) => {
  return {
    queryKey: ["getContainerDetails", containerId],
    queryFn: () => getContainerDetails(containerId),
  };
}

export { useGetContainerDetailsQuery, useGetUserContainersQuery };