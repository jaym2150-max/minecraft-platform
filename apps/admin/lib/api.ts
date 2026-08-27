/**
 * Minimal API client for the admin app. Requests go to /api/v1/* and are
 * proxied to NestJS via the rewrite in next.config.js — same-origin, so the
 * session cookie is included automatically. (No basePath prefix: with
 * basePath configured, rewrite sources match the unprefixed path.)
 */
const BASE = '/api/v1';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Returns the full parsed JSON body (callers unwrap {data}/{meta}). */
export async function apiJson<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    cache: 'no-store',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (res.status === 401 || res.status === 403) {
    throw new ApiError(res.status, 'Not authorized');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    throw new ApiError(res.status, message ?? `Request failed (${res.status})`);
  }
  return (await res.json().catch(() => null)) as T;
}

const qs = (params: Record<string, string | number | undefined>) => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  return entries.length ? `?${new URLSearchParams(entries.map(([k, v]) => [k, String(v)]))}` : '';
};

export const adminApi = {
  // guides
  listAllGuides: (params: Record<string, string | number | undefined> = {}) =>
    apiJson<any>(`/guides${qs(params)}`),
  createGuide: (data: {
    title: string;
    slug?: string;
    excerpt?: string;
    body?: string;
    category?: string;
    status?: string;
  }) => apiJson<any>('/guides', { method: 'POST', body: JSON.stringify(data) }),
  updateGuide: (id: string, data: Record<string, unknown>) =>
    apiJson<any>(`/guides/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteGuide: (id: string) => apiJson<any>(`/guides/${id}`, { method: 'DELETE' }),
  seedGuides: () => apiJson<any>('/guides/seed', { method: 'POST' }),
  // data quality
  listDataQualityIssues: (params: Record<string, string | number | undefined> = {}) =>
    apiJson<any>(`/data-quality/issues${qs(params)}`),
  getDataQualitySummary: () => apiJson<any>('/data-quality/summary'),
  runDataQualityScan: () => apiJson<any>('/data-quality/scan', { method: 'POST' }),
  setDataQualityStatus: (id: string, status: string) =>
    apiJson<any>(`/data-quality/issues/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  // permissions
  listPermissions: () => apiJson<any>('/permissions'),
  seedPermissions: () => apiJson<any>('/permissions/seed', { method: 'POST' }),
  setRolePermission: (role: string, permissionId: string, granted: boolean) =>
    apiJson<any>(`/permissions/role/${role}`, {
      method: 'PATCH',
      body: JSON.stringify({ permissionId, granted }),
    }),
  listUserOverrides: (userId: string) => apiJson<any>(`/permissions/user/${userId}`),
  setUserOverride: (userId: string, permissionId: string, granted: boolean, reason?: string) =>
    apiJson<any>(`/permissions/user/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ permissionId, granted, reason }),
    }),
  removeUserOverride: (userId: string, permissionId: string) =>
    apiJson<any>(`/permissions/user/${userId}/${permissionId}`, { method: 'DELETE' }),
  // integrations
  listProviders: () => apiJson<any>('/admin/integrations/providers'),
  triggerSync: (type: string, opts: Record<string, unknown> = {}) =>
    apiJson<any>('/admin/integrations/sync', {
      method: 'POST',
      body: JSON.stringify({ type, ...opts }),
    }),
  listSyncs: (params: Record<string, string | number | undefined> = {}) =>
    apiJson<any>(`/admin/integrations/syncs${qs(params)}`),
  getSync: (id: string) => apiJson<any>(`/admin/integrations/syncs/${id}`),
  syncProject: (slug: string) =>
    apiJson<any>(`/admin/integrations/projects/${encodeURIComponent(slug)}/sync`, {
      method: 'POST',
    }),
  getAnalytics: () => apiJson<any>('/admin/analytics'),
  listUsers: (params: Record<string, string | number | undefined> = {}) =>
    apiJson<any>(`/admin/users${qs(params)}`),
  listReports: (params: Record<string, string | number | undefined> = {}) =>
    apiJson<any>(`/moderation/reports${qs(params)}`),
  getReportStats: () => apiJson<any>('/moderation/reports/stats'),
  resolveReport: (id: string, status: 'RESOLVED' | 'DISMISSED') =>
    apiJson<any>(`/moderation/reports/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
  listProjects: (params: Record<string, string | number | undefined> = {}) =>
    apiJson<any>(`/projects${qs(params)}`),
  updateProjectStatus: (id: string, status: string) =>
    apiJson<any>(`/admin/projects/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  updateProjectFeature: (id: string, featured: boolean) =>
    apiJson<any>(`/admin/projects/${id}/feature`, {
      method: 'PATCH',
      body: JSON.stringify({ featured }),
    }),
};
