"use client";

import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { WorkspaceNav } from "@/components/WorkspaceNav";
import { AuthGuard } from "@/components/AuthGuard";

export default function ExecutionPage() {
  const { workspaceId, promptId } = useParams<{
    workspaceId: string;
    promptId: string;
  }>();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="flex">
          <WorkspaceNav workspaceId={workspaceId} />

          <main className="flex-1 p-8">
            <h1 className="text-3xl font-bold">
              AI Execution
            </h1>

            <p className="mt-4 text-fg-muted">
              Prompt ID: {promptId}
            </p>

            <div className="mt-8 rounded-xl border border-border p-6">
              صفحه اجرای هوش مصنوعی آماده است.
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
