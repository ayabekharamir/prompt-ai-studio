"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import { getDashboardNavItems, getLastWorkspaceId } from "@/lib/navigation";
import { classNames } from "@/utils";

export function DashboardSidebar() {
  const { lang } = useLanguage();

  const isRTL = lang === "fa";

  // localStorage is only available client-side; read it after mount so
  // server-rendered and first-client-render markup match.
  const [lastWorkspaceId, setLastWorkspaceIdState] = useState<string | null>(null);
  useEffect(() => {
    setLastWorkspaceIdState(getLastWorkspaceId());
  }, []);

  const menuItems = getDashboardNavItems(lastWorkspaceId).map((item) => ({
    label: isRTL ? item.label.fa : item.label.en,
    href: item.href,
    icon: item.icon,
  }));

  return (
<aside
  className={`
    w-64
    border-border
    ${isRTL ? "border-l" : "border-r"}
  `}
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
