"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import PromptBuilderForm from "@/components/prompts/PromptBuilderForm";
import PromptPreview from "@/components/prompts/PromptPreview";

import { listBrands } from "@/services/brand.service";
import { listPromptTemplates } from "@/services/prompt.service";

import type {
  BuildPromptResponse,
  Brand,
  PromptTemplate,
} from "@/types/prompts";

function mapBrand(b: {
  id: string;
  name: string;
  description?: string | null;
  industry?: string | null;
  website?: string | null;
}): Brand {
  return {
    id: b.id,
    name: b.name,
    description: b.description ?? null,
    industry: b.industry ?? null,
    website: b.website ?? null,
  };
}

function mapTemplate(t: {
  id: string;
  title?: string;
  name?: string;
  description?: string | null;
  template_body: string;
  created_at?: string;
}): PromptTemplate {
  return {
    id: t.id,
    // بک‌اند title دارد؛ فرم name می‌خواهد
    name: t.name ?? t.title ?? "بدون نام",
    description: t.description ?? null,
    template_body: t.template_body,
    created_at: t.created_at,
  };
}

export default function PromptBuilderPage() {
  const params = useParams();
  const workspaceId = String(params?.workspaceId ?? "");

  const [brands, setBrands] = useState<Brand[]>([]);
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([]);
  const [generatedPrompt, setGeneratedPrompt] =
    useState<BuildPromptResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!workspaceId) return;

    setLoading(true);
    setError(null);

    try {
      const [brandsData, templatesData] = await Promise.all([
        listBrands(workspaceId),
        listPromptTemplates(),
      ]);

      setBrands(brandsData.map(mapBrand));
      setPromptTemplates(templatesData.map(mapTemplate));
    } catch (err: unknown) {
      console.error(err);
      const message =
        (err as any)?.response?.data?.error?.message ||
        (err as any)?.response?.data?.detail ||
        (err as Error)?.message ||
        "خطا در بارگذاری داده‌ها";
      setError(String(message));
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!workspaceId) {
    return (
      <div className="p-6 text-sm text-red-600">
        شناسه فضای کاری نامعتبر است.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6 text-sm text-gray-500">
        در حال بارگذاری...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
        <button
          type="button"
          onClick={loadData}
          className="rounded-lg bg-black px-4 py-2 text-sm text-white"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 p-6 lg:grid-cols-2">
      <div>
        <PromptBuilderForm
          brands={brands}
          promptTemplates={promptTemplates}
          onSuccess={setGeneratedPrompt}
        />
      </div>
      <div>
        <PromptPreview result={generatedPrompt} />
      </div>
    </div>
  );
}
