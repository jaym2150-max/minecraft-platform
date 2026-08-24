'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface OAuthResult {
  token: string;
  user: { id: string; username: string; email?: string; avatarUrl?: string };
}

export interface UseOAuthOptions {
  apiBaseUrl?: string;
  windowFeatures?: string;
  onSuccess?: (result: OAuthResult) => void;
  onError?: (error: string) => void;
}

export interface UseOAuthResult {
  start: (provider: string) => void;
  popup: Window | null;
  loading: boolean;
  error: string | null;
}

const DEFAULT_FEATURES = 'width=600,height=700,left=200,top=100';

export function useOAuth(options: UseOAuthOptions = {}): UseOAuthResult {
  const { apiBaseUrl = '', windowFeatures = DEFAULT_FEATURES, onSuccess, onError } = options;

  const [popup, setPopup] = useState<Window | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listenerRef = useRef<((event: MessageEvent) => void) | null>(null);
  const pollRef = useRef<number | null>(null);
  const loadingRef = useRef(false);
  loadingRef.current = loading;

  const cleanup = useCallback(() => {
    if (listenerRef.current && typeof window !== 'undefined') {
      window.removeEventListener('message', listenerRef.current);
      listenerRef.current = null;
    }
    if (pollRef.current != null && typeof window !== 'undefined') {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const start = useCallback(
    (provider: string) => {
      cleanup();
      setLoading(true);
      setError(null);

      const url = `${apiBaseUrl}/auth/${provider}`;
      const win = window.open(url, `oauth_${provider}`, windowFeatures);
      if (!win) {
        const message = 'Popup blocked — please allow popups for this site';
        setError(message);
        setLoading(false);
        onError?.(message);
        return;
      }
      setPopup(win);

      const expectedOrigin = window.location.origin;

      const listener = (event: MessageEvent) => {
        if (event.origin !== expectedOrigin) return;
        const data = event.data;
        if (!data || typeof data !== 'object') return;
        if (data.type === 'mcp-oauth' && data.token && data.user) {
          cleanup();
          try { win.close(); } catch { /* noop */ }
          setLoading(false);
          onSuccess?.({ token: data.token, user: data.user });
        } else if (data.type === 'mcp-oauth-error') {
          cleanup();
          try { win.close(); } catch { /* noop */ }
          const message = data.error || 'OAuth failed';
          setError(message);
          setLoading(false);
          onError?.(message);
        }
      };

      window.addEventListener('message', listener);
      listenerRef.current = listener;

      pollRef.current = window.setInterval(() => {
        if (win.closed) {
          cleanup();
          if (loadingRef.current) {
            const message = 'Authentication cancelled';
            setError(message);
            setLoading(false);
            onError?.(message);
          }
        }
      }, 500);
    },
    [apiBaseUrl, cleanup, onError, onSuccess, windowFeatures],
  );

  return { start, popup, loading, error };
}

export default useOAuth;
