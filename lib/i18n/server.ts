import { translations, type Locale, type TranslationKey } from "./translations";

/**
 * Server-side translation helper.
 * Locale defaults to English — the client LanguageProvider stores the
 * preference in localStorage and a cookie, but for SSR pages the default
 * is intentionally English to avoid hydration mismatches.
 */
export function useTranslationServer(locale: Locale = "en") {
  const t = (key: TranslationKey): string =>
    translations[locale][key] ?? translations["en"][key] ?? key;
  return { t, locale };
}
