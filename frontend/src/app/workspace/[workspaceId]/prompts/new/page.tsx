"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Alert, Card } from "@/components/ui/Card";
import { listBrands } from "@/services/brand.service";
import { createPrompt, listPromptTemplates } from "@/services/prompt.service";
import type { Brand, PromptTemplate } from "@/types";

function NewPromptContent() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [brandId, setBrandId] = useState("");
  const [templateId, setTemplateId] = useState(searchParams.get("template") || "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([listBrands(workspaceId), listPromptTemplates()]).then(([b, t]) => {
      setBrands(b);
      setTemplates(t);
    });
  }, [workspaceId]);

  useEffect(() => {
    if (!templateId) return;
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setTitle((prev) => prev || template.title);
      setContent((prev) => prev || template.template_body);
    }
  }, [templateId, templates]);

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
      setError("ذخیره پرامپت با خطا مواجه شد.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900">پرامپت جدید</h1>
        <p className="mt-1 text-sm text-gray-500">
          می‌تونید از یک قالب شروع کنید، برند مرتبط رو انتخاب کنید و متن نهایی رو ویرایش کنید.
        </p>

        <Card className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert variant="error">{error}</Alert>}

            <Field label="قالب (اختیاری)" htmlFor="template">
              <select
                id="template"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
              >
                <option value="">بدون قالب — از صفر بنویس</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="برند مرتبط (اختیاری)" htmlFor="brand">
              <select
                id="brand"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
              >
                <option value="">بدون برند</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="عنوان" htmlFor="title">
              <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>

            <Field label="متن پرامپت" htmlFor="content">
              <Textarea
                id="content"
                required
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </Field>

            <div className="flex gap-3">
              <Button type="submit" isLoading={isSubmitting}>
                ذخیره پرامپت
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                انصراف
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
