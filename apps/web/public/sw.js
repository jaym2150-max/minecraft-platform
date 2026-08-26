 
// Minecraft Platform service worker.
// Strategy summary:
//   - App shell + static assets: cache-first, background revalidate.
//   - Same-origin pages: network-first with offline fallback.
//   - API GET (categories/loaders/projects, static listings): stale-while-revalidate.
//   - API POST/PUT/DELETE: never cached.
//   - Offline navigations: serve the last cached "/offline" page if available,
//     otherwise the app shell.

const VERSION = 'mp-sw-v1';
const SHELL_CACHE = `${VERSION}-shell`;
const ASSETS_CACHE = `${VERSION}-assets`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const API_CACHE = `${VERSION}-api`;

const SHELL_URLS = [
  '/',
  '/offline',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icon-maskable.svg',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await cache.addAll(SHELL_URLS).catch(() => undefined);
      // Activate the new SW without waiting for tabs to close.
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL_CACHE, ASSETS_CACHE, RUNTIME_CACHE, API_CACHE]);
      const names = await caches.keys();
      await Promise.all(names.filter((n) => !keep.has(n)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

function isApiGet(url) {
  return (
    url.origin === self.location.origin &&
    url.pathname.startsWith('/api/v1') &&
    url.method === 'GET'
  );
}

function isStaticAsset(url) {
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith('/_next/static/')) return true;
  if (url.pathname.startsWith('/_next/image')) return true;
  if (/\.(?:js|css|woff2?|ttf|svg|png|jpg|jpeg|webp|ico)$/i.test(url.pathname)) return true;
  return false;
}

function isPageNavigation(request) {
  return (
    request.mode === 'navigate' ||
    (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'))
  );
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSETS_CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) {
    // Background revalidate so a fresh copy lands for the next request.
    fetch(request)
      .then((res) => {
        if (res && res.ok) cache.put(request, res.clone()).catch(() => undefined);
      })
      .catch(() => undefined);
    return cached;
  }
  try {
    const res = await fetch(request);
    if (res && res.ok) cache.put(request, res.clone()).catch(() => undefined);
    return res;
  } catch (err) {
    // Last-ditch fallback for assets: return a synthetic 504.
    return new Response('offline', { status: 504, statusText: 'offline' });
  }
}

async function networkFirst(request) {
  try {
    const res = await fetch(request);
    if (res && res.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, res.clone()).catch(() => undefined);
    }
    return res;
  } catch (err) {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    const shell = await caches.open(SHELL_CACHE);
    const offline = await shell.match('/offline');
    if (offline) return offline;
    return new Response('offline', { status: 503, statusText: 'offline' });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });
  const network = fetch(request)
    .then((res) => {
      if (res && res.ok) cache.put(request, res.clone()).catch(() => undefined);
      return res;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (isApiGet(url)) {
    // Only cache idempotent catalog GETs; let auth/session pass through.
    if (
      url.pathname.includes('/categories') ||
      url.pathname.includes('/loaders') ||
      url.pathname.includes('/minecraft-versions') ||
      url.pathname.includes('/tags') ||
      url.pathname.includes('/projects')
    ) {
      event.respondWith(staleWhileRevalidate(request));
      return;
    }
    // Other API GETs (auth, user-specific) — network only.
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (isPageNavigation(request)) {
    event.respondWith(networkFirst(request));
    return;
  }
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
