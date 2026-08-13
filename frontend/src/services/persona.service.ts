import { api } from "./api";
import type { Persona, PersonaTemplate, TemplateFieldDefinition } from "@/types";

// --- Persona Templates ---------------------------------------------------

export async function listPersonaTemplates(brandId: string): Promise<PersonaTemplate[]> {
  const res = await api.get<PersonaTemplate[]>(`/brands/${brandId}/persona-templates`);
  return res.data;
}

export async function createPersonaTemplate(
  brandId: string,
  data: { name: string; description?: string; fields: TemplateFieldDefinition[] }
): Promise<PersonaTemplate> {
  const res = await api.post<PersonaTemplate>(`/brands/${brandId}/persona-templates`, data);
  return res.data;
}

export async function updatePersonaTemplate(
  templateId: string,
  data: Partial<{ name: string; description: string; fields: TemplateFieldDefinition[] }>
): Promise<PersonaTemplate> {
  const res = await api.patch<PersonaTemplate>(`/persona-templates/${templateId}`, data);
  return res.data;
}

export async function deletePersonaTemplate(templateId: string): Promise<void> {
  await api.delete(`/persona-templates/${templateId}`);
}

// --- Personas --------------------------------------------------------------

export async function listPersonas(brandId: string, templateId?: string): Promise<Persona[]> {
  const res = await api.get<Persona[]>(`/brands/${brandId}/personas`, {
    params: templateId ? { template_id: templateId } : undefined,
  });
  return res.data;
}

export async function createPersona(
  brandId: string,
  data: { template_id: string; name: string; field_values: Record<string, unknown> }
): Promise<Persona> {
  const res = await api.post<Persona>(`/brands/${brandId}/personas`, data);
  return res.data;
}

export async function updatePersona(
  personaId: string,
  data: Partial<{ name: string; field_values: Record<string, unknown> }>
): Promise<Persona> {
  const res = await api.patch<Persona>(`/personas/${personaId}`, data);
  return res.data;
}

export async function deletePersona(personaId: string): Promise<void> {
  await api.delete(`/personas/${personaId}`);
}
