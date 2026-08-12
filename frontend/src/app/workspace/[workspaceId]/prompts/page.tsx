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
import { classNames } from "@/utils";
import {
  listPromptTemplates,
  listPrompts,
  updatePrompt,
  deletePrompt,
} from "@/services/prompt.service";
import type { Prompt, PromptTemplate } from "@/types";

function PromptsContent() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { t } = useLanguage();
  const [tab, setTab] = useState<"mine" | "templates">("mine");
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  async function load() {
    setIsLoading(true);
    try {
      const [p, tpl] = await Promise.all([
        listPrompts(workspaceId),
        listPromptTemplates(),
      ]);
      setPrompts(p);
      setTemplates(tpl);
    } catch {
      setError(t("prompts.loadError"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  function startEdit(prompt: Prompt) {
    setEditingId(prompt.id);
    setEditTitle(prompt.title);
    setEditContent(prompt.content);
    setError(null);
    setSuccess(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setIsUpdating(true);
    setError(null);
    try {
      const updated = await updatePrompt(editingId, {
        title: editTitle,
        content: editContent,
      });
      setPrompts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
      cancelEdit();
      setSuccess("پرامپت با موفقیت ویرایش شد");
    } catch {
      setError("خطا در ویرایش پرامپت");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete(promptId: string) {
    if (!confirm("آیا از حذف این پرامپت مطمئن هستید؟")) return;
    setDeletingId(promptId);
    setError(null);
    try {
      await deletePrompt(promptId);
      setPrompts((prev) => prev.filter((p) => p.id !== promptId));
      if (editingId === promptId) cancelEdit();
      setSuccess("پرامپت حذف شد");
    } catch {
      setError("خطا در حذف پرامپت");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCopy(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      setSuccess("متن پرامپت کپی شد");
    } catch {
      setError("خطا در کپی متن");
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <WorkspaceNav workspaceId={workspaceId} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-fg">{t("prompts.title")}</h1>
          <Link href={`/workspace/${workspaceId}/prompts/new`}>
            <Button>{t("prompts.newPrompt")}</Button>
          </Link>
        </div>

        {error && (
          <div className="mt-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}
        {success && (
          <div className="mt-4">
            <Alert variant="success">{success}</Alert>
          </div>
        )}

        <div className="mt-6 flex gap-2 border-b border-border">
          {(
            [
              { key: "mine", label: t("prompts.mine", { count: prompts.length }) },
              {
                key: "templates",
                label: t("prompts.templates", { count: templates.length }),
              },
            ] as const
          ).map((tabItem) => (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key)}
              className={classNames(
                "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                tab === tabItem.key
                  ? "border-brand text-brand"
                  : "border-transparent text-fg-muted hover:text-fg"
              )}
            >
              {tabItem.label}
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
                title={t("prompts.emptyMineTitle")}
                description={t("prompts.emptyMineDesc")}
                action={
                  <Link href={`/workspace/${workspaceId}/prompts/new`}>
                    <Button>{t("prompts.emptyMineAction")}</Button>
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {prompts.map((p) => (
                  <Card key={p.id}>
                    {editingId === p.id ? (
                      <form onSubmit={handleUpdate} className="space-y-3">
                        <Field label="عنوان" htmlFor={`edit-title-${p.id}`}>
                          <Input
                            id={`edit-title-${p.id}`}
                            required
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                        </Field>
                        <Field label="متن پرامپت" htmlFor={`edit-content-${p.id}`}>
                          <Textarea
                            id={`edit-content-${p.id}`}
                            rows={6}
                            required
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                          />
                        </Field>
                        <div className="flex gap-2">
                          <Button type="submit" isLoading={isUpdating}>
                            ذخیره تغییرات
                          </Button>
                          <Button type="button" variant="secondary" onClick={cancelEdit}>
                            انصراف
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-fg">{p.title}</h3>
                          <span className="rounded-full bg-brand-light/20 px-2 py-0.5 text-xs font-medium text-brand-dark dark:text-brand-light">
                            {t(`prompts.status.${p.status}`)}
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-fg-muted">
                          {p.content}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link
                            href={`/workspace/${workspaceId}/prompts/${p.id}/execution`}
                          >
                            <Button>اجرا با AI</Button>
                          </Link>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleCopy(p.content)}
                          >
                            کپی متن
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => startEdit(p)}
                          >
                            ویرایش
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            isLoading={deletingId === p.id}
                            onClick={() => handleDelete(p.id)}
                          >
                            حذف
                          </Button>
                        </div>
                      </>
                    )}
                  </Card>
                ))}
              </div>
            )
          ) : templates.length === 0 ? (
            <EmptyState title={t("prompts.emptyTemplates")} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {templates.map((tpl) => (
                <Card key={tpl.id}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-fg">{tpl.title}</h3>
                    <span className="text-xs text-fg-subtle">{tpl.category}</span>
                  </div>
                  {tpl.description && (
                    <p className="mt-2 text-sm text-fg-muted">{tpl.description}</p>
                  )}
                  <Link
                    href={`/workspace/${workspaceId}/prompts/new?template=${tpl.id}`}
                    className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
                  >
                    {t("prompts.useTemplate")}
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
