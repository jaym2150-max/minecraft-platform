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
  token: string;
  refreshToken: string;
}
