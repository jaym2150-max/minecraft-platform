'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { AuthState, AuthUser, LoginCredentials, RegisterData } from './types';
import { ApiClient, seedCsrfToken, clearCsrfToken } from '@mcp/utils';
import { AUTH_USER_STORAGE_KEY } from './constants';
import { persistDisplayOnly } from './persisted-user';

export interface AuthSdk {
  login(email: string, password: string): Promise<{ data: { user: AuthUser } }>;
  register(data: {
    username: string;
    email: string;
    password: string;
  }): Promise<{ data: { user: AuthUser } }>;
  setAuthToken(token: string): void;
  clearAuthToken(): void;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_KEY = AUTH_USER_STORAGE_KEY;

const FALLBACK_API = new ApiClient();

// C42 (AUDIT.md): the FALLBACK_API singleton is module-scoped and survives
// hot module reloads in dev. Any stale Authorization header that an earlier
// lifecycle installed (via setAuthToken in a headless context, or a future
// auth-context path) would otherwise still ship on every /auth/me call. We
// clear the bearer at module init so a fresh page load starts cookie-only.
// This is belt-and-suspenders: the browser path never calls setAuthToken
// (it relies on the httpOnly cookie), but the explicit clear enforces that
// invariant regardless of future callers.
FALLBACK_API.clearAuthToken();

export function AuthProvider({ children, sdk }: { children: React.ReactNode; sdk?: AuthSdk }) {
  const sdkRef = useRef(sdk);
  sdkRef.current = sdk;

  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // D5 (AUDIT.md): deps intentionally empty — FALLBACK_API / USER_KEY /
    // seedCsrfToken are all module-scoped or imported singletons, so the
    // effect runs exactly once per mount (adding them as deps would trigger
    // a re-verify on every render).
    if (typeof window === 'undefined') return;
    const verify = async () => {
      // Pre-seed the CSRF cookie+token in production before any mutation can
      // happen. In dev the endpoint does nothing (CSRF is disabled). This also
      // has the side effect of warming a same-origin GET so the cookie is set
      // by the double-submit middleware ahead of the first POST.
      await seedCsrfToken().catch(() => null);
      try {
        const res = await FALLBACK_API.get<{ data: AuthUser }>('/auth/me');
        const verifiedUser = res.data;
        localStorage.setItem(USER_KEY, JSON.stringify(persistDisplayOnly(verifiedUser)));
        setState({ user: verifiedUser, token: null, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem(USER_KEY);
        setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    };

    verify();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const currentSdk = sdkRef.current;

    if (currentSdk) {
      const res = await currentSdk.login(credentials.email, credentials.password);
      const { user } = res.data;
      localStorage.setItem(USER_KEY, JSON.stringify(persistDisplayOnly(user)));
      setState({ user, token: null, isAuthenticated: true, isLoading: false });
    } else {
      const response = await FALLBACK_API.post<{ data: { user: AuthUser } }>(
        '/auth/login',
        credentials,
      );
      const user = response.data.user;
      localStorage.setItem(USER_KEY, JSON.stringify(persistDisplayOnly(user)));
      setState({ user, token: null, isAuthenticated: true, isLoading: false });
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const currentSdk = sdkRef.current;

    if (currentSdk) {
      const res = await currentSdk.register(data);
      const { user } = res.data;
      localStorage.setItem(USER_KEY, JSON.stringify(persistDisplayOnly(user)));
      setState({ user, token: null, isAuthenticated: true, isLoading: false });
    } else {
      const response = await FALLBACK_API.post<{ data: { user: AuthUser } }>(
        '/auth/register',
        data,
      );
      const user = response.data.user;
      localStorage.setItem(USER_KEY, JSON.stringify(persistDisplayOnly(user)));
      setState({ user, token: null, isAuthenticated: true, isLoading: false });
    }
  }, []);

  const logout = useCallback(() => {
    if (sdkRef.current) {
      sdkRef.current.clearAuthToken();
    } else {
      FALLBACK_API.clearAuthToken();
    }
    clearCsrfToken();
    localStorage.removeItem(USER_KEY);
    // D4 (AUDIT.md): previously a raw `fetch('/api/v1/auth/logout')` with
    // `.catch(() => {})` silently swallowed server failures — a successful
    // client-side clear could mask an un-cookie-cleared server session.
    // Use the SDK (cookies + CSRF token automatically attached, errors
    // surface as ApiError) so logout visibly fails when the server didn't
    // honor it. We fire-and-forget the Promise so the local state flip is
    // not blocked by the network round trip, but failures are logged
    // rather than swallowed.
    FALLBACK_API.post<{ data: null }>('/auth/logout', {}).catch((err) => {
      console.warn('[auth] server logout call failed (local state cleared):', err?.message ?? err);
    });
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateUser = useCallback((user: AuthUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(persistDisplayOnly(user)));
    setState((prev) => ({ ...prev, user }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
