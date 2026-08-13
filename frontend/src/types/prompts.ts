/**
 * Prompt related TypeScript definitions.
 *
 * These types mirror backend schemas:
 * - BuildPromptRequest
 * - BuildPromptResponse
 * - Prompt entities
 *
 * Prompt Builder works without AI.
 * It only combines existing workspace data:
 * Brand
 * Brand Identity
 * Brand Rules
 * Product
 * Persona
 * Prompt Template
 */


/**
 * Request payload for:
 *
 * POST /api/v1/prompts/build
 */
export interface BuildPromptRequest {
  brand_id: string;

  product_id?: string | null;

  persona_id?: string | null;

  prompt_template_id?: string | null;

  title?: string | null;

  task: string;

  extra_context?: Record<string, unknown> | null;
}


/**
 * Response payload from:
 *
 * POST /api/v1/prompts/build
 */
export interface BuildPromptResponse {
  title: string;

  content: string;

  brand_id: string;

  product_id?: string | null;

  persona_id?: string | null;

  prompt_template_id?: string | null;
}


/**
 * Basic Prompt object.
 *
 * Used by Prompt Library UI.
 */
export interface Prompt {
  id: string;

  title: string;

  content: string;

  workspace_id: string;

  brand_id?: string | null;

  product_id?: string | null;

  persona_id?: string | null;

  prompt_template_id?: string | null;

  created_at?: string;

  updated_at?: string;
}


/**
 * Prompt Template object.
 *
 * Used in Builder selector.
 */
export interface PromptTemplate {
  id: string;

  name: string;

  description?: string | null;

  template_body: string;

  created_at?: string;

  updated_at?: string;
}


/**
 * Brand object.
 *
 * Used in Builder selector.
 */
export interface Brand {
  id: string;

  name: string;

  description?: string | null;

  industry?: string | null;

  website?: string | null;
}


/**
 * Product object.
 *
 * Used in Builder selector.
 */
export interface Product {
  id: string;

  brand_id: string;

  name: string;

  description?: string | null;

  field_values?: Record<string, unknown> | null;
}


/**
 * Persona object.
 *
 * Used in Builder selector.
 */
export interface Persona {
  id: string;

  brand_id: string;

  name: string;

  description?: string | null;

  field_values?: Record<string, unknown> | null;
}


/**
 * Generic API error response.
 *
 * Matches backend error format.
 */
export interface ApiErrorResponse {
  error?: {
    code: string;

    message: string;

    details?: unknown;
  };

  detail?: unknown;
}
