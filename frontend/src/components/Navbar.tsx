"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="text-lg font-bold text-brand">
          {t("common.appName")}
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
          {user && <span className="hidden text-sm text-fg-muted sm:inline">{user.full_name}</span>}
          <Button variant="ghost" onClick={logout}>
            {t("nav.logout")}
          </Button>
        </div>
      </div>
    </header>
  );
}
