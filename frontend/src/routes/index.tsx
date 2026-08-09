import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import { useAuth } from "@/context/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prompt AI Studio — On-brand AI prompts for teams" },
      {
        name: "description",
        content:
          "Prompt AI Studio helps brand and marketing teams create, review, and reuse on-brand AI prompts.",
      },
      { property: "og:title", content: "Prompt AI Studio — On-brand AI prompts for teams" },
      {
        property: "og:description",
        content:
          "Prompt AI Studio helps brand and marketing teams create, review, and reuse on-brand AI prompts.",
      },
    ],
  }),
  component: Index,
});

/** Entry redirect: authenticated users go to /dashboard, everyone else /login. */
function Index() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    void router.navigate({ to: isAuthenticated ? "/dashboard" : "/login" });
  }, [isLoading, isAuthenticated, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted">
      <p className="text-sm text-muted-foreground">Loading…</p>
    </main>
  );
}
