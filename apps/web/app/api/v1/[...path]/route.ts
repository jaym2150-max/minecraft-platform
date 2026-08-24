import { NextRequest, NextResponse } from 'next/server';

const API_ORIGIN = process.env.API_URL || 'http://localhost:4000';
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const HOP_BY_HOP = new Set([
  'host', 'connection', 'keep-alive', 'transfer-encoding',
  'te', 'trailer', 'upgrade', 'proxy-authorization',
  'proxy-authenticate', 'content-encoding', 'content-length',
]);

/**
 * Headers a client may spoof to influence how the upstream API sees the
 * request origin / identity. The proxy MUST strip these and re-inject its
 * own values derived from {@link API_ORIGIN}; otherwise an attacker can
 * set `X-Forwarded-For` to bypass IP-based rate limits, or
 * `X-Forwarded-Host` to poison OAuth callback link generation, etc.
 *
 * This is the allowlist-complement of RFC 7230 hop-by-hop: it covers the
 * forwarding / poisoning headers that proxies conventionally overwrite.
 * See AUDIT.md B12.
 */
const STRIPPED_FORWARDING_HEADERS = new Set([
  'x-forwarded-for',
  'x-forwarded-host',
  'x-forwarded-proto',
  'x-forwarded-port',
  'x-forwarded-server',
  'x-real-ip',
  'x-original-forwarded-for',
  'x-forwarded-scheme',
  'forwarded',
  'via',
]);

export const dynamic = 'force-dynamic';

/**
 * Wrap a request body stream so we can reject uploads larger than
 * MAX_UPLOAD_BYTES even when the client omits a Content-Length header
 * (chunked transfer encoding). The transform reads through and forwards
 * every chunk, but once the cumulative size exceeds the cap it cancels the
 * upstream read by throwing — which propagates an abort to `fetch`.
 */
function limitBody(
  body: ReadableStream<Uint8Array> | null,
  maxBytes: number,
): ReadableStream<Uint8Array> | null {
  if (!body) return null;
  const reader = body.getReader();
  let received = 0;
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        if (!value) return;
        received += value.byteLength;
        if (received > maxBytes) {
          // Hard-cap reached: stop forwarding and surface a 413 to the caller.
          await reader.cancel().catch(() => {});
          controller.error(new RequestBodyTooLargeError());
          return;
        }
        controller.enqueue(value);
      } catch (err) {
        controller.error(err);
      }
    },
    cancel(reason) {
      reader.cancel(reason).catch(() => {});
    },
  });
}

class RequestBodyTooLargeError extends Error {
  constructor() {
    super('Request body exceeds 50MB limit');
    this.name = 'RequestBodyTooLargeError';
  }
}

async function proxy(request: NextRequest, path: string[]) {
  const url = new URL(request.url);
  const target = `${API_ORIGIN}/api/v1/${path.join('/')}${url.search}`;

  const isStreamingMethod = request.method !== 'GET' && request.method !== 'HEAD';

  if (isStreamingMethod) {
    const contentLengthHeader = request.headers.get('content-length');
    if (contentLengthHeader !== null) {
      const contentLength = Number(contentLengthHeader);
      if (Number.isFinite(contentLength) && contentLength > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { statusCode: 413, message: 'Payload Too Large', error: 'Request body exceeds 50MB limit' },
          { status: 413 },
        );
      }
    }
    // Missing/zero Content-Length means chunked encoding — the only path that
    // previously bypassed the cap. Forward the body through a counting stream
    // so an oversized chunked payload is rejected mid-upload instead of being
    // streamed straight to the upstream API.
  }

  const originUrl = new URL(API_ORIGIN);

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    // Drop hop-by-hop headers (per RFC 7230) AND any client-supplied
    // forwarding/poisoning headers. The latter previously passed straight
    // through, so an attacker could forge `X-Forwarded-For: 1.2.3.4` to
    // reset per-IP rate limits on the API, or `X-Forwarded-Host` to poison
    // password-reset / OAuth callback link generation (AUDIT B12). After
    // stripping, we re-inject our own values derived solely from the
    // trusted API_ORIGIN below.
    if (HOP_BY_HOP.has(lower) || STRIPPED_FORWARDING_HEADERS.has(lower)) {
      return;
    }
    headers.set(key, value);
  });
  // Trustworthy forwarding headers derived from server config, never from
  // the client. `x-forwarded-proto` is the scheme the API_ORIGIN uses, and
  // `x-forwarded-host` is the upstream host so any URL the API generates
  // (eg. password-reset links via the Web URL env) is built from the
  // configured public hostname rather than whatever the attacker declared.
  headers.set('host', originUrl.host);
  headers.set('x-forwarded-proto', originUrl.protocol.replace(':', ''));
  headers.set('x-forwarded-host', originUrl.host);

  const proxiedBody = isStreamingMethod ? limitBody(request.body, MAX_UPLOAD_BYTES) : undefined;

  const fetchInit: RequestInit & { duplex?: 'half' } = {
    method: request.method,
    headers,
    body: proxiedBody,
    redirect: 'manual',
    signal: request.signal,
  };
  if (isStreamingMethod) {
    fetchInit.duplex = 'half';
  }

  try {
    const response = await fetch(target, fetchInit);

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (!HOP_BY_HOP.has(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        try {
          const parsed = new URL(location);
          const apiHost = originUrl.host;
          if (parsed.host !== apiHost) {
            return NextResponse.json(
              { statusCode: 502, message: 'Bad Gateway', error: 'Upstream redirect blocked for safety' },
              { status: 502 },
            );
          }
          return NextResponse.redirect(parsed, response.status);
        } catch {
          return NextResponse.json(
            { statusCode: 502, message: 'Bad Gateway', error: 'Upstream redirect blocked for safety' },
            { status: 502 },
          );
        }
      }
    }

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json(
        { statusCode: 413, message: 'Payload Too Large', error: 'Request body exceeds 50MB limit' },
        { status: 413 },
      );
    }
    // Log only the upstream name + status, never the full target URL or body.
    console.error('[api-proxy] upstream (%s) failed', new URL(API_ORIGIN).host);
    return NextResponse.json(
      { statusCode: 502, message: 'Bad Gateway', error: 'API server unreachable' },
      { status: 502 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxy(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxy(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxy(request, path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxy(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxy(request, path);
}
