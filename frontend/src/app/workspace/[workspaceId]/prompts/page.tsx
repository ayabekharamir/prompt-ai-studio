"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { WorkspaceNav } from "@/components/WorkspaceNav";
import { Button } from "@/components/ui/Button";
import { Alert, Card, EmptyState, Spinner } from "@/components/ui/Card";
import { classNames } from "@/utils";
import { listPromptTemplates, listPrompts } from "@/services/prompt.service";
import type { Prompt, PromptTemplate } from "@/types";

const STATUS_LABEL: Record<Prompt["status"], string> = {
  draft: "پیش‌نویس",
  saved: "ذخیره‌شده",
  archived: "بایگانی‌شده",
};

function PromptsContent() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [tab, setTab] = useState<"mine" | "templates">("mine");
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listPrompts(workspaceId), listPromptTemplates()])
      .then(([p, t]) => {
        setPrompts(p);
        setTemplates(t);
      })
      .catch(() => setError("دریافت پرامپت‌ها با خطا مواجه شد."))
      .finally(() => setIsLoading(false));
  }, [workspaceId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <WorkspaceNav workspaceId={workspaceId} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">پرامپت‌ها</h1>
          <Link href={`/workspace/${workspaceId}/prompts/new`}>
            <Button>+ پرامپت جدید</Button>
          </Link>
        </div>

        {error && (
          <div className="mt-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        <div className="mt-6 flex gap-2 border-b border-gray-200">
          {(
            [
              { key: "mine", label: `پرامپت‌های من (${prompts.length})` },
              { key: "templates", label: `کتابخانه قالب‌ها (${templates.length})` },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={classNames(
                "border-b-2 px-3 py-2 text-sm font-medium",
                tab === t.key
                  ? "border-brand text-brand"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : tab === "mine" ? (
            prompts.length === 0 ? (
              <EmptyState
                title="هنوز پرامپتی نساختید"
                description="از یک قالب شروع کنید یا از صفر یک پرامپت بسازید."
                action={
                  <Link href={`/workspace/${workspaceId}/prompts/new`}>
                    <Button>ساخت اولین پرامپت</Button>
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {prompts.map((p) => (
                  <Card key={p.id}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{p.title}</h3>
                      <span className="rounded-full bg-brand-light/20 px-2 py-0.5 text-xs font-medium text-brand-dark">
                        {STATUS_LABEL[p.status]}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-gray-600">
                      {p.content}
                    </p>
                  </Card>
                ))}
              </div>
            )
          ) : templates.length === 0 ? (
            <EmptyState title="هنوز قالبی در کتابخانه نیست" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {templates.map((t) => (
                <Card key={t.id}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{t.title}</h3>
                    <span className="text-xs text-gray-400">{t.category}</span>
                  </div>
                  {t.description && (
                    <p className="mt-2 text-sm text-gray-600">{t.description}</p>
                  )}
                  <Link
                    href={`/workspace/${workspaceId}/prompts/new?template=${t.id}`}
                    className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
                  >
                    استفاده از این قالب →
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PromptsPage() {
  return (
    <AuthGuard>
      <PromptsContent />
    </AuthGuard>
  );
}
