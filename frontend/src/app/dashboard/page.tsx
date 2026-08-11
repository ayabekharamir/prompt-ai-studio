"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card, Alert, EmptyState, Spinner } from "@/components/ui/Card";

import { useLanguage } from "@/lib/i18n/language-context";
import { listWorkspaces, createWorkspace } from "@/services/workspace.service";

import type { Workspace } from "@/types";
import { formatDate } from "@/utils";

function DashboardContent() {
  const { lang } = useLanguage();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const isRTL = lang === "fa";

  async function load() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await listWorkspaces();
      setWorkspaces(data);
    } catch {
      setError(
        isRTL
          ? "خطا در دریافت فضاهای کاری"
          : "Failed to load workspaces"
      );
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

    if (!name.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      await createWorkspace(name.trim());

      setName("");
      setShowForm(false);

      await load();
    } catch {
      setError(
        isRTL
          ? "خطا در ساخت فضای کاری"
          : "Failed to create workspace"
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {isRTL
                    ? "به Prompt AI Studio خوش آمدید 👋"
                    : "Welcome to Prompt AI Studio 👋"}
                </h1>

                <p className="mt-2 text-sm text-fg-muted sm:text-base">
                  {isRTL
                    ? "مدیریت برندها، پرامپت‌ها و اجرای هوش مصنوعی"
                    : "Manage brands, prompts and AI executions"}
                </p>
              </div>

              <Button
                onClick={() => setShowForm((value) => !value)}
                className="w-full sm:w-auto"
              >
                <span className="text-lg leading-none">+</span>
                {isRTL
                  ? " فضای کاری جدید"
                  : " New Workspace"}
              </Button>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-6">
                <Alert variant="error">{error}</Alert>
              </div>
            )}

            {/* Statistics */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <Card className="p-4 sm:p-5">
                <p className="text-xs font-medium text-fg-muted sm:text-sm">
                  {isRTL ? "فضاهای کاری" : "Workspaces"}
                </p>

                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  {workspaces.length}
                </h2>

                <p className="mt-1 text-xs text-fg-subtle">
                  {isRTL ? "فعال" : "Active"}
                </p>
              </Card>

              <Card className="p-4 sm:p-5">
                <p className="text-xs font-medium text-fg-muted sm:text-sm">
                  {isRTL ? "برندها" : "Brands"}
                </p>

                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  0
                </h2>

                <p className="mt-1 text-xs text-fg-subtle">
                  {isRTL ? "در همه فضاها" : "Across workspaces"}
                </p>
              </Card>

              <Card className="p-4 sm:p-5">
                <p className="text-xs font-medium text-fg-muted sm:text-sm">
                  {isRTL ? "پرامپت‌ها" : "Prompts"}
                </p>

                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  0
                </h2>

                <p className="mt-1 text-xs text-fg-subtle">
                  {isRTL ? "ذخیره شده" : "Saved"}
                </p>
              </Card>

              <Card className="p-4 sm:p-5">
                <p className="text-xs font-medium text-fg-muted sm:text-sm">
                  {isRTL ? "اجراهای هوش مصنوعی" : "AI Executions"}
                </p>

                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  0
                </h2>

                <p className="mt-1 text-xs text-fg-subtle">
                  {isRTL ? "اجرا شده" : "Executed"}
                </p>
              </Card>
            </div>

            {/* Create workspace */}
            {showForm && (
              <Card className="mt-6">
                <form
                  onSubmit={handleCreate}
                  className="flex flex-col gap-3 sm:flex-row"
                >
                  <input
                    className="min-w-0 flex-1 rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                    placeholder={
                      isRTL
                        ? "نام فضای کاری"
                        : "Workspace name"
                    }
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      isLoading={isCreating}
                      className="flex-1 sm:flex-none"
                    >
                      {isRTL ? "ساخت" : "Create"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowForm(false);
                        setName("");
                      }}
                    >
                      {isRTL ? "انصراف" : "Cancel"}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Workspaces */}
            <section className="mt-10">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {isRTL
                      ? "فضاهای کاری شما"
                      : "Your Workspaces"}
                  </h2>

                  <p className="mt-1 text-sm text-fg-muted">
                    {isRTL
                      ? "فضاهای کاری پروژه خود را مدیریت کنید"
                      : "Manage your project workspaces"}
                  </p>
                </div>

                {workspaces.length > 0 && (
                  <span className="rounded-full bg-brand-light/20 px-3 py-1 text-xs font-medium text-brand-dark dark:text-brand-light">
                    {workspaces.length}
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Spinner />
                </div>
              ) : workspaces.length === 0 ? (
                <EmptyState
                  title={
                    isRTL
                      ? "هنوز فضای کاری ندارید"
                      : "No workspace yet"
                  }
                  description={
                    isRTL
                      ? "اولین فضای کاری خود را بسازید و پروژه خود را شروع کنید."
                      : "Create your first workspace and start your project."
                  }
                  action={
                    <Button
                      onClick={() => setShowForm(true)}
                    >
                      {isRTL
                        ? "ساخت فضای کاری"
                        : "Create Workspace"}
                    </Button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {workspaces.map((ws) => (
                    <Link
                      key={ws.id}
                      href={`/workspace/${ws.id}`}
                      className="group"
                    >
                      <Card className="h-full transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-bold">
                              {ws.name}
                            </h3>

                            <p className="mt-1 truncate text-sm text-fg-muted">
                              {ws.slug}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-lg bg-brand-light/20 px-2.5 py-1 text-xs font-medium text-brand-dark dark:text-brand-light">
                            {isRTL ? "فضا" : "Workspace"}
                          </span>
                        </div>

                        <div className="mt-6 border-t border-border pt-4">
                          <p className="text-xs text-fg-subtle">
                            {isRTL
                              ? "تاریخ ایجاد"
                              : "Created"}
                          </p>

                          <p className="mt-1 text-sm text-fg-muted">
                            {formatDate(ws.created_at, lang)}
                          </p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
