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
