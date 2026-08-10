"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import { classNames } from "@/utils";

export function DashboardSidebar() {
  const { lang } = useLanguage();

  const isRTL = lang === "fa";

  const menuItems = [
    {
      label: isRTL ? "داشبورد" : "Dashboard",
      href: "/dashboard",
      icon: "⌂",
    },
    {
      label: isRTL ? "فضاهای کاری" : "Workspaces",
      href: "/dashboard",
      icon: "▣",
    },
    {
      label: isRTL ? "برندها" : "Brands",
      href: "/brands",
      icon: "◇",
    },
    {
      label: isRTL ? "پرامپت‌ها" : "Prompts",
      href: "/prompts",
      icon: "▤",
    },
    {
      label: isRTL ? "قالب پرامپت" : "Prompt Templates",
      href: "/prompts/templates",
      icon: "▦",
    },
    {
      label: isRTL ? "اجراهای هوش مصنوعی" : "AI Executions",
      href: "/executions",
      icon: "▶",
    },
    {
      label: isRTL ? "تنظیمات" : "Settings",
      href: "/settings",
      icon: "⚙",
    },
    {
      label: isRTL ? "راهنما" : "Help",
      href: "/help",
      icon: "?",
    },
  ];

  return (
    <aside
      className={classNames(
        "hidden lg:flex w-64 min-h-screen border-border bg-card p-4 flex-col",
        isRTL ? "border-l" : "border-r"
      )}
    >
      <div className="mb-8 text-xl font-bold text-brand">
        Prompt AI Studio ✦
      </div>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item, index) => (
          <Link
            key={item.label}
            href={item.href}
            className={classNames(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition",
              index === 0
                ? "bg-brand text-white"
                : "text-fg-muted hover:bg-brand-light/10 hover:text-fg"
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-border p-4 text-sm text-fg-muted">
        <div className="font-semibold text-fg">
          {isRTL ? "شروع سریع" : "Quick Start"}
        </div>

        <p className="mt-2">
          {isRTL
            ? "فضای کاری بسازید، برند تعریف کنید و اولین پرامپت خود را اجرا کنید."
            : "Create workspace, define brand and run your first prompt."}
        </p>
      </div>
    </aside>
  );
}
