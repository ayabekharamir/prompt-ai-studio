import { api } from "./api";

import type {
  BuildPromptRequest,
  BuildPromptResponse,
  Prompt,
} from "@/types/prompts";

/**
 * Build prompt without AI
 * POST /api/v1/prompts/build
 */
export async function buildPrompt(
  payload: BuildPromptRequest
): Promise<BuildPromptResponse> {
  const response = await api.post<BuildPromptResponse>(
    "/prompts/build",
    payload
  );
  return response.data;
}

/**
 * Create Prompt
 * POST /api/v1/prompts/workspaces/{workspace_id}/prompts
 */
export async function createPrompt(
  workspaceId: string,
  payload: {
    title: string;
    content: string;
    brand_id?: string | null;
    product_id?: string | null;
    persona_id?: string | null;
    prompt_template_id?: string | null;
  }
): Promise<Prompt> {
  const response = await api.post<Prompt>(
    `/prompts/workspaces/${workspaceId}/prompts`,
    payload
  );
  return response.data;
}

/**
 * List Prompts
 * GET /api/v1/prompts/workspaces/{workspace_id}/prompts
 */
export async function listPrompts(workspaceId: string): Promise<Prompt[]> {
  const response = await api.get<Prompt[]>(
    `/prompts/workspaces/${workspaceId}/prompts`
  );
  return response.data;
}

/**
 * Get Prompt
 * GET /api/v1/prompts/{prompt_id}
 */
export async function getPrompt(promptId: string): Promise<Prompt> {
  const response = await api.get<Prompt>(`/prompts/${promptId}`);
  return response.data;
}

/**
 * Update Prompt
 * PUT /api/v1/prompts/{prompt_id}
 */
export async function updatePrompt(
  promptId: string,
  payload: Partial<Prompt>
): Promise<Prompt> {
  const response = await api.put<Prompt>(`/prompts/${promptId}`, payload);
  return response.data;
}

/**
 * Delete Prompt
 * DELETE /api/v1/prompts/{prompt_id}
 */
export async function deletePrompt(promptId: string): Promise<void> {
  await api.delete(`/prompts/${promptId}`);
}

/**
 * Execute Prompt
 * POST /api/v1/prompts/{prompt_id}/execute
 */
export async function executePrompt(
  promptId: string,
  payload?: Record<string, unknown>
): Promise<unknown> {
  const response = await api.post(
    `/prompts/${promptId}/execute`,
    payload ?? {}
  );
  return response.data;
}
