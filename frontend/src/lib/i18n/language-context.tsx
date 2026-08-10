"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries, type Language } from "./dictionaries";

const STORAGE_KEY = "pas_lang";
const DEFAULT_LANG: Language = "fa";

function getDirection(lang: Language): "rtl" | "ltr" {
  return lang === "fa" ? "rtl" : "ltr";
}

function getNested(obj: any, path: string): unknown {
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = vars[key];
    return value === undefined ? match : String(value);
  });
}

interface LanguageContextValue {
  lang: Language;
  dir: "rtl" | "ltr";
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  /** Translate a dot-notation key, e.g. t("auth.login.title") */
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function applyDocumentAttributes(lang: Language) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.dir = getDirection(lang);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(DEFAULT_LANG);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
    const initial = stored === "fa" || stored === "en" ? stored : DEFAULT_LANG;
    setLangState(initial);
    applyDocumentAttributes(initial);
  }, []);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyDocumentAttributes(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "fa" ? "en" : "fa");
  }, [lang, setLang]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const value = getNested(dictionaries[lang], key);
      if (typeof value === "string") return interpolate(value, vars);
      // Fall back to Persian, then to the raw key, so a missing
      // translation never crashes the UI.
      const fallback = getNested(dictionaries.fa, key);
      if (typeof fallback === "string") return interpolate(fallback, vars);
      return key;
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, dir: getDirection(lang), setLang, toggleLang, t }),
    [lang, setLang, toggleLang, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
