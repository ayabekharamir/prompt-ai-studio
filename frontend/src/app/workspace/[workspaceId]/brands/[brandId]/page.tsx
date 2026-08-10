"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Alert, Card, EmptyState, Spinner } from "@/components/ui/Card";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  createBrandRule,
  getBrand,
  getBrandIdentity,
  listBrandRules,
  upsertBrandIdentity,
} from "@/services/brand.service";
import type { Brand, BrandIdentity, BrandRule } from "@/types";

const IDENTITY_FIELD_KEYS: (keyof BrandIdentity)[] = [
  "mission",
  "vision",
  "target_audience",
  "tone_of_voice",
  "core_values",
  "unique_selling_point",
  "brand_personality",
];

function BrandBrainContent() {
  const { brandId } = useParams<{ workspaceId: string; brandId: string }>();
  const { t } = useLanguage();
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
      setError(t("brandBrain.loadError"));
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
      setSaveMessage(t("brandBrain.saved"));
    } catch {
      setError(t("brandBrain.saveError"));
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
      setError(t("brandBrain.addRuleError"));
    } finally {
      setIsAddingRule(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold text-fg">{brand?.name}</h1>
        <p className="mt-1 text-sm text-fg-muted">{t("brandBrain.subtitle")}</p>

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
          <h2 className="text-lg font-semibold text-fg">{t("brandBrain.identityTitle")}</h2>
          <form onSubmit={handleSaveIdentity} className="mt-4 space-y-4">
            {IDENTITY_FIELD_KEYS.map((key) => (
              <Field key={key} label={t(`brandBrain.fields.${key}`)} htmlFor={key}>
                <Textarea
                  id={key}
                  rows={2}
                  value={(identity[key] as string) || ""}
                  onChange={(e) =>
                    setIdentity((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                />
              </Field>
            ))}
            <Button type="submit" isLoading={isSaving}>
              {t("brandBrain.saveIdentity")}
            </Button>
          </form>
        </Card>

        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-fg">{t("brandBrain.rulesTitle")}</h2>
            <Button variant="secondary" onClick={() => setShowRuleForm((v) => !v)}>
              {t("brandBrain.newRule")}
            </Button>
          </div>

          {showRuleForm && (
            <form onSubmit={handleAddRule} className="mt-4 space-y-4 rounded-lg bg-surface-muted p-4">
              <Field label={t("brandBrain.ruleType")} htmlFor="rule_type">
                <Input
                  id="rule_type"
                  required
                  placeholder={t("brandBrain.ruleTypePlaceholder")}
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value)}
                />
              </Field>
              <Field label={t("brandBrain.ruleTitle")} htmlFor="rule_title">
                <Input
                  id="rule_title"
                  required
                  value={ruleTitle}
                  onChange={(e) => setRuleTitle(e.target.value)}
                />
              </Field>
              <Field label={`${t("brandBrain.ruleDescription")} (${t("common.optional")})`} htmlFor="rule_description">
                <Textarea
                  id="rule_description"
                  rows={2}
                  value={ruleDescription}
                  onChange={(e) => setRuleDescription(e.target.value)}
                />
              </Field>
              <Button type="submit" isLoading={isAddingRule}>
                {t("brandBrain.addRule")}
              </Button>
            </form>
          )}

          <div className="mt-4">
            {rules.length === 0 ? (
              <EmptyState title={t("brandBrain.emptyRules")} />
            ) : (
              <ul className="space-y-3">
                {rules.map((rule) => (
                  <li key={rule.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-fg">{rule.title}</span>
                      <span className="text-xs text-fg-subtle">{rule.rule_type}</span>
                    </div>
                    {rule.description && (
                      <p className="mt-1 text-sm text-fg-muted">{rule.description}</p>
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
