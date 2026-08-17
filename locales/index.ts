import en from "./en";
import zu from "./zu";
import xh from "./xh";
import af from "./af";
import tr from "./tr";

export type LanguageCode = "en" | "zu" | "xh" | "af" | "tr";

export const DEFAULT_LANGUAGE: LanguageCode = "en";
export const LANGUAGES: Array<{ code: LanguageCode; label: string; flag: string }> = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "zu", label: "isiZulu", flag: "🇿🇦" },
  { code: "xh", label: "isiXhosa", flag: "🇿🇦" },
  { code: "af", label: "Afrikaans", flag: "🇿🇦" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
];

export const translations = { en, zu, xh, af, tr } as const;

export function normalizeLanguageCode(value?: string | null): LanguageCode {
  if (value === "zu" || value === "xh" || value === "af" || value === "tr") return value;
  return DEFAULT_LANGUAGE;
}

export function getText(language: LanguageCode, path: string, fallback = ""): string {
  const parts = path.split(".");
  const source = translations[language] as Record<string, any>;
  let current: any = source;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      const defaultValue = translations[DEFAULT_LANGUAGE] as Record<string, any>;
      let fallbackCurrent: any = defaultValue;

      for (const defaultPart of parts) {
        if (fallbackCurrent && typeof fallbackCurrent === "object" && defaultPart in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[defaultPart];
        } else {
          return fallback;
        }
      }

      return typeof fallbackCurrent === "string" ? fallbackCurrent : fallback;
    }
  }

  return typeof current === "string" ? current : fallback;
}

export function t(language: LanguageCode, path: string, fallback?: string): string {
  return getText(language, path, fallback ?? "");
}

export function getLanguageMeta(code: LanguageCode) {
  return LANGUAGES.find((item) => item.code === code) ?? LANGUAGES[0];
}
