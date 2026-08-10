import { api } from "./api";
import type { Prompt, PromptTemplate } from "@/types";

export async function listPromptTemplates(
  category?: string
): Promise<PromptTemplate[]> {
  const res = await api.get<PromptTemplate[]>("/prompt-templates/", {
    params: category ? { category } : {},
  });
  return res.data;
}

export async function createPrompt(
  workspaceId: string,
  data: {
    title: string;
    content: string;
    brand_id?: string;
    template_id?: string;
  }
): Promise<Prompt> {
  const res = await api.post<Prompt>(
    `/prompts/workspaces/${workspaceId}/prompts`,
    data
  );
  return res.data;
}

export async function listPrompts(workspaceId: string): Promise<Prompt[]> {
  const res = await api.get<Prompt[]>(
    `/prompts/workspaces/${workspaceId}/prompts`
  );
  return res.data;
}

export async function executePrompt(
  promptId: string,
  data?: {
    provider?: string;
  }
): Promise<any> {
  const res = await api.post(`/prompts/${promptId}/execute`, data || {});
  return res.data;
}

export async function listPromptExecutions(
  promptId: string
): Promise<any[]> {
  const res = await api.get(`/prompts/${promptId}/executions`);
  return res.data;
}
