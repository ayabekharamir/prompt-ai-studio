"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { WorkspaceNav } from "@/components/WorkspaceNav";
import { Button } from "@/components/ui/Button";
import { Alert, Card, EmptyState, Spinner } from "@/components/ui/Card";
import { useLanguage } from "@/lib/i18n/language-context";
import { setLastWorkspaceId } from "@/lib/navigation";
import { listBrands } from "@/services/brand.service";
import { listPrompts } from "@/services/prompt.service";
import { getWorkspace } from "@/services/workspace.service";
import type { Brand, Workspace } from "@/types";
import { formatDate } from "@/utils";

/**
 * Workspace Overview: the landing page for a single workspace.
 * Shows the workspace identity + brand/prompt counts + quick access,
 * then the existing brand list below (unchanged behavior, just reused
 * inside this richer page instead of being the entire page).
 *
 * Note: the Workspace model currently has no `description` field
 * (backend/app/models/workspace.py), so there's nothing to show there —
 * intentionally omitted rather than faking a value. Add it later if a
 * real backend field is introduced (out of scope here per "do not
 * modify database schema").
 */
function WorkspaceOverviewContent() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { t, lang } = useLanguage();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [promptsCount, setPromptsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Remember this as the last workspace the user visited, so the
    // sidebar's "Brands" / "Prompts" links can stay workspace-scoped.
    setLastWorkspaceId(workspaceId);

    Promise.all([getWorkspace(workspaceId), listBrands(workspaceId), listPrompts(workspaceId)])
      .then(([ws, brandsData, promptsData]) => {
        setWorkspace(ws);
        setBrands(brandsData);
        setPromptsCount(promptsData.length);
      })
      .catch(() => setError(t("workspaceOverview.loadError")))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

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

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <>
            {/* Workspace identity + quick stats */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-fg">{workspace?.name}</h1>
                {workspace?.created_at && (
                  <p className="mt-1 text-sm text-fg-muted">
                    {t("dashboard.createdAt", { date: formatDate(workspace.created_at, lang) })}
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

            {/* Existing brand list (unchanged behavior) */}
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
                    <Link key={brand.id} href={`/workspace/${workspaceId}/brands/${brand.id}`}>
                      <Card className="h-full transition-shadow hover:shadow-md">
                        <h3 className="font-semibold text-fg">{brand.name}</h3>
                        {brand.industry && (
                          <p className="mt-1 text-xs text-fg-subtle">{brand.industry}</p>
                        )}
                        {brand.description && (
                          <p className="mt-3 line-clamp-2 text-sm text-fg-muted">
                            {brand.description}
                          </p>
                        )}
                      </Card>
                    </Link>
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
