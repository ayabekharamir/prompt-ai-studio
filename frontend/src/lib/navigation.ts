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

  const previousWorkspaceId = window.localStorage.getItem(
    LAST_WORKSPACE_STORAGE_KEY
  );

  window.localStorage.setItem(LAST_WORKSPACE_STORAGE_KEY, workspaceId);

  // A brand belongs to a specific workspace. Never keep a brand context
  // from another workspace, otherwise Products/Personas could point to an
  // invalid or unrelated brand route after switching workspaces.
  if (previousWorkspaceId && previousWorkspaceId !== workspaceId) {
    window.localStorage.removeItem(LAST_BRAND_STORAGE_KEY);
  }
}

export function getLastBrandId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LAST_BRAND_STORAGE_KEY);
}

export function setLastBrandId(brandId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_BRAND_STORAGE_KEY, brandId);
}

/**
 * Synchronize the last workspace/brand context from the current route.
 * This lets the global Navbar/sidebar safely link to brand-scoped pages
 * such as Products and Personas without inventing global routes.
 */
export function syncNavigationContext(pathname: string): void {
  if (typeof window === "undefined") return;

  const match = pathname.match(
    /^\/workspace\/([^/]+)(?:\/brands\/([^/]+))?/
  );

  if (!match) return;

  const workspaceId = match[1];
  const brandId = match[2];

  if (workspaceId) {
    setLastWorkspaceId(workspaceId);
  }

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
