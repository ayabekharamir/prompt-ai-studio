"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { WorkspaceNav } from "@/components/WorkspaceNav";
import { Button } from "@/components/ui/Button";
import { Alert, Card, EmptyState, Spinner } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/language-context";
import { setLastWorkspaceId } from "@/lib/navigation";
import {
  listBrands,
  updateBrand,
  deleteBrand,
} from "@/services/brand.service";
import { listPrompts } from "@/services/prompt.service";
import { getWorkspace } from "@/services/workspace.service";
import type { Brand, Workspace } from "@/types";
import { formatDate } from "@/utils";

function WorkspaceOverviewContent() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { t, lang } = useLanguage();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [promptsCount, setPromptsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      const [ws, brandsData, promptsData] = await Promise.all([
        getWorkspace(workspaceId),
        listBrands(workspaceId),
        listPrompts(workspaceId),
      ]);
      setWorkspace(ws);
      setBrands(brandsData);
      setPromptsCount(promptsData.length);
    } catch {
      setError(t("workspaceOverview.loadError"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setLastWorkspaceId(workspaceId);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  function startEditBrand(brand: Brand) {
    setEditingBrandId(brand.id);
    setEditName(brand.name);
    setEditIndustry(brand.industry || "");
    setEditDescription(brand.description || "");
    setError(null);
    setSuccess(null);
  }

  function cancelEditBrand() {
    setEditingBrandId(null);
    setEditName("");
    setEditIndustry("");
    setEditDescription("");
  }

  async function handleUpdateBrand(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBrandId) return;
    setIsUpdating(true);
    setError(null);
    try {
      const updated = await updateBrand(editingBrandId, {
        name: editName,
        industry: editIndustry || undefined,
        description: editDescription || undefined,
      });
      setBrands((prev) => prev.map((b) => (b.id === editingBrandId ? updated : b)));
      cancelEditBrand();
      setSuccess("برند با موفقیت ویرایش شد");
    } catch {
      setError("خطا در ویرایش برند");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDeleteBrand(brandId: string) {
    if (!confirm("آیا از حذف این برند مطمئن هستید؟")) return;
    setDeletingBrandId(brandId);
    setError(null);
    try {
      await deleteBrand(brandId);
      setBrands((prev) => prev.filter((b) => b.id !== brandId));
      if (editingBrandId === brandId) cancelEditBrand();
      setSuccess("برند حذف شد");
    } catch {
      setError("خطا در حذف برند");
    } finally {
      setDeletingBrandId(null);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <WorkspaceNav workspaceId={workspaceId} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        {error && (
          <div className="mb-6">
            <Alert variant="error">{error}</Alert>
          </div>
        )}
        {success && (
          <div className="mb-6">
            <Alert variant="success">{success}</Alert>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-fg">{workspace?.name}</h1>
                {workspace?.created_at && (
                  <p className="mt-1 text-sm text-fg-muted">
                    {t("dashboard.createdAt", {
                      date: formatDate(workspace.created_at, lang),
                    })}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Link href={`/workspace/${workspaceId}/brands/new`}>
                  <Button>{t("brands.newBrand")}</Button>
                </Link>
                <Link href={`/workspace/${workspaceId}/prompts`}>
                  <Button variant="secondary">{t("workspaceOverview.openPrompts")}</Button>
                </Link>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 sm:max-w-sm">
              <Card className="p-4 sm:p-5">
                <p className="text-xs font-medium text-fg-muted sm:text-sm">
                  {t("workspaceOverview.brandsCount")}
                </p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{brands.length}</h2>
              </Card>

              <Card className="p-4 sm:p-5">
                <p className="text-xs font-medium text-fg-muted sm:text-sm">
                  {t("workspaceOverview.promptsCount")}
                </p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{promptsCount}</h2>
              </Card>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-fg">{t("brands.title")}</h2>
                <p className="mt-1 text-sm text-fg-muted">{t("brands.subtitle")}</p>
              </div>
              <Link href={`/workspace/${workspaceId}/brands/new`}>
                <Button variant="secondary">{t("brands.newBrand")}</Button>
              </Link>
            </div>

            <div className="mt-6">
              {brands.length === 0 ? (
                <EmptyState
                  title={t("brands.emptyTitle")}
                  description={t("brands.emptyDesc")}
                  action={
                    <Link href={`/workspace/${workspaceId}/brands/new`}>
                      <Button>{t("brands.emptyAction")}</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {brands.map((brand) => (
                    <Card key={brand.id} className="h-full">
                      {editingBrandId === brand.id ? (
                        <form onSubmit={handleUpdateBrand} className="space-y-3">
                          <Field label="نام برند" htmlFor={`brand-name-${brand.id}`}>
                            <Input
                              id={`brand-name-${brand.id}`}
                              required
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                          </Field>
                          <Field label="صنعت" htmlFor={`brand-industry-${brand.id}`}>
                            <Input
                              id={`brand-industry-${brand.id}`}
                              value={editIndustry}
                              onChange={(e) => setEditIndustry(e.target.value)}
                            />
                          </Field>
                          <Field label="توضیحات" htmlFor={`brand-desc-${brand.id}`}>
                            <Textarea
                              id={`brand-desc-${brand.id}`}
                              rows={3}
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                            />
                          </Field>
                          <div className="flex gap-2">
                            <Button type="submit" isLoading={isUpdating}>
                              ذخیره
                            </Button>
                            <Button type="button" variant="secondary" onClick={cancelEditBrand}>
                              انصراف
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <Link href={`/workspace/${workspaceId}/brands/${brand.id}`}>
                            <h3 className="font-semibold text-fg hover:underline">
                              {brand.name}
                            </h3>
                          </Link>
                          {brand.industry && (
                            <p className="mt-1 text-xs text-fg-subtle">{brand.industry}</p>
                          )}
                          {brand.description && (
                            <p className="mt-3 line-clamp-2 text-sm text-fg-muted">
                              {brand.description}
                            </p>
                          )}
                          <div className="mt-4 flex gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => startEditBrand(brand)}
                            >
                              ویرایش
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              isLoading={deletingBrandId === brand.id}
                              onClick={() => handleDeleteBrand(brand.id)}
                            >
                              حذف
                            </Button>
                          </div>
                        </>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function WorkspaceOverviewPage() {
  return (
    <AuthGuard>
      <WorkspaceOverviewContent />
    </AuthGuard>
  );
}
