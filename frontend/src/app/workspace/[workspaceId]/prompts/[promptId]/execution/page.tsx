"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { WorkspaceNav } from "@/components/WorkspaceNav";
import { Button } from "@/components/ui/Button";
import { Card, Alert, Spinner } from "@/components/ui/Card";
import {
  executePrompt,
  listPromptExecutions,
} from "@/services/prompt.service";

export default function ExecutionPage() {
  const { workspaceId, promptId } = useParams<{
    workspaceId: string;
    promptId: string;
  }>();

  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExecute() {
    try {
      setLoading(true);
      setError(null);

      const response = await executePrompt(promptId);

      setResult(response);

      const executions = await listPromptExecutions(promptId);
      setHistory(executions);

    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "خطا در اجرای هوش مصنوعی"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Navbar />

        <div className="flex">
          <WorkspaceNav workspaceId={workspaceId} />

          <main className="flex-1 p-8">

            <h1 className="text-3xl font-bold">
              AI Execution
            </h1>

            <p className="mt-2 text-fg-muted">
              Prompt ID: {promptId}
            </p>


            {error && (
              <div className="mt-4">
                <Alert variant="error">
                  {error}
                </Alert>
              </div>
            )}


            <Card className="mt-6 p-6">

              <Button
                onClick={handleExecute}
                disabled={loading}
              >
                {loading
                  ? "در حال اجرا..."
                  : "اجرا با AI"}
              </Button>


              {loading && (
                <div className="mt-4">
                  <Spinner />
                </div>
              )}

            </Card>


            {result && (
              <Card className="mt-6 p-6">

                <h2 className="text-xl font-bold">
                  نتیجه AI
                </h2>

                <pre className="mt-4 whitespace-pre-wrap text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>

              </Card>
            )}


            {history.length > 0 && (
              <Card className="mt-6 p-6">

                <h2 className="text-xl font-bold">
                  تاریخچه اجراها
                </h2>

                {history.map((item) => (
                  <div
                    key={item.id}
                    className="mt-3 border-b border-border pb-3"
                  >
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(item, null, 2)}
                    </pre>
                  </div>
                ))}

              </Card>
            )}

          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
