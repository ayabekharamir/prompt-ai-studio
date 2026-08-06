/**
 * Shared TypeScript types for Prompt AI Studio frontend.
 * Mirrors the backend Pydantic schemas (see backend/app/schemas/).
 */

export interface User {
  id: string;
  full_name: string;
  email?: string | null;
  phone_number?: string | null;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
}

export interface Brand {
  id: string;
  workspace_id: string;
  name: string;
  industry?: string | null;
  website?: string | null;
  description?: string | null;
  logo_url?: string | null;
  created_at: string;
}

export interface BrandIdentity {
  id: string;
  brand_id: string;
  mission?: string | null;
  vision?: string | null;
  target_audience?: string | null;
  tone_of_voice?: string | null;
  core_values?: string | null;
  unique_selling_point?: string | null;
  brand_personality?: string | null;
}

export interface BrandRule {
  id: string;
  brand_id: string;
  rule_type: string;
  title: string;
  description?: string | null;
}

export interface PromptTemplate {
  id: string;
  workspace_id?: string | null;
  title: string;
  category: string;
  description?: string | null;
  template_body: string;
  created_at: string;
}

export interface Prompt {
  id: string;
  workspace_id: string;
  created_by: string;
  brand_id?: string | null;
  template_id?: string | null;
  title: string;
  content: string;
  status: "draft" | "saved" | "archived";
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
