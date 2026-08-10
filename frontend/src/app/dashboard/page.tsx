"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
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


  async function load() {
    setIsLoading(true);

    try {
      const data = await listWorkspaces();
      setWorkspaces(data);
    } catch {
      setError(
        lang === "fa"
          ? "خطا در دریافت فضاهای کاری"
          : "Failed to load workspaces"
      );
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

    try {
      await createWorkspace(name);

      setName("");
      setShowForm(false);

      await load();

    } catch {

      setError(
        lang === "fa"
          ? "خطا در ساخت فضای کاری"
          : "Failed to create workspace"
      );

    } finally {
      setIsCreating(false);
    }
  }


  const isRTL = lang === "fa";


  return (

    <div
      className={`flex min-h-screen bg-background ${
        isRTL ? "flex-row-reverse" : "flex-row"
      }`}
    >

      <DashboardSidebar />


      <main className="flex-1 p-8">


        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold text-fg">
              {isRTL
                ? "به Prompt AI Studio خوش آمدید 👋"
                : "Welcome to Prompt AI Studio 👋"}
            </h1>

            <p className="mt-2 text-fg-muted">
              {isRTL
                ? "مدیریت برندها، پرامپت‌ها و اجرای هوش مصنوعی"
                : "Manage brands, prompts and AI executions"}
            </p>

          </div>


          <Button onClick={() => setShowForm(!showForm)}>
            +
            {isRTL
              ? " فضای کاری جدید"
              : " New Workspace"}
          </Button>


        </div>



        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">


          <Card>
            <p className="text-sm text-fg-muted">
              Workspace
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {workspaces.length}
            </h2>

          </Card>



          <Card>

            <p className="text-sm text-fg-muted">
              Brands
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              0
            </h2>

          </Card>



          <Card>

            <p className="text-sm text-fg-muted">
              Prompts
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              0
            </h2>

          </Card>



          <Card>

            <p className="text-sm text-fg-muted">
              AI Executions
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              0
            </h2>

          </Card>


        </div>




        {error && (
          <div className="mt-6">
            <Alert variant="error">
              {error}
            </Alert>
          </div>
        )}





        {showForm && (

          <Card className="mt-6">

            <form
              onSubmit={handleCreate}
              className="flex gap-3"
            >

              <input
                className="flex-1 rounded-lg border border-border bg-transparent px-4 py-2"
                placeholder={
                  isRTL
                    ? "نام فضای کاری"
                    : "Workspace name"
                }
                value={name}
                onChange={(e)=>setName(e.target.value)}
                required
              />


              <Button
                type="submit"
                isLoading={isCreating}
              >
                {isRTL ? "ساخت" : "Create"}
              </Button>


            </form>


          </Card>

        )}






        <section className="mt-10">


          <div className="flex justify-between mb-4">

            <h2 className="text-xl font-bold">
              {isRTL
                ? "فضاهای کاری شما"
                : "Your Workspaces"}
            </h2>


          </div>





          {isLoading ? (

            <div className="flex justify-center py-20">
              <Spinner/>
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
                  ? "اولین فضای کاری خود را بسازید"
                  : "Create your first workspace"
              }

            />


          ) : (


            <div className="grid gap-4 md:grid-cols-3">


              {workspaces.map((ws)=>(

                <Link
                  key={ws.id}
                  href={`/workspace/${ws.id}`}
                >

                  <Card className="hover:shadow-lg transition">


                    <h3 className="font-bold text-lg">
                      {ws.name}
                    </h3>


                    <p className="mt-2 text-sm text-fg-muted">
                      {ws.slug}
                    </p>


                    <p className="mt-4 text-xs text-fg-subtle">

                      {formatDate(
                        ws.created_at,
                        lang
                      )}

                    </p>


                  </Card>

                </Link>


              ))}


            </div>


          )}


        </section>


      </main>


    </div>

  );

}




export default function DashboardPage(){

  return (

    <AuthGuard>

      <Navbar />

      <DashboardContent />

    </AuthGuard>

  );

}
