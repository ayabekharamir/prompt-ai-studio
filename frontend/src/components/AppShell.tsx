"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * Shared shell for authenticated pages that have a desktop sidebar +
 * mobile drawer (currently: /dashboard). Centralizes the Navbar /
 * Sidebar / MobileSidebar composition and the RTL-aware layout.
 *
 * Note: no manual `order` classes are used for the aside/main split.
 * When a flex container (default flex-direction: row) has dir="rtl",
 * the browser already mirrors the main axis automatically (DOM order
 * aside -> main places aside on the right in RTL, left in LTR). Adding
 * explicit lg:order-1/2 on top of that double-flips it back to the LTR
 * arrangement regardless of language, which was the bug.
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
          <aside className="hidden lg:block">
            <DashboardSidebar />
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
