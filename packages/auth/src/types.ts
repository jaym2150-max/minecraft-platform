export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthUser {
  id: string;
  username: string;
  displayName?: string;
  email: string;
  emailVerified: boolean;
  avatarUrl?: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN' | 'OWNER';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthResponse {
  user: AuthUser;
}

/**
 * Optional fields the auth provider surface may expose when authenticating
 * via a transport that returns tokens in the body (eg. a test harness). The
 * browser-based flow keeps both tokens in httpOnly cookies and never surfaces
 * them to JS, so production callers MUST NOT rely on these being set.
 */
export interface AuthResponseWithTokens extends AuthResponse {
  token?: string;
  refreshToken?: string;
}
