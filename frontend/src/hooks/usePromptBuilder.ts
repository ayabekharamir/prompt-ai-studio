import { useMutation } from "@tanstack/react-query";
import {
  buildPrompt,
} from "@/services/prompts";

import type {
  BuildPromptRequest,
  BuildPromptResponse,
} from "@/types/prompts";


export function usePromptBuilder() {
  return useMutation<
    BuildPromptResponse,
    Error,
    BuildPromptRequest
  >({
    mutationFn: (payload) => buildPrompt(payload),
  });
}
