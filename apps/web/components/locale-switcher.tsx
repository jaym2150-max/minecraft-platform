'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n, SUPPORTED_LOCALES, type Locale } from '@/i18n/provider';
import { Check, Languages } from 'lucide-react';

const LABEL: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  hi: 'हिन्दी',
};

const FLAG: Record<Locale, string> = {
  en: 'EN',
  es: 'ES',
  hi: 'HI',
};

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', close);
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('mousedown', close);
        document.removeEventListener('keydown', onKey);
      };
    }
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('common.openLanguageMenu')}
        className="hover:bg-muted flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
      >
        <Languages className="h-4 w-4" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={t('common.language')}
          className="bg-popover absolute right-0 z-50 mt-2 w-44 rounded-xl border p-1 shadow-lg"
        >
          {SUPPORTED_LOCALES.map((loc) => (
            <button
              key={loc}
              role="menuitem"
              onClick={() => {
                setLocale(loc);
                setOpen(false);
              }}
              className="hover:bg-muted flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
            >
              <span className="bg-muted text-muted-foreground inline-flex h-5 w-7 items-center justify-center rounded text-[10px] font-bold tracking-wide">
                {FLAG[loc]}
              </span>
              <span className="flex-1 text-left">{LABEL[loc]}</span>
              {locale === loc && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
