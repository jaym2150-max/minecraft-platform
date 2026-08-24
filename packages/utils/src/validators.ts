export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < 3) return { valid: false, error: 'Username must be at least 3 characters' };
  if (username.length > 32) return { valid: false, error: 'Username must be at most 32 characters' };
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) return { valid: false, error: 'Password must be at least 8 characters' };
  if (password.length > 128) return { valid: false, error: 'Password must be at most 128 characters' };
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  return { valid: true };
}

export function isValidUrl(url: string): boolean {
  // C48 (AUDIT.md): the previous implementation only checked that `new URL`
  // could parse the input, which happily accepted `javascript:alert(1)` and
  // `data:text/html,...` -- both of which execute in any href/img/src sink.
  // We now allowlist absolute http(s) schemes OR relative/server-absolute
  // paths, and reject any other protocol (the typical XSS payload vector).
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed === '') return false;
  // Relative + server-relative URLs are safe (no scheme at all).
  if (/^[/?#]/.test(trimmed)) return true;
  // The bare protocol-relative `//host` form is parseable but browser-
  // dangerous in attribute sinks -- reject it explicitly rather than letting
  // `new URL('//evil.com')` round-trip as a near-null origin.
  if (trimmed.startsWith('//')) return false;
  try {
    const u = new URL(trimmed);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Escape a string for safe interpolation as HTML text or inside a
 * double-quoted attribute. ESCAPER, not a sanitizer -- it does not strip
 * disallowed tags; if you need actual HTML sanitization use the per-renderer
 * pipeline (apps/web/lib/markdown.ts which runs DOMPurify + a tag/scheme scrub).
 *
 * C48 (AUDIT.md): added backtick escape (defense against template-literal
 * attribute breakouts) so the function is safe for text and double-quoted
 * attribute contexts. Returns '' for null/undefined rather than
 * String(null).
 */
export function sanitizeHtml(input: string): string {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/`/g, "&#x60;");
}

export function parseQueryParams(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== '',
  );
  if (entries.length === 0) return '';
  return '?' + entries.map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(String(value))).join('&');
}

