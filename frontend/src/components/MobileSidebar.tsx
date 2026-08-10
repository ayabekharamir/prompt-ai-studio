"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const { t, lang } = useLanguage();

  return (
    <>
      <div className="flex items-center justify-between border-b border-border p-4 lg:hidden">
        <div className="font-bold text-xl">
          Prompt AI Studio
        </div>

        <button
          onClick={() => setOpen(true)}
          className="rounded-lg border border-border px-3 py-2"
        >
          ☰
        </button>
      </div>


      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <aside
            className={`absolute top-0 h-full w-72 bg-background p-6 shadow-xl ${
              lang === "fa"
                ? "right-0"
                : "left-0"
            }`}
          >

            <div className="mb-8 flex justify-between">
              <span className="font-bold text-lg">
                Prompt AI Studio
              </span>

              <button
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>


            <nav className="space-y-4">

              <Link href="/dashboard">
                {t("dashboard.title")}
              </Link>

              <Link href="/settings">
                Settings
              </Link>

            </nav>

          </aside>

        </div>
      )}

    </>
  );
}
