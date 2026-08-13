"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useLanguage } from "@/lib/i18n/language-context";
import { classNames } from "@/utils";
import { setLastWorkspaceId } from "@/lib/navigation";

export function WorkspaceNav({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();

  /**
   * Keep the current workspace available for dashboard-level
   * workspace-scoped navigation.
   */
  if (typeof window !== "undefined") {
    setLastWorkspaceId(workspaceId);
  }

  const tabs = [
    {
      href: `/workspace/${workspaceId}`,
      label: t("workspaceNav.brands"),
    },
    {
      href: `/workspace/${workspaceId}/prompts`,
      label: t("workspaceNav.prompts"),
    },
  ];

  return (
    <div className="border-b border-border bg-surface">
      <nav className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-6">
        {tabs.map((tab) => {
          const isActive =
            tab.href === `/workspace/${workspaceId}`
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={classNames(
                "border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-brand text-brand"
                  : "border-transparent text-fg-muted hover:text-fg"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
