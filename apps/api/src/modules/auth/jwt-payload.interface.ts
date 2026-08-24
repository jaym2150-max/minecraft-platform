export interface JwtPayload {
  sub: string; // user id
  username: string;
  email: string;
  role: string;
  // Discriminates the token purpose. `access` (default) tokens are validated
  // by JwtStrategy on every API call. `refresh` tokens are validated only by
  // POST /auth/refresh and are never honored as a session credential directly.
  // Refresh tokens are signed with a separate secret (`refreshTokenSecret`)
  // so a leaked access secret cannot mint long-lived refresh tokens.
  type?: 'access' | 'refresh';
  // Unique session id. A hash of this value is stored in the Session table and
  // checked on every request so tokens can actually be revoked (logout,
  // password change, admin action) — without it a JWT stays valid until it
  // expires regardless of anything the server does.
  jti?: string;
}