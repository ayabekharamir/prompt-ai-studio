"use client";

import { useEffect, useRef, useState } from "react";

import PromptSelect from "./PromptSelect";

import { usePromptBuilder } from "@/hooks/usePromptBuilder";
import { listProducts } from "@/services/product.service";
import { listPersonas } from "@/services/persona.service";

import type {
  BuildPromptRequest,
  BuildPromptResponse,
  Brand,
  Product,
  Persona,
  PromptTemplate,
} from "@/types/prompts";

interface PromptBuilderFormProps {
  brands: Brand[];
  promptTemplates: PromptTemplate[];
  onSuccess: (result: BuildPromptResponse) => void;
}

export default function PromptBuilderForm({
  brands,
  promptTemplates,
  onSuccess,
}: PromptBuilderFormProps) {
  const { mutate, isPending, error } = usePromptBuilder();

  const [products, setProducts] = useState<Product[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const [extrasError, setExtrasError] = useState<string | null>(null);

  // برای جلوگیری از race condition وقتی کاربر سریع برند عوض می‌کند
  const brandRequestId = useRef(0);

  const [form, setForm] = useState<BuildPromptRequest>({
    brand_id: "",
    product_id: null,
    persona_id: null,
    prompt_template_id: null,
    title: "",
    task: "",
    extra_context: null,
  });

  useEffect(() => {
    if (!form.brand_id) {
      setProducts([]);
      setPersonas([]);
      setExtrasError(null);
      return;
    }

    const requestId = ++brandRequestId.current;
    let cancelled = false;

    async function loadBrandExtras() {
      setLoadingExtras(true);
      setExtrasError(null);

      // ریست انتخاب‌های وابسته به برند قبلی
      setForm((prev) => ({
        ...prev,
        product_id: null,
        persona_id: null,
      }));
      setProducts([]);
      setPersonas([]);

      try {
        const [productsData, personasData] = await Promise.all([
          listProducts(form.brand_id),
          listPersonas(form.brand_id),
        ]);

        if (cancelled || requestId !== brandRequestId.current) return;

        setProducts(
          productsData.map((p) => ({
            id: p.id,
            brand_id: p.brand_id,
            name: p.name,
            description: null,
            field_values: p.field_values ?? null,
          }))
        );

        setPersonas(
          personasData.map((p) => ({
            id: p.id,
            brand_id: p.brand_id,
            name: p.name,
            description: null,
            field_values: p.field_values ?? null,
          }))
        );
      } catch (err: unknown) {
        console.error(err);
        if (cancelled || requestId !== brandRequestId.current) return;

        setProducts([]);
        setPersonas([]);
        setExtrasError(
          (err as any)?.response?.data?.error?.message ||
            (err as Error)?.message ||
            "خطا در بارگذاری محصول / پرسونا"
        );
      } finally {
        if (!cancelled && requestId === brandRequestId.current) {
          setLoadingExtras(false);
        }
      }
    }

    loadBrandExtras();

    return () => {
      cancelled = true;
    };
  }, [form.brand_id]);

  function updateField(
    key: keyof BuildPromptRequest,
    value: string | null
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.brand_id || !form.task.trim()) return;

    mutate(
      {
        brand_id: form.brand_id,
        product_id: form.product_id || null,
        persona_id: form.persona_id || null,
        prompt_template_id: form.prompt_template_id || null,
        title: form.title?.trim() || null,
        task: form.task.trim(),
        extra_context: form.extra_context ?? null,
      },
      { onSuccess }
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold">Prompt Builder</h2>

      <PromptSelect
        label="برند"
        value={form.brand_id}
        onChange={(value) => updateField("brand_id", value)}
        options={brands.map((brand) => ({
          id: brand.id,
          name: brand.name,
        }))}
        placeholder={
          brands.length === 0 ? "برندی یافت نشد" : "انتخاب برند"
        }
      />

      <PromptSelect
        label="محصول"
        value={form.product_id}
        onChange={(value) => updateField("product_id", value || null)}
        options={products.map((product) => ({
          id: product.id,
          name: product.name,
        }))}
        placeholder={
          loadingExtras
            ? "در حال بارگذاری..."
            : !form.brand_id
              ? "ابتدا برند را انتخاب کنید"
              : products.length === 0
                ? "محصولی ثبت نشده"
                : "بدون محصول"
        }
      />

      <PromptSelect
        label="پرسونا"
        value={form.persona_id}
        onChange={(value) => updateField("persona_id", value || null)}
        options={personas.map((persona) => ({
          id: persona.id,
          name: persona.name,
        }))}
        placeholder={
          loadingExtras
            ? "در حال بارگذاری..."
            : !form.brand_id
              ? "ابتدا برند را انتخاب کنید"
              : personas.length === 0
                ? "پرسونایی ثبت نشده"
                : "بدون پرسونا"
        }
      />

      <PromptSelect
        label="قالب پرامپت"
        value={form.prompt_template_id}
        onChange={(value) =>
          updateField("prompt_template_id", value || null)
        }
        options={promptTemplates.map((template) => ({
          id: template.id,
          name: template.name,
        }))}
        placeholder={
          promptTemplates.length === 0
            ? "قالبی یافت نشد"
            : "بدون قالب"
        }
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium">عنوان</label>
        <input
          value={form.title ?? ""}
          onChange={(e) => updateField("title", e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="مثلاً: کپشن اینستاگرام ایران کمپ"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">وظیفه (Task)</label>
        <textarea
          value={form.task}
          onChange={(e) => updateField("task", e.target.value)}
          rows={5}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="مثال: یک متن معرفی کوتاه برای این برند بنویس"
          required
        />
      </div>

      {extrasError && (
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          {extrasError}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {(error as any)?.response?.data?.detail ||
            (error as any)?.response?.data?.error?.message ||
            error.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !form.brand_id || !form.task.trim()}
        className="rounded-lg bg-black px-5 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "در حال ساخت..." : "Build Prompt"}
      </button>
    </form>
  );
}
