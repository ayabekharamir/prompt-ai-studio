import { api } from "./api";
import type { Workspace } from "@/types";

export async function createWorkspace(name: string): Promise<Workspace> {
  const res = await api.post<Workspace>("/workspaces/", { name });
  return res.data;
}

export async function listWorkspaces(): Promise<Workspace[]> {
  const res = await api.get<Workspace[]>("/workspaces/");
  return res.data;
}

export async function getWorkspace(workspaceId: string): Promise<Workspace> {
  const res = await api.get<Workspace>(`/workspaces/${workspaceId}`);
  return res.data;
}
