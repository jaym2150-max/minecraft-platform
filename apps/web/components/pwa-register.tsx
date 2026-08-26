'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker shipped from /sw.js. Only runs in the browser
 * and only over a secure context (or localhost) so dev environments without
 * HTTPS skip registration gracefully.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (!window.isSecureContext) return;

    const url = '/sw.js';
    navigator.serviceWorker
      .register(url, { scope: '/', updateViaCache: 'none' })
      .catch(() => undefined);

    // Surface waiting updates so the new SW activates on next nav.
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      // best-effort reload so the new SW takes effect without a manual refresh
      // window.location.reload();
    });
  }, []);

  return null;
}
