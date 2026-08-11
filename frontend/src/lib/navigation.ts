/**
 * Single source of truth for the authenticated app's primary navigation
 * items. Shared by `DashboardSidebar` (desktop) and `MobileSidebar`
 * (mobile drawer) so the two never drift out of sync.
 */

export interface NavItem {
  id: string;
  label: { fa: string; en: string };
  href: string;
  icon: string;
}

export const dashboardNavItems: NavItem[] = [
  { id: "dashboard", label: { fa: "داشبورد", en: "Dashboard" }, href: "/dashboard", icon: "⌂" },
  { id: "workspaces", label: { fa: "فضاهای کاری", en: "Workspaces" }, href: "/dashboard", icon: "▣" },
  { id: "brands", label: { fa: "برندها", en: "Brands" }, href: "/brands", icon: "◇" },
  { id: "prompts", label: { fa: "پرامپت‌ها", en: "Prompts" }, href: "/prompts", icon: "▤" },
  { id: "templates", label: { fa: "قالب پرامپت", en: "Prompt Templates" }, href: "/prompts/templates", icon: "▦" },
  { id: "executions", label: { fa: "اجراهای هوش مصنوعی", en: "AI Executions" }, href: "/executions", icon: "▶" },
  { id: "settings", label: { fa: "تنظیمات", en: "Settings" }, href: "/settings", icon: "⚙" },
  { id: "help", label: { fa: "راهنما", en: "Help" }, href: "/help", icon: "?" },
];

/**
 * Ids of the items shown in the mobile drawer, in display order. A subset
 * of `dashboardNavItems` (skips "Prompt Templates" and "Help", which the
 * mobile nav spec doesn't include) rather than a duplicated list.
 */
export const mobileNavItemIds = [
  "dashboard",
  "workspaces",
  "brands",
  "prompts",
  "executions",
  "settings",
] as const;

export function getMobileNavItems(): NavItem[] {
  return mobileNavItemIds
    .map((id) => dashboardNavItems.find((item) => item.id === id))
    .filter((item): item is NavItem => Boolean(item));
}
