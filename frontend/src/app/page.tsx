"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "@/components/ui/Card";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [isLoading, user, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold text-brand">Prompt AI Studio</h1>
      <p className="mt-3 text-lg text-gray-600">Build Your Brand's AI Brain</p>
      <Spinner className="mt-8" />
    </main>
  );
}
