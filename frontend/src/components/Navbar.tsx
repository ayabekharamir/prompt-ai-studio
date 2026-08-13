"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  getLastBrandId,
  getLastWorkspaceId,
} from "@/lib/navigation";

export function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();

  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [brandId, setBrandId] = useState<string | null>(null);

  useEffect(() => {
    setWorkspaceId(getLastWorkspaceId());
    setBrandId(getLastBrandId());
  }, [pathname]);

  const hasWorkspace = Boolean(workspaceId);
  const hasBrand = Boolean(workspaceId && brandId);

  const navItems = [
    {
      id: "dashboard",
      href: "/dashboard",
      label: t("nav.dashboard"),
    },
    {
      id: "workspaces",
      href: "/dashboard",
      label: t("nav.workspaces"),
    },
    {
      id: "brands",
      href: hasWorkspace
        ? `/workspace/${workspaceId}`
        : "/dashboard",
      label: t("nav.brands"),
    },
    {
      id: "prompts",
      href: hasWorkspace
        ? `/workspace/${workspaceId}/prompts`
        : "/dashboard",
      label: t("nav.prompts"),
    },
    {
      id: "products",
      href: hasBrand
        ? `/workspace/${workspaceId}/brands/${brandId}/products`
        : hasWorkspace
          ? `/workspace/${workspaceId}`
          : "/dashboard",
      label: t("nav.products"),
    },
    {
      id: "personas",
      href: hasBrand
        ? `/workspace/${workspaceId}/brands/${brandId}/personas`
        : hasWorkspace
          ? `/workspace/${workspaceId}`
          : "/dashboard",
      label: t("nav.personas"),
    },
  ];

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex min-w-0 items-center gap-8">
          <Link
            href="/dashboard"
            className="shrink-0 text-lg font-bold text-brand"
          >
            {t("common.appName")}
          </Link>

          <nav className="hidden items-center gap-5 lg:flex">
            {navItems.map((item) => {
              const isActive =
                item.id === "dashboard"
                  ? pathname === "/dashboard"
                  : item.id === "workspaces"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href) &&
                      item.href !== "/dashboard";

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={[
                    "whitespace-nowrap text-sm font-medium transition-colors",
                    isActive
                      ? "text-brand"
                      : "text-fg-muted hover:text-fg",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />

          {user && (
            <span className="hidden text-sm text-fg-muted sm:inline">
              {user.full_name}
            </span>
          )}

          <Button
            variant="ghost"
            onClick={logout}
          >
            {t("nav.logout")}
          </Button>
        </div>
      </div>
    </header>
  );
}
