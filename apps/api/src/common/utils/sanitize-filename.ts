/**
 * Sanitize a user-supplied filename so it is safe to embed in an S3 object key.
 *
 * Threat model: an attacker uploads a file whose `originalname` contains path
 * separators (`/`, `\`), traversal sequences (`..`), or control characters in
 * an attempt to escape the intended `projects/{id}/uploads/...` key prefix or
 * overwrite another object. This collapses separators, strips traversal and
 * control chars, and enforces a sane length while preserving readability.
 *
 * C13 (AUDIT.md): if the result would mangle the original base name away to
 * the bare placeholder `'upload'`, we append a short random suffix so two
 * uploads whose originals sanitize to the same dud can't collide on the
 * same `uploads/upload` key (which previously happened for any file whose
 * name was only-invalid chars — every such upload overwrote the previous
 * one because sanitizeObjectKey silently handed everyone the same key). The
 * caller still ends up with a stable, valid key. We do NOT reject the
 * request: bytes are already magic-byte + size-validated, and a reject
 * would let an attacker probe for filename-only quirks.
 */
export function sanitizeObjectKey(filename: string): string {
  const fallback = 'upload';
  if (!filename || typeof filename !== 'string') {
    return `${fallback}-${shortRandom()}`;
  }

  const cleaned =
    filename
      // Normalize backslashes to forward slashes, then drop ALL separators so
      // the filename cannot introduce a new path segment.
      .replace(/\\+/g, '/')
      .split('/')
      .pop()
      ?.replace(/\.\./g, '') // Remove traversal remnants.
      .replace(/[\x00-\x1f\x7f]/g, '') // Remove path/control characters.
      .replace(/[^\w.\-]+/g, '_') // Replace anything else with underscore.
      .replace(/_+/g, '_') // Collapse repeated underscores.
      .replace(/\.+/g, '.') // Collapse repeated dots.
      .replace(/^[._]+|[._]+$/g, '') // Trim leading/trailing dots/underscores.
      .slice(0, 128) ?? '';

  if (!cleaned || cleaned === fallback) {
    return `${fallback}-${shortRandom()}`;
  }
  return cleaned;
}

/**
 * 6 base36 chars from crypto.getRandomValues where available (~36 bits of
 * entropy — plenty to avoid collisions across the modest upload volume).
 */
function shortRandom(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = crypto.getRandomValues(new Uint8Array(4));
    let n = 0;
    for (let i = 0; i < bytes.length; i++) n = (n * 256 + bytes[i]) >>> 0;
    return n.toString(36);
  }
  try {
    return require('crypto').randomBytes(4).toString('hex').slice(0, 6);
  } catch {
    return Math.random().toString(36).slice(2, 8);
  }
}
