'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { AUTH_USER_STORAGE_KEY, persistDisplayOnly } from '@mcp/auth';
import { seedCsrfToken } from '@mcp/utils/api-client';

type Status = 'processing' | 'success' | 'error';

function completeSignIn(router: ReturnType<typeof useRouter>, redirectTo: string) {
  window.setTimeout(() => {
    router.replace(redirectTo);
  }, 400);
}

function OAuthCallbackInner() {
  const router = useRouter();
  const search = useSearchParams();
  const [status, setStatus] = useState<Status>('processing');
  const [message, setMessage] = useState<string>('Completing sign in...');
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const errorParam = search?.get('error');
    const provider = search?.get('provider') ?? '';
    const code = search?.get('code');

    if (errorParam) {
      setStatus('error');
      setMessage(decodeURIComponent(errorParam));
      return;
    }

    // SECURITY: only honor same-origin relative paths. `//evil.com`
    // technically `startsWith('/')` but browsers treat it as a
    // protocol-relative absolute URL — open-redirect. Reject here so the
    // OAuth callback can never bounce the user to an attacker site via
    // a crafted callbackUrl in the OAuth redirect.
    const callbackUrlRaw = search?.get('callbackUrl');
    const isSameOriginRelative =
      !!callbackUrlRaw &&
      callbackUrlRaw.startsWith('/') &&
      !callbackUrlRaw.startsWith('//') &&
      !callbackUrlRaw.startsWith('/\\') &&
      !callbackUrlRaw.includes('\\');
    const redirectTo = isSameOriginRelative ? callbackUrlRaw! : '/dashboard';

    // Pre-seed the CSRF cookie+token before any authenticated mutation
    // happens. The exchange endpoint itself is CSRF-exempt (it has no
    // session yet), but the very next mutation (eg. persisting auth state)
    // needs the cookie+header in place.
    void seedCsrfToken().catch(() => null);

    if (code) {
      void exchangeCode(code, redirectTo, router).then((ok) => {
        if (ok) {
          setStatus('success');
          setMessage('Sign in successful. Redirecting...');
        }
      });
      return;
    }

    void verifyCookie(router).then((ok) => {
      if (!ok) {
        setStatus('error');
        setMessage('Authentication failed — missing consent code.');
      } else {
        setStatus('success');
        setMessage('Signed in via cookie. Redirecting...');
        completeSignIn(router, redirectTo);
      }
    });

    void provider;
  }, [router, search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
        {status === 'processing' && (
          <>
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Completing sign in</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Signed in</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Authentication failed</h1>
            <p className="text-sm text-muted-foreground mb-6">{message}</p>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <Link href="/auth/login">Back to sign in</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Go home</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

async function exchangeCode(
  code: string,
  redirectTo: string,
  router: ReturnType<typeof useRouter>,
): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/auth/oauth/exchange', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message ?? `Exchange failed (${res.status})`);
    }
    completeSignIn(router, redirectTo);
    return true;
  } catch (err: any) {
    console.error('[oauth] exchange failed', err);
    router.replace(
      `/auth/login?error=${encodeURIComponent(err?.message ?? 'OAuth exchange failed')}`,
    );
    return false;
  }
}

async function verifyCookie(router: ReturnType<typeof useRouter>): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/auth/me', { credentials: 'same-origin' });
    if (!res.ok) return false;
    const body = await res.json().catch(() => null);
    if (!body?.data?.id) return false;
    const user = body.data;
    // Persist only display fields (id/username/displayName/avatarUrl). The
    // full user object contains email + role; storing role in localStorage
    // enables a shared-device privilege escalation where a tampered role
    // flashes the admin UI before /auth/me re-verifies.
    try {
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(persistDisplayOnly(user)));
    } catch {
      /* private mode */
    }
    // Sessions are cookie-based (httpOnly, sent automatically); no bearer
    // token lives on the client, so there is nothing to set on the SDK here.
    void router;
    return true;
  } catch {
    return false;
  }
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <OAuthCallbackInner />
    </Suspense>
  );
}
