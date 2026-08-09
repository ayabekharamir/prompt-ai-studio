import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import { useAuth } from "@/context/auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | Prompt AI Studio" },
      {
        name: "description",
        content: "Your Prompt AI Studio workspace home for on-brand AI prompt generation.",
      },
      { property: "og:title", content: "Dashboard | Prompt AI Studio" },
      {
        property: "og:description",
        content: "Your Prompt AI Studio workspace home for on-brand AI prompt generation.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  // Client-side route protection: tokens live in localStorage, so the check
  // can only run after hydration.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) void router.navigate({ to: "/login" });
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted">
        <p className="text-sm text-muted-foreground">Loading your workspace…</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Prompt AI Studio
          </span>
          <button
            onClick={logout}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-accent"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Welcome, {user.full_name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account is set up. Workspaces, brands, and prompt tools arrive in the next phase.
        </p>

        <dl className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-5">
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Email
            </dt>
            <dd className="mt-1 text-sm text-card-foreground">{user.email ?? "—"}</dd>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Member since
            </dt>
            <dd className="mt-1 text-sm text-card-foreground">
              {new Date(user.created_at).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </main>
    </div>
  );
}