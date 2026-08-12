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
  deleteBrandRule,
  getBrand,
  getBrandIdentity,
  listBrandRules,
  updateBrandRule,
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

  // --- حالت ویرایش ---
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editRuleType, setEditRuleType] = useState("");
  const [editRuleTitle, setEditRuleTitle] = useState("");
  const [editRuleDescription, setEditRuleDescription] = useState("");
  const [isUpdatingRule, setIsUpdatingRule] = useState(false);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);

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

  function startEditRule(rule: BrandRule) {
    setEditingRuleId(rule.id);
    setEditRuleType(rule.rule_type);
    setEditRuleTitle(rule.title);
    setEditRuleDescription(rule.description || "");
    setShowRuleForm(false);
  }

  function cancelEditRule() {
    setEditingRuleId(null);
    setEditRuleType("");
    setEditRuleTitle("");
    setEditRuleDescription("");
  }

  async function handleUpdateRule(e: React.FormEvent) {
    e.preventDefault();
    if (!editingRuleId) return;

    setIsUpdatingRule(true);
    setError(null);
    try {
      await updateBrandRule(editingRuleId, {
        rule_type: editRuleType,
        title: editRuleTitle,
        description: editRuleDescription || undefined,
      });
      cancelEditRule();
      const rulesData = await listBrandRules(brandId);
      setRules(rulesData);
      setSaveMessage("قانون با موفقیت ویرایش شد");
    } catch {
      setError("خطا در ویرایش قانون");
    } finally {
      setIsUpdatingRule(false);
    }
  }

  async function handleDeleteRule(ruleId: string) {
    if (!confirm("آیا از حذف این قانون مطمئن هستید؟")) return;

    setDeletingRuleId(ruleId);
    setError(null);
    try {
      await deleteBrandRule(ruleId);
      const rulesData = await listBrandRules(brandId);
      setRules(rulesData);
      setSaveMessage("قانون حذف شد");
    } catch {
      setError("خطا در حذف قانون");
    } finally {
      setDeletingRuleId(null);
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
            <Button
              variant="secondary"
              onClick={() => {
                setShowRuleForm((v) => !v);
                cancelEditRule();
              }}
            >
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
              <Field
                label={`${t("brandBrain.ruleDescription")} (${t("common.optional")})`}
                htmlFor="rule_description"
              >
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
                    {editingRuleId === rule.id ? (
                      <form onSubmit={handleUpdateRule} className="space-y-3">
                        <Field label={t("brandBrain.ruleType")} htmlFor={`edit_type_${rule.id}`}>
                          <Input
                            id={`edit_type_${rule.id}`}
                            required
                            value={editRuleType}
                            onChange={(e) => setEditRuleType(e.target.value)}
                          />
                        </Field>
                        <Field label={t("brandBrain.ruleTitle")} htmlFor={`edit_title_${rule.id}`}>
                          <Input
                            id={`edit_title_${rule.id}`}
                            required
                            value={editRuleTitle}
                            onChange={(e) => setEditRuleTitle(e.target.value)}
                          />
                        </Field>
                        <Field
                          label={`${t("brandBrain.ruleDescription")} (${t("common.optional")})`}
                          htmlFor={`edit_desc_${rule.id}`}
                        >
                          <Textarea
                            id={`edit_desc_${rule.id}`}
                            rows={2}
                            value={editRuleDescription}
                            onChange={(e) => setEditRuleDescription(e.target.value)}
                          />
                        </Field>
                        <div className="flex gap-2">
                          <Button type="submit" isLoading={isUpdatingRule}>
                            ذخیره تغییرات
                          </Button>
                          <Button type="button" variant="secondary" onClick={cancelEditRule}>
                            انصراف
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-fg">{rule.title}</span>
                              <span className="text-xs text-fg-subtle shrink-0">
                                {rule.rule_type}
                              </span>
                            </div>
                            {rule.description && (
                              <p className="mt-1 text-sm text-fg-muted">{rule.description}</p>
                            )}
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => startEditRule(rule)}
                            >
                              ویرایش
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              isLoading={deletingRuleId === rule.id}
                              onClick={() => handleDeleteRule(rule.id)}
                            >
                              حذف
                            </Button>
                          </div>
                        </div>
                      </>
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
