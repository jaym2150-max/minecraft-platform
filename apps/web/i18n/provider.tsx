'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import en from './en.json';
import es from './es.json';
import hi from './hi.json';

export const SUPPORTED_LOCALES = ['en', 'es', 'hi'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

const MESSAGES: Record<Locale, Record<string, any>> = {
  en,
  es,
  hi,
};

const STORAGE_KEY = 'mcp.locale';

interface I18nContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  /** Format a key path like "common.signIn", optionally with placeholders. */
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, name) => String(vars[name] ?? m));
}

function resolve(messages: Record<string, any>, key: string): string {
  const parts = key.split('.');
  let cur: any = messages;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
    else return key;
  }
  return typeof cur === 'string' ? cur : key;
}

function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;
  } catch {
    /* localStorage may be disabled */
  }
  // Honor Accept-Language (browser preference) before defaulting.
  const nav = navigator.language?.toLowerCase() ?? '';
  for (const loc of SUPPORTED_LOCALES) {
    if (nav.startsWith(loc)) return loc;
  }
  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const detected = detectInitialLocale();
    setLocaleState(detected);
    document.documentElement.lang = detected;
  }, []);

  const setLocale = useCallback((next: Locale) => {
    if (!SUPPORTED_LOCALES.includes(next)) return;
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = next;
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const primary = resolve(MESSAGES[locale], key);
      if (primary !== key) return interpolate(primary, vars);
      // Fallback to English, then return the key as a last resort so missing
      // strings are visible in development.
      const fallback = resolve(MESSAGES[DEFAULT_LOCALE], key);
      return interpolate(fallback, vars);
    },
    [locale],
  );

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // SSR fallback: render with the default English bundle so static pages
    // still have a working translator. The client-side provider will hydrate
    // and switch to the user's saved preference.
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => undefined,
      t: (key: string, vars?: Record<string, string | number>) =>
        interpolate(resolve(MESSAGES[DEFAULT_LOCALE], key), vars),
    };
  }
  return ctx;
}
