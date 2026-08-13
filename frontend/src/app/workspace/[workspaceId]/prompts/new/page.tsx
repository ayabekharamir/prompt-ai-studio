"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Alert, Card } from "@/components/ui/Card";
import { useLanguage } from "@/lib/i18n/language-context";
import { listBrands } from "@/services/brand.service";
import { createPrompt, listPromptTemplates } from "@/services/prompt.service";
import type { Brand, PromptTemplate } from "@/types";

function NewPromptContent() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [brandId, setBrandId] = useState("");
  const [templateId, setTemplateId] = useState(searchParams.get("template") || "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([listBrands(workspaceId), listPromptTemplates()]).then(([b, tpl]) => {
      setBrands(b);
      setTemplates(tpl);
    });
  }, [workspaceId]);

  useEffect(() => {
    if (!templateId) return;
    const template = templates.find((tpl) => tpl.id === templateId);
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

            <Field label={`${t("promptNew.templateLabel")} (${t("common.optional")})`} htmlFor="template">
              <Select
                id="template"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
              >
                <option value="">{t("promptNew.noTemplate")}</option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.title}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={`${t("promptNew.brandLabel")} (${t("common.optional")})`} htmlFor="brand">
              <Select id="brand" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                <option value="">{t("promptNew.noBrand")}</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={t("promptNew.titleLabel")} htmlFor="title">
              <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>

            <Field label={t("promptNew.contentLabel")} htmlFor="content">
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
                {t("promptNew.submit")}
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.back()}>
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
