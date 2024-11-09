import { api } from "./axios";

export interface IContainer {
  id: string;
  generated_script: string;
  status: string;
  image: string;
  name: string;
  description?: string;
}

export async function getUserContainers() {
  const res = await api.get<IContainer[]>("/docker/containers/list");
  return res;
}

export interface IContainerDetails {
  id: string;
  generated_script: string;
  status: string;
  image: string;
  name: string;
  script: string;
  description?: string;
  prompt: string;
}

export async function getContainerDetails(containerId: string) {
  const res = await api.get<IContainerDetails>(`/docker/containers/${containerId}/details`);
  return res;
}