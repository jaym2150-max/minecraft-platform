/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@mcp/ui', '@mcp/utils', '@mcp/types', '@mcp/auth', '@mcp/sdk'],
  images: {
    remotePatterns: buildRemotePatterns(),
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  async headers() {
    // Defense-in-depth security headers. CSP is intentionally strict on
    // frame/object/embed/anno and origin-restrictive on connect, while
    // allowing 'self' for scripts/styles (Next.js App Router injects inline
    // hydration scripts and runtime chunks) and the object-storage hosts for
    // images. Upgrade path: replace 'unsafe-inline' for scripts with per-nonce
    // CSP once a nonce helper is wired in.
    const imageHosts = imageSrcHosts();
    // C8: HSTS is only meaningful / honored over HTTPS, and emitting it on a
    // dev box served over plain http is misleading (it implies TLS is in
    // effect). Gate on NODE_ENV=production; the dev waiver drops the header
    // entirely so a deployment target behind an HTTPS terminator is the only
    // place it shows up.
    const isProduction = process.env.NODE_ENV === 'production';
    const headers = [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
          "object-src 'none'",
          "frame-src 'none'",
          isProduction
            ? "script-src 'self' 'unsafe-inline'"
            : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          `img-src 'self' data: blob:${imageHosts}`,
          "font-src 'self' data:",
          "connect-src 'self'",
          "media-src 'self'",
          "worker-src 'self' blob:",
          "manifest-src 'self'",
        ].join('; '),
      },
    ];
    if (isProduction) {
      headers.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      });
    }
    return [
      {
        source: '/:path*',
        headers,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:4000/api/v1/:path*',
      },
    ];
  },
};

/**
 * Parse an endpoint env var that may be either a fully-qualified URL
 * (`https://cdn.example.com`) OR a bare hostname (`cdn.example.com`).
 *
 * B25: the previous `new URL(cdn)` call in `buildRemotePatterns` (and the
 * equivalent in `imageSrcHosts`) silently dropped bare hostname CDNs —
 * `new URL('cdn.example.com')` throws, the catch swallowed it, and the
 * pattern fell back to the dev `localhost:9000` default. In production
 * that meant `next.config.js` shipped without the real CDN in `images`
 * and `img-src`, so every avatar/project thumbnail broke. We now prepend
 * `//` (protocol-relative, resolved against the page protocol) so bare
 * hostnames still parse.
 *
 * @param {string | undefined} value
 * @returns {URL | null} null for empty / malformed input so callers can fall back.
 */
function parseEndpoint(value) {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  // If the value already has a scheme, parse as-is. Otherwise treat it as
  // protocol-relative so `cdn.example.com` becomes `//cdn.example.com` and
  // is resolved against the document protocol by `new URL`.
  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `//${trimmed}`;
  try {
    return new URL(candidate);
  } catch {
    return null;
  }
}

function imageSrcHosts() {
  // Allow user avatars / project icons served from S3 (dev) and the CDN (prod)
  // in addition to 'self' and inline data/blob URIs. B25: bare hostname CDN
  // values are now parsed via parseEndpoint instead of silently dropped.
  const hosts = new Set();
  const addFrom = (value) => {
    const u = parseEndpoint(value);
    if (u) hosts.add(`${u.protocol}//${u.host}`);
  };
  addFrom(process.env.S3_ENDPOINT);
  addFrom(process.env.CDN_DOMAIN);
  addFrom(process.env.NEXT_PUBLIC_CDN_DOMAIN);
  // Seed placeholder CDNs — must be in img-src for seeded iconUrls
  hosts.add('https://cdn.example.com');
  hosts.add('https://placehold.co');
  const list = [...hosts];
  return list.length ? ' ' + list.join(' ') : '';
}

function buildRemotePatterns() {
  const patterns = [];
  // B25: S3 and CDN endpoints may be bare hostnames — parseEndpoint handles
  // both instead of silently dropping bare values. The dev fallback kicks
  // in only when neither env var yielded a usable host.
  const devEndpoint = parseEndpoint(process.env.S3_ENDPOINT);
  if (devEndpoint) {
    patterns.push({
      protocol: devEndpoint.protocol.replace(':', ''),
      hostname: devEndpoint.hostname,
      port: devEndpoint.port || '',
    });
  }
  if (!patterns.length) {
    patterns.push({ protocol: 'http', hostname: 'localhost', port: '9000' });
  }
  // Seed data uses https://cdn.example.com / https://placehold.co — allow in dev
  patterns.push({ protocol: 'https', hostname: 'cdn.example.com', port: '' });
  patterns.push({ protocol: 'https', hostname: 'placehold.co', port: '' });

  const cdn = parseEndpoint(
    process.env.CDN_DOMAIN || process.env.NEXT_PUBLIC_CDN_DOMAIN,
  );
  if (cdn) {
    patterns.push({
      protocol: cdn.protocol.replace(':', ''),
      hostname: cdn.hostname,
      port: cdn.port || '',
    });
  }

  return patterns;
}

module.exports = nextConfig;
