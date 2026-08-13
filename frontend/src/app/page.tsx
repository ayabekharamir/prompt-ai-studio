"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { Spinner } from "@/components/ui/Card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [isLoading, user, router]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <div className="absolute end-6 top-6 flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <h1 className="text-4xl font-bold text-brand">{t("home.title")}</h1>
      <p className="mt-3 text-lg text-fg-muted">{t("home.subtitle")}</p>
      <Spinner className="mt-8" />
    </main>
  );
}
