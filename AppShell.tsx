"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * Shared shell for authenticated pages that have a desktop sidebar +
 * mobile drawer (currently: /dashboard). Centralizes the Navbar /
 * Sidebar / MobileSidebar composition and the RTL-aware ordering logic
 * that used to be duplicated inline on the dashboard page.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { lang } = useLanguage();
  const isRTL = lang === "fa";

  return (
    <AuthGuard>
      <Navbar />

      <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-bg text-fg">
        {/* Mobile top bar + drawer */}
        <MobileSidebar />

        <div className="flex min-h-[calc(100vh-73px)] lg:min-h-screen">
          {/* Desktop sidebar */}
          <aside className={isRTL ? "hidden lg:block lg:order-2" : "hidden lg:block lg:order-1"}>
            <DashboardSidebar />
          </aside>

          {/* Main content */}
          <main className={isRTL ? "min-w-0 flex-1 lg:order-1" : "min-w-0 flex-1 lg:order-2"}>
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
