import { api } from "./api";
import type { BrandAsset, BrandAssetCategory } from "@/types";

export async function listBrandAssets(brandId: string): Promise<BrandAsset[]> {
  const res = await api.get<BrandAsset[]>(`/brands/${brandId}/assets`);
  return res.data;
}

export async function uploadBrandAsset(
  brandId: string,
  file: File,
  category: BrandAssetCategory
): Promise<BrandAsset> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);

  const res = await api.post<BrandAsset>(`/brands/${brandId}/assets`, formData, {
    // Let the browser set the multipart boundary itself - the shared
    // axios instance defaults to "application/json", which would break
    // this upload if left in place.
    headers: { "Content-Type": undefined },
  });
  return res.data;
}

export async function deleteBrandAsset(assetId: string): Promise<void> {
  await api.delete(`/assets/${assetId}`);
}

/**
 * Fetches an asset's file bytes (auth required, same as any other API
 * call) and returns a local object URL suitable for an <img src>.
 * Caller is responsible for calling URL.revokeObjectURL(...) when done
 * with it (e.g. on unmount) to avoid leaking memory.
 */
export async function getBrandAssetObjectUrl(asset: BrandAsset): Promise<string> {
  const res = await api.get(asset.url, { responseType: "blob" });
  return URL.createObjectURL(res.data as Blob);
}
