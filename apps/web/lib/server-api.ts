/**
 * Server-side API helper for RSC pages (server components and
 * generateMetadata). Uses absolute URLs because relative `/api/v1` paths
 * only resolve in the browser via the Next rewrite.
 *
 * Every call is defensive: on any failure it returns null so the page
 * degrades to client-side fetching instead of failing the render.
 */
const API_BASE = process.env.API_URL || 'http://localhost:4000';

export async function serverApi<T = any>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1${path}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const body = await res.json();
    return (body?.data ?? body) as T;
  } catch {
    return null;
  }
}
