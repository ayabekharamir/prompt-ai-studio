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
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex">
        <main className="flex-1 p-8">

          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h1 className="text-3xl font-bold text-fg">
                {t("dashboard.title")}
              </h1>

              <p className="mt-2 text-fg-muted">
                {t("dashboard.subtitle")}
              </p>
            </div>

            <Button onClick={() => setShowForm((v) => !v)}>
              + {t("dashboard.newWorkspace")}
            </Button>

          </div>


          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <Card>
              <p className="text-sm text-fg-muted">
                Workspace
              </p>

              <p className="mt-2 text-3xl font-bold text-fg">
                {workspaces.length}
              </p>
            </Card>


            <Card>
              <p className="text-sm text-fg-muted">
                Brands
              </p>

              <p className="mt-2 text-3xl font-bold text-fg">
                0
              </p>
            </Card>


            <Card>
              <p className="text-sm text-fg-muted">
                Prompts
              </p>

              <p className="mt-2 text-3xl font-bold text-fg">
                0
              </p>
            </Card>


            <Card>
              <p className="text-sm text-fg-muted">
                AI Executions
              </p>

              <p className="mt-2 text-3xl font-bold text-fg">
                0
              </p>
            </Card>

          </div>


          {error && (
            <div className="mt-6">
              <Alert variant="error">
                {error}
              </Alert>
            </div>
          )}



          {/* Create Workspace */}
          {showForm && (
            <Card className="mt-6">

              <form
                onSubmit={handleCreate}
                className="flex flex-wrap items-end gap-4"
              >

                <div className="min-w-[240px] flex-1">

                  <Field
                    label={t("dashboard.formLabel")}
                    htmlFor="ws_name"
                  >

                    <Input
                      id="ws_name"
                      required
                      placeholder={t("dashboard.formPlaceholder")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />

                  </Field>

                </div>


                <Button
                  type="submit"
                  isLoading={isCreating}
                >
                  {t("common.create")}
                </Button>


                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                >
                  {t("common.cancel")}
                </Button>


              </form>

            </Card>
          )}




          {/* Workspaces */}

          <div className="mt-10">

            <h2 className="mb-4 text-xl font-semibold text-fg">
              {t("dashboard.title")}
            </h2>


            {isLoading ? (

              <div className="flex justify-center py-16">
                <Spinner />
              </div>


            ) : workspaces.length === 0 ? (

              <EmptyState
                title={t("dashboard.emptyTitle")}
                description={t("dashboard.emptyDesc")}
                action={
                  <Button onClick={() => setShowForm(true)}>
                    {t("dashboard.emptyAction")}
                  </Button>
                }
              />

            ) : (

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {workspaces.map((ws) => (

                  <Link
                    key={ws.id}
                    href={`/workspace/${ws.id}`}
                  >

                    <Card className="h-full transition hover:shadow-lg">

                      <h3 className="text-lg font-semibold text-fg">
                        {ws.name}
                      </h3>


                      <p className="mt-2 text-xs text-fg-subtle">
                        {ws.slug}
                      </p>


                      <div className="mt-5 text-xs text-fg-subtle">

                        {t(
                          "dashboard.createdAt",
                          {
                            date: formatDate(
                              ws.created_at,
                              lang
                            ),
                          }
                        )}

                      </div>


                    </Card>

                  </Link>

                ))}

              </div>

            )}

          </div>



          {/* Activity Placeholder */}

          <Card className="mt-8">

            <h2 className="text-xl font-semibold text-fg">
              Activity
            </h2>

            <p className="mt-3 text-sm text-fg-muted">
              Recent activities will appear here.
            </p>

          </Card>


        </main>
      </div>

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
