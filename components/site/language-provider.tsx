"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LANGUAGE, normalizeLanguageCode, translations, type LanguageCode } from "@/locales";

const STORAGE_KEY = "chamlija-language";

type TranslationValue = string | Record<string, any> | undefined;
type TranslationFn = (path: string, fallback?: string) => string;

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (value: LanguageCode) => void;
  t: TranslationFn;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolveTranslation(language: LanguageCode, path: string): TranslationValue {
  const source = translations[language] as Record<string, any>;
  const parts = path.split(".");
  let current: any = source;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }

  return current;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const next = normalizeLanguageCode(saved ?? undefined);
    setLanguageState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = useCallback((value: LanguageCode) => {
    setLanguageState(normalizeLanguageCode(value));
  }, []);

  const t = useCallback<TranslationFn>((path, fallback = "") => {
    const direct = resolveTranslation(language, path);
    if (typeof direct === "string") return direct;

    const defaultValue = resolveTranslation(DEFAULT_LANGUAGE, path);
    if (typeof defaultValue === "string") return defaultValue;

    return fallback;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
