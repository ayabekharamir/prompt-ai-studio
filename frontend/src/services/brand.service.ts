import { api } from "./api";
import type { Brand, BrandIdentity, BrandRule } from "@/types";

export async function createBrand(
  workspaceId: string,
  data: { name: string; industry?: string; website?: string; description?: string }
): Promise<Brand> {
  const res = await api.post<Brand>(`/brands/workspaces/${workspaceId}/brands`, data);
  return res.data;
}

export async function listBrands(workspaceId: string): Promise<Brand[]> {
  const res = await api.get<Brand[]>(`/brands/workspaces/${workspaceId}/brands`);
  return res.data;
}

export async function getBrand(brandId: string): Promise<Brand> {
  const res = await api.get<Brand>(`/brands/${brandId}`);
  return res.data;
}

export async function updateBrand(
  brandId: string,
  data: { name?: string; industry?: string; website?: string; description?: string }
): Promise<Brand> {
  const res = await api.put<Brand>(`/brands/${brandId}`, data);
  return res.data;
}

export async function deleteBrand(brandId: string): Promise<void> {
  await api.delete(`/brands/${brandId}`);
}

export async function getBrandIdentity(brandId: string): Promise<BrandIdentity | null> {
  try {
    const res = await api.get<BrandIdentity>(`/brand-brain/${brandId}/identity`);
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

export async function upsertBrandIdentity(
  brandId: string,
  data: Partial<BrandIdentity>
): Promise<BrandIdentity> {
  const res = await api.put<BrandIdentity>(`/brand-brain/${brandId}/identity`, data);
  return res.data;
}

export async function listBrandRules(brandId: string): Promise<BrandRule[]> {
  const res = await api.get<BrandRule[]>(`/brand-brain/${brandId}/rules`);
  return res.data;
}

export async function createBrandRule(
  brandId: string,
  data: { rule_type: string; title: string; description?: string }
): Promise<BrandRule> {
  const res = await api.post<BrandRule>(`/brand-brain/${brandId}/rules`, data);
  return res.data;
}

export async function updateBrandRule(
  ruleId: string,
  data: { rule_type?: string; title?: string; description?: string }
): Promise<BrandRule> {
  const res = await api.put<BrandRule>(`/brand-brain/rules/${ruleId}`, data);
  return res.data;
}

export async function deleteBrandRule(ruleId: string): Promise<void> {
  await api.delete(`/brand-brain/rules/${ruleId}`);
}
