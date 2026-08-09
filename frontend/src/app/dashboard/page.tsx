"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { Alert, Card, EmptyState, Spinner } from "@/components/ui/Card";
import { createWorkspace, listWorkspaces } from "@/services/workspace.service";
import type { Workspace } from "@/types";
import { formatDate } from "@/utils";

function DashboardContent() {
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
      setError("دریافت Workspace‌ها با خطا مواجه شد.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsCreating(true);
    setError(null);
    try {
      await createWorkspace(name);
      setName("");
      setShowForm(false);
      await load();
    } catch {
      setError("ساخت Workspace با خطا مواجه شد.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workspace‌های شما</h1>
            <p className="mt-1 text-sm text-gray-500">
              هر Workspace می‌تونه چند برند و کتابخانه پرامپت جدا داشته باشه.
            </p>
          </div>
          <Button onClick={() => setShowForm((v) => !v)}>+ Workspace جدید</Button>
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
                <Field label="نام Workspace" htmlFor="ws_name">
                  <Input
                    id="ws_name"
                    required
                    placeholder="مثلاً: برند اصلی من"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
              </div>
              <Button type="submit" isLoading={isCreating}>
                ساخت
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                انصراف
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
              title="هنوز هیچ Workspace‌ای نساختید"
              description="یک Workspace بسازید تا بتونید برند و پرامپت اضافه کنید."
              action={<Button onClick={() => setShowForm(true)}>ساخت اولین Workspace</Button>}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((ws) => (
                <Link key={ws.id} href={`/workspace/${ws.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <h3 className="font-semibold text-gray-900">{ws.name}</h3>
                    <p className="mt-1 text-xs text-gray-400">{ws.slug}</p>
                    <p className="mt-4 text-xs text-gray-400">
                      ساخته‌شده در {formatDate(ws.created_at)}
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
