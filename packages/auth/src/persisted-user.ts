import type { AuthUser } from './types';

/**
 * Persisted-to-localStorage subset of the authed user. We deliberately do NOT
 * store `email`, `emailVerified`, or `role` — they are sensitive enough that a
 * stray localStorage on a shared device should not leak them, and the role in
 * particular gates admin affordances (a tampered role could flash the admin UI
 * before /auth/me re-verifies). Display fields only.
 */
export interface PersistedUser {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

/** Strip a full AuthUser down to display-only fields before persisting. */
export function persistDisplayOnly(user: AuthUser): PersistedUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  };
}
