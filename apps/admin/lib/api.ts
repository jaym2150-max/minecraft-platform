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
