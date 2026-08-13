/**
 * Single source of truth for the authenticated app's primary navigation
 * items.
 *
 * Workspace-scoped and brand-scoped routes use the last workspace / brand
 * visited by the user. No fake global routes are created.
 */

const LAST_WORKSPACE_STORAGE_KEY = "pas:lastWorkspaceId";
const LAST_BRAND_STORAGE_KEY = "pas:lastBrandId";

export function getLastWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LAST_WORKSPACE_STORAGE_KEY);
}

export function setLastWorkspaceId(workspaceId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_WORKSPACE_STORAGE_KEY, workspaceId);
}

export function getLastBrandId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LAST_BRAND_STORAGE_KEY);
}

export function setLastBrandId(brandId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_BRAND_STORAGE_KEY, brandId);
}

export function clearLastBrandId(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LAST_BRAND_STORAGE_KEY);
}

export function setNavigationContext(workspaceId: string, brandId?: string | null): void {
  if (typeof window === "undefined") return;
  setLastWorkspaceId(workspaceId);
  if (brandId) {
    setLastBrandId(brandId);
  }
}

export interface NavItem {
  id: string;
  label: { fa: string; en: string };
  href: string;
  icon: string;
}

/**
 * Main dashboard sidebar navigation.
 *
 * Products and Personas are brand-scoped, so they require both:
 * - last workspace
 * - last brand
 *
 * If those values are not available yet, they safely fall back to
 * the dashboard instead of generating an invalid URL.
 */
export function getDashboardNavItems(
  lastWorkspaceId: string | null,
  lastBrandId: string | null = null
): NavItem[] {
  const hasWorkspace = Boolean(lastWorkspaceId);
  const hasBrand = Boolean(lastWorkspaceId && lastBrandId);

  return [
    {
      id: "dashboard",
      label: {
        fa: "داشبورد",
        en: "Dashboard",
      },
      href: "/dashboard",
      icon: "⌂",
    },

    {
      id: "workspaces",
      label: {
        fa: "فضاهای کاری",
        en: "Workspaces",
      },
      href: "/dashboard",
      icon: "▣",
    },

    {
      id: "brands",
      label: {
        fa: "برندها",
        en: "Brands",
      },
      href: hasWorkspace
        ? `/workspace/${lastWorkspaceId}`
        : "/dashboard",
      icon: "◇",
    },

    {
      id: "prompts",
      label: {
        fa: "پرامپت‌ها",
        en: "Prompts",
      },
      href: hasWorkspace
        ? `/workspace/${lastWorkspaceId}/prompts`
        : "/dashboard",
      icon: "▤",
    },

    {
      id: "products",
      label: {
        fa: "محصولات",
        en: "Products",
      },
      href: hasBrand
        ? `/workspace/${lastWorkspaceId}/brands/${lastBrandId}/products`
        : hasWorkspace
          ? `/workspace/${lastWorkspaceId}`
          : "/dashboard",
      icon: "◈",
    },

    {
      id: "personas",
      label: {
        fa: "شخصیت‌ها",
        en: "Personas",
      },
      href: hasBrand
        ? `/workspace/${lastWorkspaceId}/brands/${lastBrandId}/personas`
        : hasWorkspace
          ? `/workspace/${lastWorkspaceId}`
          : "/dashboard",
      icon: "◎",
    },
  ];
}

/**
 * Items displayed in the mobile navigation drawer.
 */
export const mobileNavItemIds = [
  "dashboard",
  "workspaces",
  "brands",
  "prompts",
  "products",
  "personas",
] as const;

export function getMobileNavItems(
  lastWorkspaceId: string | null,
  lastBrandId: string | null = null
): NavItem[] {
  const items = getDashboardNavItems(
    lastWorkspaceId,
    lastBrandId
  );

  return mobileNavItemIds
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is NavItem => Boolean(item));
}
