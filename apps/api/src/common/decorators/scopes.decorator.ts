import { SetMetadata } from '@nestjs/common';
import { ApiKeyScope } from '@prisma/client';

export const SCOPES_KEY = 'requiredScopes';

/**
 * Mark a route handler as requiring one of the given API key scopes (OR
 * semantics: passing any one scope in the list is sufficient). The
 * ScopesGuard reads this metadata and compares it against the scopes
 * attached to the requesting API key on `req.user.scopes`.
 *
 * Sessions authenticated via JWT always satisfy scope checks; the guard
 * treats them as having the implicit ADMIN-equivalent set.
 */
export const Scopes = (...scopes: ApiKeyScope[]) => SetMetadata(SCOPES_KEY, scopes);
