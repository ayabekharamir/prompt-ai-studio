"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Alert, Card } from "@/components/ui/Card";
import { useLanguage } from "@/lib/i18n/language-context";
import { createBrand } from "@/services/brand.service";

function NewBrandContent() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { t } = useLanguage();
  const router = useRouter();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const brand = await createBrand(workspaceId, {
        name,
        industry: industry || undefined,
        website: website || undefined,
        description: description || undefined,
      });
      router.push(`/workspace/${workspaceId}/brands/${brand.id}`);
    } catch {
      setError(t("brandNew.createError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-bold text-fg">{t("brandNew.title")}</h1>
        <p className="mt-1 text-sm text-fg-muted">{t("brandNew.subtitle")}</p>

        <Card className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert variant="error">{error}</Alert>}

            <Field label={t("brandNew.name")} htmlFor="name">
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </Field>

            <Field label={`${t("brandNew.industry")} (${t("common.optional")})`} htmlFor="industry">
              <Input
                id="industry"
                placeholder={t("brandNew.industryPlaceholder")}
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </Field>

            <Field label={`${t("brandNew.website")} (${t("common.optional")})`} htmlFor="website">
              <Input
                id="website"
                type="url"
                dir="ltr"
                className="text-left"
                placeholder="https://example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </Field>

            <Field label={`${t("brandNew.description")} (${t("common.optional")})`} htmlFor="description">
              <Textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>

            <div className="flex gap-3">
              <Button type="submit" isLoading={isSubmitting}>
                {t("brandNew.submit")}
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

export default function NewBrandPage() {
  return (
    <AuthGuard>
      <NewBrandContent />
    </AuthGuard>
  );
}
