"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { WorkspaceNav } from "@/components/WorkspaceNav";
import { Button } from "@/components/ui/Button";
import { Alert, Card, EmptyState, Spinner } from "@/components/ui/Card";
import { listBrands } from "@/services/brand.service";
import type { Brand } from "@/types";

function WorkspaceBrandsContent() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listBrands(workspaceId)
      .then(setBrands)
      .catch(() => setError("دریافت برندها با خطا مواجه شد."))
      .finally(() => setIsLoading(false));
  }, [workspaceId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <WorkspaceNav workspaceId={workspaceId} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">برندها</h1>
            <p className="mt-1 text-sm text-gray-500">
              هر برند یک Brand Brain جدا (هویت + قوانین) داره.
            </p>
          </div>
          <Link href={`/workspace/${workspaceId}/brands/new`}>
            <Button>+ برند جدید</Button>
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
              title="هنوز هیچ برندی نساختید"
              description="اول یک برند بسازید تا بتونید Brand Brain و پرامپت‌هاش رو تعریف کنید."
              action={
                <Link href={`/workspace/${workspaceId}/brands/new`}>
                  <Button>ساخت اولین برند</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {brands.map((brand) => (
                <Link key={brand.id} href={`/workspace/${workspaceId}/brands/${brand.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                    {brand.industry && (
                      <p className="mt-1 text-xs text-gray-400">{brand.industry}</p>
                    )}
                    {brand.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-gray-600">
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
