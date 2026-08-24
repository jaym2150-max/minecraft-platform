import { McpAdminSDK } from '@mcp/sdk/admin';

/**
 * Admin-only SDK instance. Import this ONLY from the admin route so the
 * privileged method surface (ban/role/status/report resolution/license
 * authoring/admin analytics) is code-split into the /admin bundle and never
 * pulled into shared marketing/browse client chunks via `@/services/api`.
 *
 * Sessions are still cookie-based and the server authoritatively enforces
 * ADMIN/OWNER roles on every call; this split exists to shrink the client
 * attack surface and bundle size for non-admin visitors.
 */
export const adminSdk = new McpAdminSDK('/api/v1');
