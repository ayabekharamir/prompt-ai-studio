"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { classNames } from "@/utils";

export function WorkspaceNav({ workspaceId }: { workspaceId: string }) {
  const pathname = usePathname();

  const tabs = [
    { href: `/workspace/${workspaceId}`, label: "برندها" },
    { href: `/workspace/${workspaceId}/prompts`, label: "پرامپت‌ها" },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="mx-auto flex max-w-6xl gap-6 px-6">
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
                "border-b-2 px-1 py-3 text-sm font-medium",
                isActive
                  ? "border-brand text-brand"
                  : "border-transparent text-gray-500 hover:text-gray-700"
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
