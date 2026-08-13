/**
 * Single source of truth for the authenticated app's primary navigation
 * items. Shared by DashboardSidebar (desktop) and MobileSidebar
 * (mobile drawer) so the two never drift out of sync.
 *
 * Workspace-scoped navigation:
 * - Brands
 * - Prompts
 *
 * Brand-scoped navigation:
 * - Products
 * - Personas
 *
 * The current workspace and brand are tracked with small localStorage
 * helpers so we do not need additional global state or context.
 *
 * Items that do not have an implemented standalone route are intentionally
 * not listed here.
 */

const LAST_WORKSPACE_STORAGE_KEY = "pas:lastWorkspaceId";
const LAST_BRAND_STORAGE_KEY = "pas:lastBrandId";

/**
 * Return the last workspace visited by the user in this browser.
 */
export function getLastWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;

  return window.localStorage.getItem(LAST_WORKSPACE_STORAGE_KEY);
}

/**
 * Store the current workspace for workspace-scoped navigation.
 */
export function setLastWorkspaceId(workspaceId: string): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    LAST_WORKSPACE_STORAGE_KEY,
    workspaceId,
  );
}

/**
 * Return the last brand visited by the user in this browser.
 */
export function getLastBrandId(): string | null {
  if (typeof window === "undefined") return null;

  return window.localStorage.getItem(LAST_BRAND_STORAGE_KEY);
}

/**
 * Store the current brand for brand-scoped navigation.
 */
export function setLastBrandId(brandId: string): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    LAST_BRAND_STORAGE_KEY,
    brandId,
  );
}

/**
 * Clear the stored brand.
 *
 * Useful when the user leaves a brand context or when a brand is deleted.
 */
export function clearLastBrandId(): void {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(LAST_BRAND_STORAGE_KEY);
}

/**
 * Clear the stored workspace.
 *
 * Useful when the user logs out or when workspace context is no longer valid.
 */
export function clearLastWorkspaceId(): void {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(LAST_WORKSPACE_STORAGE_KEY);
}

export interface NavItem {
  id: string;
  label: {
    fa: string;
    en: string;
  };
  href: string;
  icon: string;
}

/**
 * Builds the primary authenticated navigation.
 *
 * Workspace-scoped items:
 * - Brands
 * - Prompts
 *
 * Brand-scoped items:
 * - Products
 * - Personas
 *
 * When no workspace/brand has been visited yet, the corresponding
 * navigation item falls back to /dashboard rather than creating
 * a broken or guessed URL.
 */
export function getDashboardNavItems(
  lastWorkspaceId: string | null,
  lastBrandId: string | null = null,
): NavItem[] {
  const workspaceHref = lastWorkspaceId
    ? `/workspace/${lastWorkspaceId}`
    : "/dashboard";

  const promptsHref = lastWorkspaceId
    ? `/workspace/${lastWorkspaceId}/prompts`
    : "/dashboard";

  const productsHref =
    lastWorkspaceId && lastBrandId
      ? `/workspace/${lastWorkspaceId}/brands/${lastBrandId}/products`
      : workspaceHref;

  const personasHref =
    lastWorkspaceId && lastBrandId
      ? `/workspace/${lastWorkspaceId}/brands/${lastBrandId}/personas`
      : workspaceHref;

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
      href: workspaceHref,
      icon: "◇",
    },

    {
      id: "prompts",
      label: {
        fa: "پرامپت‌ها",
        en: "Prompts",
      },
      href: promptsHref,
      icon: "▤",
    },

    {
      id: "products",
      label: {
        fa: "محصولات",
        en: "Products",
      },
      href: productsHref,
      icon: "□",
    },

    {
      id: "personas",
      label: {
        fa: "شخصیت‌ها",
        en: "Personas",
      },
      href: personasHref,
      icon: "♙",
    },
  ];
}

/**
 * IDs of the items displayed in the mobile drawer,
 * in the same order as the desktop navigation.
 */
export const mobileNavItemIds = [
  "dashboard",
  "workspaces",
  "brands",
  "prompts",
  "products",
  "personas",
] as const;

/**
 * Builds the mobile navigation items.
 *
 * Kept separate from the desktop component while sharing
 * exactly the same source of truth.
 */
export function getMobileNavItems(
  lastWorkspaceId: string | null,
  lastBrandId: string | null = null,
): NavItem[] {
  const items = getDashboardNavItems(
    lastWorkspaceId,
    lastBrandId,
  );

  return mobileNavItemIds
    .map((id) => items.find((item) => item.id === id))
    .filter(
      (item): item is NavItem =>
        Boolean(item),
    );
}
