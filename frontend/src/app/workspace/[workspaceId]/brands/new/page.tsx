"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Alert, Card } from "@/components/ui/Card";
import { createBrand } from "@/services/brand.service";

function NewBrandContent() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
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
      setError("ساخت برند با خطا مواجه شد.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900">برند جدید</h1>
        <p className="mt-1 text-sm text-gray-500">
          اطلاعات پایه برند رو وارد کنید — جزئیات Brand Brain رو مرحله بعد تکمیل می‌کنید.
        </p>

        <Card className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert variant="error">{error}</Alert>}

            <Field label="نام برند" htmlFor="name">
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </Field>

            <Field label="حوزه فعالیت (اختیاری)" htmlFor="industry">
              <Input
                id="industry"
                placeholder="مثلاً: پوشاک، فناوری، غذا"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </Field>

            <Field label="وب‌سایت (اختیاری)" htmlFor="website">
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </Field>

            <Field label="توضیحات (اختیاری)" htmlFor="description">
              <Textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>

            <div className="flex gap-3">
              <Button type="submit" isLoading={isSubmitting}>
                ساخت برند
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

export default function NewBrandPage() {
  return (
    <AuthGuard>
      <NewBrandContent />
    </AuthGuard>
  );
}
