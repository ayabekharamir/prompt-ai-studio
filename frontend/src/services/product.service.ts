import { api } from "./api";
import type { Product, ProductTemplate, TemplateFieldDefinition } from "@/types";

// --- Product Templates ---------------------------------------------------

export async function listProductTemplates(brandId: string): Promise<ProductTemplate[]> {
  const res = await api.get<ProductTemplate[]>(`/brands/${brandId}/product-templates`);
  return res.data;
}

export async function createProductTemplate(
  brandId: string,
  data: { name: string; description?: string; fields: TemplateFieldDefinition[] }
): Promise<ProductTemplate> {
  const res = await api.post<ProductTemplate>(`/brands/${brandId}/product-templates`, data);
  return res.data;
}

export async function updateProductTemplate(
  templateId: string,
  data: Partial<{ name: string; description: string; fields: TemplateFieldDefinition[] }>
): Promise<ProductTemplate> {
  const res = await api.patch<ProductTemplate>(`/product-templates/${templateId}`, data);
  return res.data;
}

export async function deleteProductTemplate(templateId: string): Promise<void> {
  await api.delete(`/product-templates/${templateId}`);
}

// --- Products --------------------------------------------------------------

export async function listProducts(brandId: string, templateId?: string): Promise<Product[]> {
  const res = await api.get<Product[]>(`/brands/${brandId}/products`, {
    params: templateId ? { template_id: templateId } : undefined,
  });
  return res.data;
}

export async function createProduct(
  brandId: string,
  data: { template_id: string; name: string; field_values: Record<string, unknown> }
): Promise<Product> {
  const res = await api.post<Product>(`/brands/${brandId}/products`, data);
  return res.data;
}

export async function updateProduct(
  productId: string,
  data: Partial<{ name: string; field_values: Record<string, unknown> }>
): Promise<Product> {
  const res = await api.patch<Product>(`/products/${productId}`, data);
  return res.data;
}

export async function deleteProduct(productId: string): Promise<void> {
  await api.delete(`/products/${productId}`);
}
