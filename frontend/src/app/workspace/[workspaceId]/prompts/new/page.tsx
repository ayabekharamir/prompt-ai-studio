"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Alert, Card } from "@/components/ui/Card";
import { useLanguage } from "@/lib/i18n/language-context";
import { listBrands } from "@/services/brand.service";
import { listProducts } from "@/services/product.service";
import { listPersonas } from "@/services/persona.service";
import { createPrompt, listPromptTemplates } from "@/services/prompt.service";
import { buildPrompt } from "@/services/prompts";
import type { Brand, PromptTemplate } from "@/types";
import type { Persona, Product } from "@/types/prompts";

function NewPromptContent() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [task, setTask] = useState("");
  const [brandId, setBrandId] = useState("");
  const [productId, setProductId] = useState("");
  const [personaId, setPersonaId] = useState("");
  const [templateId, setTemplateId] = useState(
    searchParams.get("template") || ""
  );

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  const brandRequestId = useRef(0);

  // برند + قالب
  useEffect(() => {
    Promise.all([listBrands(workspaceId), listPromptTemplates()]).then(
      ([b, tpl]) => {
        setBrands(b);
        setTemplates(tpl);
      }
    );
  }, [workspaceId]);

  // با انتخاب قالب: در صورت خالی بودن، title/content را پر کن (مثل قبل)
  useEffect(() => {
    if (!templateId) return;
    const template = templates.find((tpl) => tpl.id === templateId);
    if (template) {
      setTitle((prev) => prev || template.title);
      setContent((prev) => prev || template.template_body);
    }
  }, [templateId, templates]);

  // با تغییر برند → محصول و پرسونا
  useEffect(() => {
    if (!brandId) {
      setProducts([]);
      setPersonas([]);
      setProductId("");
      setPersonaId("");
      return;
    }

    const requestId = ++brandRequestId.current;
    let cancelled = false;

    async function loadExtras() {
      setLoadingExtras(true);
      setProductId("");
      setPersonaId("");
      setProducts([]);
      setPersonas([]);

      try {
        const [productsData, personasData] = await Promise.all([
          listProducts(brandId),
          listPersonas(brandId),
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
      } catch (err) {
        console.error(err);
        if (!cancelled && requestId === brandRequestId.current) {
          setProducts([]);
          setPersonas([]);
        }
      } finally {
        if (!cancelled && requestId === brandRequestId.current) {
          setLoadingExtras(false);
        }
      }
    }

    loadExtras();

    return () => {
      cancelled = true;
    };
  }, [brandId]);

  async function handleBuild() {
    setError(null);
    setIsBuilding(true);
    setCopyDone(false);

    try {
      const result = await buildPrompt({
        brand_id: brandId || "",
        product_id: productId || null,
        persona_id: personaId || null,
        prompt_template_id: templateId || null,
        title: title || null,
        task: task || title || content || " ",
        extra_context: null,
      });

      if (result.title && !title.trim()) {
        setTitle(result.title);
      }
      setContent(result.content || "");
    } catch (err: unknown) {
      console.error(err);
      const message =
        (err as any)?.response?.data?.detail ||
        (err as any)?.response?.data?.error?.message ||
        (err as Error)?.message ||
        "خطا در ساخت پرامپت";
      setError(String(message));
    } finally {
      setIsBuilding(false);
    }
  }

  async function handleCopy() {
    if (!content.trim()) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    } catch {
      setError("کپی متن انجام نشد");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createPrompt(workspaceId, {
        title,
        content,
        brand_id: brandId || undefined,
        template_id: templateId || undefined,
      });
      router.push(`/workspace/${workspaceId}/prompts`);
    } catch {
      setError(t("promptNew.saveError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-bold text-fg">{t("promptNew.title")}</h1>
        <p className="mt-1 text-sm text-fg-muted">{t("promptNew.subtitle")}</p>

        <Card className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert variant="error">{error}</Alert>}

            <Field label="برند" htmlFor="brand">
              <Select
                id="brand"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
              >
                <option value="">بدون برند</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="محصول" htmlFor="product">
              <Select
                id="product"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                disabled={!brandId || loadingExtras}
              >
                <option value="">
                  {!brandId
                    ? "ابتدا برند را انتخاب کنید"
                    : loadingExtras
                      ? "در حال بارگذاری..."
                      : "بدون محصول"}
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="پرسونا" htmlFor="persona">
              <Select
                id="persona"
                value={personaId}
                onChange={(e) => setPersonaId(e.target.value)}
                disabled={!brandId || loadingExtras}
              >
                <option value="">
                  {!brandId
                    ? "ابتدا برند را انتخاب کنید"
                    : loadingExtras
                      ? "در حال بارگذاری..."
                      : "بدون پرسونا"}
                </option>
                {personas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="قالب پرامپت" htmlFor="template">
              <Select
                id="template"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
              >
                <option value="">بدون قالب — از ابتدا بنویس</option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.title}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="عنوان" htmlFor="title">
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثلاً: کپشن اینستاگرام معرفی تور"
              />
            </Field>

            <Field label="وظیفه (Task)" htmlFor="task">
              <Textarea
                id="task"
                rows={4}
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="مثال: یک کپشن اینستاگرام جذاب و کوتاه برای معرفی این تور بنویس"
              />
            </Field>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBuild}
                isLoading={isBuilding}
                disabled={isBuilding}
              >
                {isBuilding ? "در حال ساخت..." : "ساخت پرامپت"}
              </Button>
            </div>

            <Field label="متن پرامپت" htmlFor="content">
              <Textarea
                id="content"
                rows={14}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="بعد از ساخت پرامپت، متن اینجا نمایش داده می‌شود و قابل ویرایش است"
              />
            </Field>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" isLoading={isSubmitting}>
                {t("promptNew.submit")}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleCopy}
                disabled={!content.trim()}
              >
                {copyDone ? "کپی شد" : "کپی متن"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
              >
                {t("common.cancel")}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}

export default function NewPromptPage() {
  return (
    <AuthGuard>
      <NewPromptContent />
    </AuthGuard>
  );
}
