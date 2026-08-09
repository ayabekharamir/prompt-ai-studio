"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Alert, Card, EmptyState, Spinner } from "@/components/ui/Card";
import {
  createBrandRule,
  getBrand,
  getBrandIdentity,
  listBrandRules,
  upsertBrandIdentity,
} from "@/services/brand.service";
import type { Brand, BrandIdentity, BrandRule } from "@/types";

const IDENTITY_FIELDS: { key: keyof BrandIdentity; label: string }[] = [
  { key: "mission", label: "مأموریت (Mission)" },
  { key: "vision", label: "چشم‌انداز (Vision)" },
  { key: "target_audience", label: "مخاطب هدف" },
  { key: "tone_of_voice", label: "لحن برند (Tone of Voice)" },
  { key: "core_values", label: "ارزش‌های اصلی" },
  { key: "unique_selling_point", label: "مزیت رقابتی (USP)" },
  { key: "brand_personality", label: "شخصیت برند" },
];

function BrandBrainContent() {
  const { brandId } = useParams<{ workspaceId: string; brandId: string }>();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [identity, setIdentity] = useState<Partial<BrandIdentity>>({});
  const [rules, setRules] = useState<BrandRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleType, setRuleType] = useState("");
  const [ruleTitle, setRuleTitle] = useState("");
  const [ruleDescription, setRuleDescription] = useState("");
  const [isAddingRule, setIsAddingRule] = useState(false);

  async function loadAll() {
    setIsLoading(true);
    try {
      const [brandData, identityData, rulesData] = await Promise.all([
        getBrand(brandId),
        getBrandIdentity(brandId),
        listBrandRules(brandId),
      ]);
      setBrand(brandData);
      setIdentity(identityData || {});
      setRules(rulesData);
    } catch {
      setError("دریافت اطلاعات Brand Brain با خطا مواجه شد.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId]);

  async function handleSaveIdentity(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);
    setError(null);
    try {
      const updated = await upsertBrandIdentity(brandId, identity);
      setIdentity(updated);
      setSaveMessage("Brand Brain ذخیره شد.");
    } catch {
      setError("ذخیره‌سازی با خطا مواجه شد.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddRule(e: React.FormEvent) {
    e.preventDefault();
    setIsAddingRule(true);
    try {
      await createBrandRule(brandId, {
        rule_type: ruleType,
        title: ruleTitle,
        description: ruleDescription || undefined,
      });
      setRuleType("");
      setRuleTitle("");
      setRuleDescription("");
      setShowRuleForm(false);
      const rulesData = await listBrandRules(brandId);
      setRules(rulesData);
    } catch {
      setError("افزودن قانون با خطا مواجه شد.");
    } finally {
      setIsAddingRule(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900">{brand?.name}</h1>
        <p className="mt-1 text-sm text-gray-500">Brand Brain — هویت و قوانین محتوایی این برند</p>

        {error && (
          <div className="mt-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}
        {saveMessage && (
          <div className="mt-4">
            <Alert variant="success">{saveMessage}</Alert>
          </div>
        )}

        <Card className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900">هویت برند</h2>
          <form onSubmit={handleSaveIdentity} className="mt-4 space-y-4">
            {IDENTITY_FIELDS.map((field) => (
              <Field key={field.key} label={field.label} htmlFor={field.key}>
                <Textarea
                  id={field.key}
                  rows={2}
                  value={(identity[field.key] as string) || ""}
                  onChange={(e) =>
                    setIdentity((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                />
              </Field>
            ))}
            <Button type="submit" isLoading={isSaving}>
              ذخیره هویت برند
            </Button>
          </form>
        </Card>

        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">قوانین محتوایی</h2>
            <Button variant="secondary" onClick={() => setShowRuleForm((v) => !v)}>
              + قانون جدید
            </Button>
          </div>

          {showRuleForm && (
            <form onSubmit={handleAddRule} className="mt-4 space-y-4 rounded-lg bg-gray-50 p-4">
              <Field label="نوع قانون" htmlFor="rule_type">
                <Input
                  id="rule_type"
                  required
                  placeholder="مثلاً: کلمات ممنوعه، سبک نگارش"
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value)}
                />
              </Field>
              <Field label="عنوان" htmlFor="rule_title">
                <Input
                  id="rule_title"
                  required
                  value={ruleTitle}
                  onChange={(e) => setRuleTitle(e.target.value)}
                />
              </Field>
              <Field label="توضیح (اختیاری)" htmlFor="rule_description">
                <Textarea
                  id="rule_description"
                  rows={2}
                  value={ruleDescription}
                  onChange={(e) => setRuleDescription(e.target.value)}
                />
              </Field>
              <Button type="submit" isLoading={isAddingRule}>
                افزودن قانون
              </Button>
            </form>
          )}

          <div className="mt-4">
            {rules.length === 0 ? (
              <EmptyState title="هنوز قانونی اضافه نشده" />
            ) : (
              <ul className="space-y-3">
                {rules.map((rule) => (
                  <li key={rule.id} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{rule.title}</span>
                      <span className="text-xs text-gray-400">{rule.rule_type}</span>
                    </div>
                    {rule.description && (
                      <p className="mt-1 text-sm text-gray-600">{rule.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}

export default function BrandBrainPage() {
  return (
    <AuthGuard>
      <BrandBrainContent />
    </AuthGuard>
  );
}
