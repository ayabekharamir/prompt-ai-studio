"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { classNames } from "@/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      className={classNames(
        "inline-flex items-center rounded-full border border-border bg-surface p-0.5 text-xs font-medium",
        className
      )}
      role="group"
      aria-label={t("lang.toggle")}
    >
      <button
        type="button"
        onClick={() => setLang("fa")}
        className={classNames(
          "rounded-full px-2.5 py-1 transition-colors",
          lang === "fa" ? "bg-brand text-white" : "text-fg-muted hover:text-fg"
        )}
      >
        فا
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={classNames(
          "rounded-full px-2.5 py-1 transition-colors",
          lang === "en" ? "bg-brand text-white" : "text-fg-muted hover:text-fg"
        )}
      >
        EN
      </button>
    </div>
  );
}
