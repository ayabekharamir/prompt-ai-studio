"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
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
import {
  deleteBrandAsset,
  getBrandAssetObjectUrl,
  listBrandAssets,
  uploadBrandAsset,
} from "@/services/brand-asset.service";
import type { Brand, BrandAsset, AssetCategory, BrandIdentity, BrandRule } from "@/types";

const ASSET_CATEGORY_KEYS: AssetCategory[] = [
  "logo",
  "logo_variant",
  "brand_photo",
  "product",
  "character",
  "reference",
  "other",
];

function getAssetDisplayName(asset: BrandAsset): string {
  const parts = asset.file_path.split("/");
  return parts[parts.length - 1] || asset.file_path;
}

const IDENTITY_FIELD_KEYS: (keyof BrandIdentity)[] = [
  "mission",
  "vision",
  "target_audience",
  "tone_of_voice",
  "core_values",
  "unique_selling_point",
  "brand_personality",
];

function AssetThumbnail({ asset }: { asset: BrandAsset }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    let revoked = false;
    let currentUrl: string | null = null;

    getBrandAssetObjectUrl(asset)
      .then((url) => {
        if (revoked) {
          URL.revokeObjectURL(url);
          return;
        }
        currentUrl = url;
        setObjectUrl(url);
      })
      .catch(() => {
        // Silently fall back to the filename-only view below.
      });

    return () => {
      revoked = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [asset]);

  if (!objectUrl) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-surface-muted">
        <Spinner className="h-4 w-4" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={objectUrl}
      alt={getAssetDisplayName(asset)}
      className="h-16 w-16 rounded-lg object-cover"
    />
  );
}

function BrandBrainContent() {
  const { brandId } = useParams<{ workspaceId: string; brandId: string }>();
  const { t } = useLanguage();

  // --- Brand & Identity ---
  const [brand, setBrand] = useState<Brand | null>(null);
  const [identity, setIdentity] = useState<Partial<BrandIdentity>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- Brand Rules State ---
  const [rules, setRules] = useState<BrandRule[]>([]);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleType, setRuleType] = useState("");
  const [ruleTitle, setRuleTitle] = useState("");
  const [ruleDescription, setRuleDescription] = useState("");
  const [isAddingRule, setIsAddingRule] = useState(false);

  // --- Rule Edit & Delete State ---
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editRuleType, setEditRuleType] = useState("");
  const [editRuleTitle, setEditRuleTitle] = useState("");
  const [editRuleDescription, setEditRuleDescription] = useState("");
  const [isUpdatingRule, setIsUpdatingRule] = useState(false);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);

  // --- Brand Assets State ---
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [assetError, setAssetError] = useState<string | null>(null);
  const [assetMessage, setAssetMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>("other");
  const [isUploading, setIsUploading] = useState(false);
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);

  // --- Data Loading ---
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

  async function loadAssets() {
    setAssetsLoading(true);
    try {
      const data = await listBrandAssets(brandId);
      setAssets(data);
    } catch {
      setAssetError(t("brandAssets.loadError"));
    } finally {
      setAssetsLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    loadAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId]);

  // --- Handlers: Identity ---
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

  // --- Handlers: Rules ---
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
    if (!window.confirm("آیا از حذف این قانون مطمئن هستید؟")) return;

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

  // --- Handlers: Assets ---
  async function handleUploadAsset(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setAssetError(null);
    setAssetMessage(null);
    try {
      const uploaded = await uploadBrandAsset(brandId, selectedFile, selectedCategory);
      setAssets((prev) => [uploaded, ...prev]);
      setSelectedFile(null);
      setSelectedCategory("other");
      setAssetMessage(t("brandAssets.uploadSuccess"));
    } catch (err: any) {
      if (err?.response?.status === 400) {
        setAssetError(t("brandAssets.invalidFileType"));
      } else {
        setAssetError(t("brandAssets.uploadError"));
      }
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDeleteAsset(assetId: string) {
    if (!window.confirm(t("brandAssets.deleteConfirm"))) return;

    setDeletingAssetId(assetId);
    setAssetError(null);
    setAssetMessage(null);
    try {
      await deleteBrandAsset(assetId);
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
      setAssetMessage(t("brandAssets.deleteSuccess"));
    } catch {
      setAssetError(t("brandAssets.deleteError"));
    } finally {
      setDeletingAssetId(null);
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

        {/* --- Identity Section --- */}
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

        {/* --- Rules Section --- */}
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
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-fg">{rule.title}</span>
                            <span className="shrink-0 text-xs text-fg-subtle">
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
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* --- Assets Section --- */}
        <Card className="mt-6">
          <h2 className="text-lg font-semibold text-fg">{t("brandAssets.title")}</h2>
          <p className="mt-1 text-sm text-fg-muted">{t("brandAssets.subtitle")}</p>

          {assetError && (
            <div className="mt-4">
              <Alert variant="error">{assetError}</Alert>
            </div>
          )}
          {assetMessage && (
            <div className="mt-4">
              <Alert variant="success">{assetMessage}</Alert>
            </div>
          )}

          <form
            onSubmit={handleUploadAsset}
            className="mt-4 flex flex-col gap-3 rounded-lg bg-surface-muted p-4 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <Field label={t("brandAssets.uploadLabel")} htmlFor="asset_file">
                <Input
                  id="asset_file"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </Field>
            </div>
            <div className="sm:w-56">
              <Field label={t("brandAssets.categoryLabel")} htmlFor="asset_category">
                <Select
                  id="asset_category"
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(e.target.value as AssetCategory)
                  }
                >
                  {ASSET_CATEGORY_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {t(`brandAssets.categories.${key}`)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Button type="submit" disabled={!selectedFile} isLoading={isUploading}>
              {isUploading ? t("brandAssets.uploading") : t("brandAssets.upload")}
            </Button>
          </form>

          <div className="mt-4">
            {assetsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : assets.length === 0 ? (
              <EmptyState title={t("brandAssets.empty")} />
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {assets.map((asset) => (
                  <li
                    key={asset.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <AssetThumbnail asset={asset} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fg">
                        {getAssetDisplayName(asset)}
                      </p>
                      <p className="text-xs text-fg-subtle">
                        {t(`brandAssets.categories.${asset.category}`)}
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteAsset(asset.id)}
                      isLoading={deletingAssetId === asset.id}
                    >
                      {t("brandAssets.delete")}
                    </Button>
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
