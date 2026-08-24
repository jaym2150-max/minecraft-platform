/**
 * Lightweight i18n scaffolding — dictionary-based, no runtime dependency.
 * Usage:
 *   import { t, setLocale, getLocale } from '@mcp/utils/i18n';
 *   t('home.hero.title')
 *
 * Locale is resolved client-side from localStorage (`mcp_locale`), falling
 * back to the browser language, then 'en'. Server components can read the
 * NEXT_LOCALE cookie (already set by the existing locale switcher).
 *
 * Adding a language: add a file to `locales/` with the same key shape.
 * Missing keys fall back to English, then to the key itself.
 */

export type Locale = 'en' | 'es' | 'pt-BR' | 'zh';

import en from './locales/en';
import es from './locales/es';
import ptBR from './locales/pt-BR';
import zh from './locales/zh';

const DICTS: Record<Locale, Record<string, string>> = {
  en,
  es,
  'pt-BR': ptBR,
  zh,
};

let currentLocale: Locale = 'en';

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  if (DICTS[locale]) currentLocale = locale;
}

/** Resolve the initial locale from storage/browser (client only). */
export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem('mcp_locale') as Locale | null;
  if (stored && DICTS[stored]) return stored;
  const nav = navigator.language as Locale;
  if (DICTS[nav]) return nav;
  // loose match: "pt" → "pt-BR"
  const prefix = navigator.language.split('-')[0];
  const loose = Object.keys(DICTS).find((k) => k.startsWith(prefix));
  return (loose as Locale) ?? 'en';
}

/** Translate a dotted key; supports {var} interpolation. */
export function t(key: string, vars?: Record<string, string | number>): string {
  let s = DICTS[currentLocale][key] ?? DICTS.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return s;
}
