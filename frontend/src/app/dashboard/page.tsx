"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { Alert, Card, EmptyState, Spinner } from "@/components/ui/Card";
import { useLanguage } from "@/lib/i18n/language-context";
import { createWorkspace, listWorkspaces } from "@/services/workspace.service";
import type { Workspace } from "@/types";
import { formatDate } from "@/utils";

function DashboardContent() {
  const { t, lang } = useLanguage();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function load() {
    setIsLoading(true);
    try {
      const data = await listWorkspaces();
      setWorkspaces(data);
    } catch {
      setError(t("dashboard.loadError"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsCreating(true);
    try {
      await createWorkspace(name);
      setName("");
      setShowForm(false);
      await load();
    } catch {
      setError(t("dashboard.createError"));
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-fg">{t("dashboard.title")}</h1>
            <p className="mt-1 text-sm text-fg-muted">{t("dashboard.subtitle")}</p>
          </div>
          <Button onClick={() => setShowForm((v) => !v)}>{t("dashboard.newWorkspace")}</Button>
        </div>

        {error && (
          <div className="mt-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {showForm && (
          <Card className="mt-6">
            <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-4">
              <div className="min-w-[240px] flex-1">
                <Field label={t("dashboard.formLabel")} htmlFor="ws_name">
                  <Input
                    id="ws_name"
                    required
                    placeholder={t("dashboard.formPlaceholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
              </div>
              <Button type="submit" isLoading={isCreating}>
                {t("common.create")}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                {t("common.cancel")}
              </Button>
            </form>
          </Card>
        )}

        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : workspaces.length === 0 ? (
            <EmptyState
              title={t("dashboard.emptyTitle")}
              description={t("dashboard.emptyDesc")}
              action={<Button onClick={() => setShowForm(true)}>{t("dashboard.emptyAction")}</Button>}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((ws) => (
                <Link key={ws.id} href={`/workspace/${ws.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <h3 className="font-semibold text-fg">{ws.name}</h3>
                    <p className="mt-1 text-xs text-fg-subtle">{ws.slug}</p>
                    <p className="mt-4 text-xs text-fg-subtle">
                      {t("dashboard.createdAt", { date: formatDate(ws.created_at, lang) })}
                    </p>
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

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
