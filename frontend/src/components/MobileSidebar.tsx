"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { getMobileNavItems } from "@/lib/navigation";
import { classNames } from "@/utils";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const { t, lang } = useLanguage();
  const { user, logout } = useAuth();

  const isRTL = lang === "fa";
  const navItems = getMobileNavItems();

  // Lock body scroll while the drawer is open so the page behind it
  // can't be scrolled through the overlay.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-border p-4 lg:hidden">
        <div className="font-bold text-xl">Prompt AI Studio</div>

        <button
          onClick={() => setOpen(true)}
          className="rounded-lg border border-border px-3 py-2"
          aria-label={isRTL ? "باز کردن منو" : "Open menu"}
          aria-expanded={open}
        >
          ☰
        </button>
      </div>

      {/* Overlay backdrop. Always mounted (not conditionally rendered) so
          opening/closing can transition smoothly instead of popping. */}
      <div
        className={classNames(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        dir={isRTL ? "rtl" : "ltr"}
        className={classNames(
          "fixed top-0 z-50 flex h-full w-72 max-w-[85vw] flex-col",
          "border-border bg-surface shadow-2xl",
          "transition-transform duration-300 ease-in-out lg:hidden",
          isRTL ? "right-0 border-l" : "left-0 border-r",
          open ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={close}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Prompt AI Studio"
              className="h-8 w-8 shrink-0 rounded-lg object-contain"
            />
            <span className="font-bold text-lg text-brand">Prompt AI Studio</span>
          </Link>

          <button
            onClick={close}
            className="rounded-lg p-1 text-fg-muted hover:bg-surface-hover hover:text-fg"
            aria-label={isRTL ? "بستن منو" : "Close menu"}
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
          {navItems.map((item, index) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={close}
              className={classNames(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition",
                index === 0
                  ? "bg-brand text-white"
                  : "text-fg-muted hover:bg-brand-light/10 hover:text-fg"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{isRTL ? item.label.fa : item.label.en}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          {user && (
            <div className="mb-1 truncate px-4 py-2 text-sm font-medium text-fg">
              {user.full_name}
            </div>
          )}

          {/* Profile has no dedicated page yet, so it's shown as an
              inert, visibly-disabled item rather than a real link
              (avoids a dead route while still matching the required
              drawer content). */}
          <span
            aria-disabled="true"
            className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-sm text-fg-subtle opacity-60"
          >
            <span className="text-lg">☺</span>
            <span>{t("nav.profile")}</span>
          </span>

          <button
            onClick={() => {
              close();
              logout();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-start text-sm text-fg-muted transition hover:bg-brand-light/10 hover:text-fg"
          >
            <span className="text-lg">⎋</span>
            <span>{t("nav.logout")}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
