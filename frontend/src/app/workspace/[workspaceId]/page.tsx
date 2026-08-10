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
import { listBrands } from "@/services/brand.service";
import type { Brand } from "@/types";

function WorkspaceBrandsContent() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { t } = useLanguage();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listBrands(workspaceId)
      .then(setBrands)
      .catch(() => setError(t("brands.loadError")))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <WorkspaceNav workspaceId={workspaceId} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-fg">{t("brands.title")}</h1>
            <p className="mt-1 text-sm text-fg-muted">{t("brands.subtitle")}</p>
          </div>
          <Link href={`/workspace/${workspaceId}/brands/new`}>
            <Button>{t("brands.newBrand")}</Button>
          </Link>
        </div>

        {error && (
          <div className="mt-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : brands.length === 0 ? (
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
      </main>
    </div>
  );
}

export default function WorkspaceBrandsPage() {
  return (
    <AuthGuard>
      <WorkspaceBrandsContent />
    </AuthGuard>
  );
}
