/**
 * Single source of truth for the authenticated app's primary navigation
 * items. Shared by `DashboardSidebar` (desktop) and `MobileSidebar`
 * (mobile drawer) so the two never drift out of sync.
 *
 * "Brands" and "Prompts" are workspace-scoped routes (there is no global
 * /brands or /prompts page), so their href depends on the last workspace
 * the user visited. That id is tracked here via a small localStorage
 * helper (no context / global state) and read by both sidebars.
 *
 * Items that don't have an implemented route yet (Prompt Templates as a
 * standalone page, a global AI Executions list, Settings, Help) are
 * intentionally NOT listed here — they were previously dead 404 links.
 * Add them back once their route actually exists.
 */

const LAST_WORKSPACE_STORAGE_KEY = "pas:lastWorkspaceId";

export function getLastWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LAST_WORKSPACE_STORAGE_KEY);
}

export function setLastWorkspaceId(workspaceId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_WORKSPACE_STORAGE_KEY, workspaceId);
}

export interface NavItem {
  id: string;
  label: { fa: string; en: string };
  href: string;
  icon: string;
}

/**
 * Builds the desktop sidebar items. `lastWorkspaceId` should come from
 * `getLastWorkspaceId()`; when there isn't one yet (user hasn't opened a
 * workspace this browser), workspace-scoped items fall back to
 * `/dashboard` instead of guessing an id.
 */
export function getDashboardNavItems(lastWorkspaceId: string | null): NavItem[] {
  return [
    { id: "dashboard", label: { fa: "داشبورد", en: "Dashboard" }, href: "/dashboard", icon: "⌂" },
    { id: "workspaces", label: { fa: "فضاهای کاری", en: "Workspaces" }, href: "/dashboard", icon: "▣" },
    {
      id: "brands",
      label: { fa: "برندها", en: "Brands" },
      href: lastWorkspaceId ? `/workspace/${lastWorkspaceId}` : "/dashboard",
      icon: "◇",
    },
    {
      id: "prompts",
      label: { fa: "پرامپت‌ها", en: "Prompts" },
      href: lastWorkspaceId ? `/workspace/${lastWorkspaceId}/prompts` : "/dashboard",
      icon: "▤",
    },
  ];
}

/** Ids of the items shown in the mobile drawer, in display order. */
export const mobileNavItemIds = ["dashboard", "workspaces", "brands", "prompts"] as const;

export function getMobileNavItems(lastWorkspaceId: string | null): NavItem[] {
  const items = getDashboardNavItems(lastWorkspaceId);
  return mobileNavItemIds
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is NavItem => Boolean(item));
}
