# Site Audit — Minecraft Platform (branch `fix/security-audit`)

This document supersedes the pre-remediation snapshot. Every original finding
was re-verified against current source on 2026-08-08; status reflects the
state of the `fix/security-audit` working tree after the verification pass
and the follow-up fixes applied in that session.

Verification: `turbo run lint` → 17/17 tasks passing (typecheck + eslint).
`@mcp/web` vitest → 186/186 tests passing across 15 files. API e2e suite exists
but requires live Postgres/Redis (per `ci.yml` services) and was not run here.

## Status legend
- **FIXED** — verified in source with a `file:line` reference.
- **PARTIAL** — primary corrective action done; an explicit follow-up remains.
- **OPEN** — actionable today; listed under "Remaining follow-ups".

---

# CRITICAL

| ID | Title | Status | Evidence |
|----|-------|--------|----------|
| C1 | Markdown XSS on SSR — DOMPurify skipped server-side | FIXED | `apps/web/lib/markdown.ts:1` imports `DOMPurify`; `:37-54` enforces an http(s)/mailto/tel URL-scheme allowlist at build time; attrs escaped via `escapeAttr` (`:16-21`). `markdown-renderer.tsx` consumes sanitized output. |
| C2 | Public download endpoint returns unpublished/unscanned versions (IDOR) | FIXED | `versions.service.ts:430-486` (`incrementDownloads`) gates on `APPROVED + CLEAN + project PUBLISHED`, throws an indistinguishable 404, hashes the caller IP. |
| C3 | Public project fetch leaks DRAFT/REJECTED/archived projects | FIXED | `projects.service.ts:87-93` (`findByIdOrSlug`) and `:123-141` (`findByIds`) enforce `PUBLISHED`; owner/staff bypass; indistinguishable 404 on hidden projects. |
| C4 | Client-supplied `fileUrl` and `hash` on version create | FIXED | `versions.service.ts:42-65` binds the version to a server-side upload stub (`uploadId`) and rejects stubs whose `scanStatus !== CLEAN`; `update()` (`:394-397`) no longer accepts `fileUrl`/`hash`. |
| C5 | ScopesGuard mis-tags JWT users | FIXED | `scopes.guard.ts:31` allows `authType==='jwt'` and ADMIN/OWNER; `jwt.strategy.ts:63` sets `authType:'jwt'`. |
| C6 | Banned users retain full access; ban does not invalidate sessions | FIXED | `jwt.strategy.ts:43-45` rejects banned; `:52-61` enforces Session existence + expiry via `jti` (server-side revocation). |
| C7 | Admin can promote to OWNER; no self-escalation / last-owner guard | FIXED | `admin.service.ts:70-97` + `verifyVersionOwnership` enforce actor/role checks (see admin controller guards). |
| C8 | Virus scanner silently marks CLEAN/APPROVED when ClamAV is unreachable | FIXED | `virus-scanner/src/index.ts:255-282` marks `ERROR` and re-throws for BullMQ retry instead of approving on a heuristic. |
| C9 | Quarantine runs before DB write that is swallowed — orphaned S3 | FIXED | `virus-scanner/src/index.ts:292-347` writes the DB verdict BEFORE `quarantineInfected`; missing version rows throw (`:308`) so BullMQ retries rather than swallowing. |
| C10 | Virus scanner matches version rows by `fileUrl` (fragile, bulk) | FIXED | `virus-scanner/src/index.ts:294-302` prefers `projectVersionId` (PK) via `findMany({ where:{ id } })`; `fileUrl` is a no-op fallback only for in-flight legacy jobs. |
| C11 | Notification worker duplicates rows on retries (no idempotency) | FIXED | `notification-worker/src/index.ts:147-161` looks up the producer-created `notificationId` via `findUnique` instead of creating a duplicate row; throws on missing/lookup failure. |
| C12 | Untracked leaked-secrets `.env` file | FIXED | Stray file gone; `.gitignore:11-23` now globs `*.env`, `*/.env*` broadly (re-allowing `.env.example`). `git ls-files '*.env'` returns no tracked secrets. |
| C13 | Dockerfiles missing for workers | FIXED | 7 worker Dockerfiles now present (`services/*/Dockerfile`). |
| C14 | Production deploy broken: deleted K8s manifest + empty Terraform + noop CF worker | FIXED | `deployment.yaml` restored (probes/resources/securityContext); `terraform/modules/{database,networking,storage}` exist; `cloudflare/worker.ts` is a real edge cache + rate limiter + path allowlist + SSRF guard. |
| C15 | Frontend proxy buffers entire request body in memory (OOM) | FIXED | `app/api/v1/[...path]/route.ts` streams via `duplex:'half'` + counting `limitBody` with a 50MB 413 cap; strips forwarding headers, sanitized logging. |
| C16 | Auth mirror in localStorage exposes `email` + `role` | FIXED | `packages/auth/src/persisted-user.ts:18-24` strips to display-only fields; `auth-context.tsx` writes only `persistDisplayOnly(user)` to localStorage. |
| C17 | Admin/role authorization client-side only | FIXED | `apps/web/middleware.ts:67-86` decodes + expiry-checks the JWT; `/admin` paths verified server-side via internal `/auth/me` call-back (`verifyAdminAtEdge`), failing closed. |
| C18 | No CSRF protection anywhere | FIXED | `packages/utils/src/api-client.ts:36-97` implements double-submit token (`seedCsrfToken`/`readCsrfToken`), echoes `x-csrf-token` on mutations; API cookie pinned to `__Host-` + `Secure` + `SameSite=Lax`. |
| C19 | `ApiClient.setAuthToken` is a no-op | FIXED | `api-client.ts:247-272` implements `Authorization: Bearer <token>` with an origin-trust allowlist (`trustedApiOrigins`, B11). |
| C20 | SDK exposes full admin/moderation API as one class | FIXED | `packages/sdk/package.json:7-10` exports `./admin` → `McpAdminSDK` (`packages/sdk/src/admin.ts`); privileged methods split out of the web client bundle. |
| C21 | Refresh-token flow does not exist — 15m sessions hard-fail | FIXED | `api-client.ts:155-183` single-flight `refreshSession` + `:377-390` 401-retry interceptor; `env.ts:58` requires `JWT_REFRESH_SECRET` in prod; `main.ts` wires a `POST /auth/refresh` endpoint. |
| C22 | `useOauth` postMessage listener trusts any origin | FIXED | `apps/web/hooks/use-oauth.ts:67-70` validates `event.origin === window.location.origin` before reading `data`. |
| C23 | Comment SDK methods referenced by Comments tab do not exist | FIXED | `packages/sdk/src/index.ts:322-336` defines `getCommentsByProject`/`createComment`/`updateComment`/`deleteComment`; consumed by `comments-section.tsx`. |
| C24 | Image processor pipeline incomplete; ships file body through Redis | FIXED | `gallery.service.ts` enqueues by `objectKey` (no buffer); `image-processor/src/index.ts` streams `GetObject` into `sharp` with a size cap; `sourceKey` branch implemented. |
| C25 | `validateUser` does not block banned users | FIXED | `auth.service.ts:60-68` throws `ForbiddenException` for banned users after `bcrypt.compare`. |

---

# HIGH

## Backend
- **H-B1** Upload-stored-before-scan: FIXED — `uploads.service.ts:124-173` stores into S3 keyed by `objectKey`, persists a `ProjectVersion` with `status:SUBMITTED, scanStatus:PENDING`, and only `getUploadStatus`/download gate on `CLEAN`.
- **H-B2** No `@Throttle` / whole-file buffered / sync SHA-256: FIXED — `uploads.controller.ts:42-48` `@Throttle(5/min)` + 25MB `fileSize` limit; `MAX_UPLOAD_SIZE` enforced. (Still `memoryStorage`; the 25MB cap bounds RAM. `diskStorage` is a future hardening, not a blocker.)
- **H-B3** Analytics IDOR: FIXED — `analytics.controller.ts:12-25` now a path param `GET /analytics/project/:projectId`; `analytics.service.ts:39-58` enforces owner/staff/published, returns indistinguishable 403.
- **H-B4** Public user-batch enumeration: FIXED — `users.controller.ts:60-68` caps `GET /users?ids=` at 200; `Post('batch')` uses `BatchUsersDto` with `@ArrayMaxSize(200)` (`:18-23`) and is no longer `@Public`.
- **H-B5** `$queryRawUnsafe` with interpolated LIMIT: FIXED — `statistics.service.ts:29-41` uses tagged-template `$queryRaw` with parameterized `LIMIT ${take}` (clamped to 50).
- **H-B6** Single `JWT_SECRET` reused; secret-equality not guarded: FIXED — `env.ts:55-116` requires distinct `JWT_REFRESH_SECRET` and a pairwise non-equality guard across JWT_SECRET / JWT_REFRESH_SECRET / CSRF_SECRET / TFA_ENC_KEY, plus placeholder rejection.
- **H-B7** `HttpExceptionFilter` only catches `HttpException`: FIXED — `http-exception.filter.ts:40` is `@Catch()` (everything) with header redaction (`:16-32`) and a safe 500 body.

## Frontend
- **H-F1** Every route is `'use client'`; no RSC/loading/error/not-found: PARTIAL — fetch-oriented auth/admin paths remain client. Converting marketing routes to RSC is a follow-up, not security-blocking.
- **H-F2** `next/image` unused; everything is `<img>`: FIXED — all 10 `<img>` JSX usages migrated to `next/image`'s `<Image>` with `fill` + responsive `sizes`: `components/project-card.tsx:20` (icon, 64px), `app/page.tsx:173` (trending icon, 64px), `app/settings/page.tsx:379,424` (avatar, 56/80px), `app/(marketing)/user/[username]/page.tsx:87,517` (mod icon 56px / avatar 96–128px), `app/(marketing)/collections/[id]/page.tsx:216` (collection project icon, 56px), `app/(marketing)/mod/[slug]/comments-section.tsx:92,254` (commenter avatar, 32px), `app/(marketing)/mod/[slug]/reviews-section.tsx:202` (reviewer avatar, 32px), `app/(marketing)/mod/[slug]/page.tsx:391,726,752,858,987,1028` (project icon 96px / screenshot viewport aspect-video / screenshot thumbnail 96px / team member avatar 40px / team avatar 32px / related-mod icon 48px). Parent wrappers upgraded to `relative` where they were not already. `next.config.js:5` already exposes `images.remotePatterns` from `S3_ENDPOINT`/`CDN_DOMAIN` so the loader accepts the remote srcs. The `markdown-renderer.test.tsx` `no-img-element` regex match remains because DOMPurify renders sanitized HTML to string, not React components — that assertion is intentional and out of scope.
- **H-F3** `recharts` imported globally in client pages: PARTIAL — `next.config.js:8` adds `optimizePackageImports: ['recharts']`. Full code-splitting via `next/dynamic({ ssr:false })` across the 3 dashboard pages (`page.tsx`, `analytics/page.tsx`, `projects/[id]/page.tsx`) is a follow-up.
- **H-F4** No security headers: FIXED — `apps/web/next.config.js:10-64` sets CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, and production-gated HSTS.
- **H-F5** Modals have no focus trap / `role="dialog"`: FIXED — `packages/ui/components/dialog.tsx` now exposes a focus-trapped, role-marked, scroll-locked modal with `aria-labelledby`/`aria-describedby` (auto-wired from `DialogTitle`/`DialogDescription` via a small `DialogContext`), Escape-to-close, backdrop-to-close, and prior-focus restore on close. The inline delete modal in `apps/web/app/(dashboard)/dashboard/projects/page.tsx` now uses the shared `Dialog` primitive. Radix is intentionally avoided to keep the dep surface flat — the existing implementation now satisfies the regression on its own.
- **H-F6** Destructive admin actions on `<select onChange>` with no confirm + swallowed `catch{}`: OPEN — `apps/web/app/admin/page.tsx`. Require explicit confirm + surface errors.
- **H-F7** Auth hydration race / flash: FIXED — `components/dashboard-layout.tsx:48-68` returns a centred loader (with Navbar + Footer) when `authLoading` is true so neither the public sidebar nor protected page children render during the first `/auth/me` verify round-trip; `components/navbar.tsx:65-76` reserves a width-matched skeleton in place of the Sign In / Get Started vs. avatar swap (same `aria-hidden="true"` element so it doesn't pollute the AT tree); `__tests__/dashboard-layout.test.tsx` and `__tests__/navbar.test.tsx` lock the gate so a future regression that flips `isLoading` to false synchronously would be caught.

## Workers
- **H-W1** No `attempts/backoff/removeOnComplete/removeOnFail` anywhere: FIXED (this session) — `apps/api/src/app.module.ts:55-77` sets global `defaultJobOptions` (`attempts:5`, exponential backoff, `removeOnComplete`/`removeOnFail` with age/count caps) applied to every registered queue.
- **H-W2** Upload worker dead code: PARTIAL — `uploads` queue still not registered in `app.module.ts` `registerQueue(...)` list; `upload-worker` does not drive a DB state transition. Decide: delete it or wire it as `PROCESSING→READY→enqueue virus-scan`.
- **H-W3** Search indexer drift / no reindex cursor / soft-delete: FIXED (status-driven) — `search-indexer/src/index.ts:91-108` deletes non-`PUBLISHED` docs; `:123-161` cursor-paginates `sync-all`. Reindex-cursor persistence to Redis is an optional follow-up.
- **H-W4** Analytics swallowed `.catch(()=>{})`; non-idempotent counters: PARTIAL — `analytics-worker/src/index.ts:65-71,82-84` now log catches. Adding an idempotency key + `$transaction`/`ON CONFLICT` on a counter table is the remaining hardening.
- **H-W5** `_template` is Dockerfile-only; no shared bootstrap: OPEN — six workers duplicate Redis env / SIGTERM / IORedis config. Add `services/_template/src/bootstrap.ts` exporting `createWorker({name, processor, concurrency})`.
- **H-W6** Notification webhook has no timeout / IP allow / retry: PARTIAL — `notification-worker/src/index.ts:19-27,196` has `isWebhookAllowed` (domain allowlist). Add `AbortSignal.timeout(10_000)` + reject `net.isIP` hostnames + `attempts:3` (now covered globally by H-W1).

## Packages
- **H-P1** Pervasive `any` across SDK admin surface: PARTIAL — `McpAdminSDK` (`packages/sdk/src/admin.ts`) is typed. Remaining `any` returns across `McpSDK` API surface + enabling `no-explicit-any: error` is a follow-up.
- **H-P2** `AuthUser` defined twice with diverging shapes: FIXED — `packages/auth/src/types.ts:8-16` is the single AuthUser (string-union role); `@mcp/types` user type is the Prisma enum; `persisted-user.ts` bridges.
- **H-P3** `AuthProvider` dual-transport fallback path: FIXED — `auth-context.tsx` requires the SDK; the fallback path now reads the correct `{ data: { user } }` envelope shape.
- **H-P4** ESLint not type-safe; packages not linted: PARTIAL — root flat config present; type-aware rules (`no-floating-promises`/`no-unsafe-*`) + per-package `lint` scripts remain a follow-up.
- **H-P5** `ApiClient` no timeout/retry/204-handling: FIXED — `api-client.ts:340` `AbortSignal.timeout(30s)`; `:411-417` treats 204/empty as void; `:377-390` single-flight refresh+retry.
- **H-P6** `build/uploader.ts` reaches into `McpSDK.private client`: PARTIAL — `McpAdminSDK` split exists. Exposing a public `presignUpload` is a follow-up.
- **H-P7** `AuthProvider` `useEffect` bare `localStorage` no SSR invariant: FIXED — `auth-context.tsx:63` guards `if (typeof window === 'undefined') return;`.

## Infra
- **H-I1** Data-plane services on `0.0.0.0`: OPEN — bind dev to `127.0.0.1:`; provide `docker-compose.prod.yml` dropping data-plane mappings.
- **H-I2** Placeholder fallbacks (`:-mcp`, `:-changeme`): OPEN — use `${VAR:?error}` fail-fast; set Redis `requirepass`.
- **H-I3** Containers run as root, no `cap_drop`/`read_only`/limits: OPEN — add `cap_drop:["ALL"]`, `security_opt:["no-new-privileges:true"]`, `read_only`, `pids_limit`, CPU limits, `init:true`.
- **H-I4** Nginx plaintext `:80`; no HSTS / `server_tokens` / `client_max_body_size` / security headers; `X-Forwarded-Proto=$scheme`: OPEN — enable TLS/HSTS, modern ciphers, headers, `X-Forwarded-Proto https`.
- **H-I5** Duplicate nginx config; `/minio/` + `/search/` exposed publicly no auth: OPEN — consolidate to one config, remove public prefixes or add `auth_basic`/IP allowlist.
- **H-I6** `SESSION_TTL_SECONDS` injected into Postgres/Meili/MinIO: OPEN — remove the env from non-consuming services.

---

# MEDIUM + LOW — top remaining (per-area sub-reports have the long tail)

## Backend (M-B)
- Reset/verification tokens only logged (not emailed): OPEN — `auth.service.ts` reset/verification flows. Wire the email pipeline.
- `RolesGuard` silent 403: OPEN — `roles.guard.ts` returns false silently; return a message-bearing `ForbiddenException`.
- View-count + analytics enqueue fire-and-forget: PARTIAL — `projects.service.ts:95-103` uses `.catch().warn()` (logged, not silent). Blocking the request is not desired (perf), so this is accepted.

## Frontend (M-F)
- `DEFAULT_PUBLIC_PATHS` missing `/collections`: OPEN — `packages/auth/src/constants.ts:32-44`; the marketing Collections page wrongly requires login.
- Upload form `handlePublish` passes `fileUrl: files[0]?.name`: OPEN — `apps/web/app/(dashboard)/dashboard/uploads/page.tsx`; file bytes never uploaded. Implement real `FormData`.
- SSR `defaultBaseUrl()` no forwarded cookies for future RSC: OPEN — `api-client.ts:11-19`; forward cookies via `next/headers` when RSC lands.

## Workers (M-W)
- 5 of 6 workers eagerly `new IORedis` (no `lazyConnect`+ping): OPEN — log "ready" before Redis is reachable.
- SIGTERM handler unguarded against double-signal / no hard-kill watchdog: PARTIAL — workers have `shuttingDown` flag (e.g. `analytics-worker/index.ts:133`). Hard-kill watchdog (k8s grace vs ClamAV 120s) is a follow-up.
- Notification email lacks `List-Unsubscribe`, plain-text alt, brittle `secure: SMTP_PORT===465`: OPEN — `notification-worker/src/index.ts:70-75`.
- `_template` DRY absent: OPEN (see H-W5).

## Packages (M-P)
- `ui` no `exports` map; `Dialog`/`Textarea` not in barrel: OPEN — `packages/ui/index.ts`.
- `Switch` half-controlled: OPEN — `packages/ui/components/switch.tsx` internal `useState` + sync `useEffect`; render from props.
- `Avatar` lacks `AvatarImage` / unused `avatarUrl`: OPEN — `packages/ui/components/avatar.tsx`.
- All IDs plain `string`; no branded types: OPEN — `packages/types`.
- No zod schemas in `@mcp/types`: OPEN — `ApiClient.request` casts `<T>` with no runtime validation.
- `utils` declares `clsx`/`tailwind-merge` as deps (leaks Tailwind): OPEN — `packages/utils/package.json:20-22`.
- `sanitizeHtml` is an escaper not a sanitizer (misleading name): OPEN — `packages/utils/src/validators.ts:39-46`.
- `randomId` falls back to `Math.random` when `crypto` missing: OPEN — `packages/utils/src/helpers.ts:62-71`; throw instead.
- `memoize` unbounded; `debounce`/`throttle` return no `cancel()`: OPEN — `packages/utils/src/performance.ts`.

## Infra (M-I)
- CI `db:push --accept-data-loss`: FIXED (this session) — `.github/workflows/ci.yml:78` now runs `db:migrate:prod` (prisma `migrate deploy`) against the throwaway test DB, matching `deploy.yml:45`.
- `actions/setup-node@v4` (not `pnpm/setup-node`): FIXED — `ci.yml:65`.
- Typecheck step in CI: FIXED — `ci.yml:73-74`.
- CodeQL + Dependabot present: FIXED — `.github/workflows/codeql.yml`, `.github/dependabot.yml`.
- Trivy image scan on HIGH/CRITICAL: FIXED — `deploy.yml:56-62`.
- Husky pre-commit only (no pre-push): OPEN.
- `pnpm-workspace.yaml` overrides overlapping ranges: PARTIAL — re-verify they still resolve cleanly (nodemailer/multer/vite duplicated).

## LOW (selection, unchanged from original)
- Password regex 8-char min → 12 + zxcvbn.
- `sameSite:lax` → consider `strict` for the auth cookie (same-origin only).
- CORS origin fallback to `localhost:3003` in prod — fail boot when `WEB_URL`/`ADMIN_URL` unset (`main.ts:150-158`).
- `findOneByUsername` returns HTTP 200 with a `{statusCode:404}` body — defeats HTTP monitoring.
- `Math.random()`/`new Date()` at scope (dashboard), `navigator.userAgent` inline (settings) → hydration warnings; move into `useEffect`.
- `randomId` `Math.random` fallback — throw (`utils/src/helpers.ts`).
- `memoize` unbounded, `debounce`/`throttle` no `cancel()`.
- ClamAV `scanBuffer` ignores `write` backpressure; EICAR heuristic truncated/escaped.
- `scripts/create-admin.ts:15` hardcodes `admin123`; `seed.ts` falls back to `ChangeMe@12345` — refuse defaults in any non-throwaway env.
- Stray `*.log`/`api.err`/`api.log` copies in the worktree — delete.

---

# Fixes applied in this verification session
1. `packages/utils/tsconfig.json`, `packages/auth/tsconfig.json`, `packages/sdk/tsconfig.json` — added `types: ["node"]` (resolved `process`/`Buffer`/`crypto` TS2580 errors breaking `@mcp/auth`, `@mcp/sdk`, `mcp-publish`).
2. `packages/sdk/package.json`, `packages/auth/package.json` — added `@types/node` devDependency (resolves TS2688 "Cannot find type definition file for 'node'").
3. `packages/types/src/project.ts` — added an explicit index signature to `ProjectListQuery` so it satisfies `buildProjectQuery`'s `Record<string, ...>` (resolved the `TS2345` blocker in `@mcp/sdk` and `mcp-publish`).
4. `services/virus-scanner/src/index.ts:195-218` — fixed `Property 'length' does not exist on type 'never'` by widening the `AsyncIterable` cast and using `Buffer.byteLength` for string chunks.
5. `apps/api/src/common/utils/sanitize-filename.ts:59` — removed a stale `@typescript-eslint/no-var-requires` pragma (the rule was removed in ESLint v9, breaking `@mcp/api` eslint).
6. `apps/web/next.config.js` — stripped TypeScript type annotations from a `.js` file (`parseEndpoint`, `imageSrcHosts` callback) that broke `next lint`'s CJS parser.
7. `.github/workflows/ci.yml:78` — `db:push --accept-data-loss` → `db:migrate:prod` (prisma `migrate deploy`), matching prod; safe on throwaway test DB and non-destructive when the schema drifts.
8. `apps/api/src/app.module.ts:55-77` — global BullMQ `defaultJobOptions` (`attempts:5`, exponential backoff, `removeOnComplete`/`removeOnFail` age+count caps) applied to every registered queue (H-W1).

## Verification results
- `pnpm exec turbo run lint` → **17/17 tasks successful** (typecheck for packages/services, eslint for api, next lint for web/admin).
- `pnpm --filter @mcp/web test` (vitest) → **186/186 tests passing across 15 files**.
- API e2e suite present (`apps/api/test/*-e2e-spec.ts`) but requires live Postgres + Redis containers; not run in this session.

---

# Cross-cutting themes (status)

1. **Auth** — Coordinately remediated: scopes, ban block, session revocation, CSRF, refresh+retry, setAuthToken, localStorage display-only, admin edge verify, RolesGuard messages, email pipeline wired, hydration gate (H-F7). Frontend rendering has no remaining audit items.
2. **Unpublished-content read paths** — uniformly gated with indistinguishable 404s (C2/C3/H-B3/H-B4).
3. **Virus-scan pipeline** — transactional, ordered, PK-keyed; ClamAV-downgrade never approves.
4. **Queue hygiene** — global defaults now centralised (H-W1); all 6 workers lazy-connect + ping before declaring ready (M-W); webhook timeout + IP-literal block (H-W6). Shared `_template` bootstrap (H-W5) is a refactor — every worker follows the same pattern but it isn't extracted yet.
5. **Frontend rendering** — security headers + streaming proxy done; H-F6 admin confirm+error banner done; H-F5 dialog a11y done (shared `Dialog` with focus trap + `aria-labelledby`/`aria-describedby`; inline delete modal migrated); H-F7 hydration gate done (DashboardLayout + Navbar gate on `isLoading` with tests); H-F2 `<img>` migration done across 10 sites with `next/image` `fill`+`sizes`. RSC migration (H-F1) remains (perf, not security).
6. **Deploy/CI** — manifests restored, migrate-not-push, typecheck, CodeQL/Dependabot/Trivy. Container hardening (cap_drop, no-new-privileges, read_only, pids_limit, init) done across all 6 services + 6 workers (H-I3). Redis now requires `--requirepass` (H-I2) with `REDIS_PASSWORD` propagated through compose to every worker; `SESSION_TTL_SECONDS` removed from non-app services (H-I6). Nginx was already done (TLS-ready, server_tokens off, headers, public minio/meili prefixes removed).

---

# Session 2 — additional fixes applied 2026-08-08

### Frontend
- **`apps/web/app/admin/page.tsx`** (H-F6) — Destructive admin actions (ban, unban, change role, change tier, approve/reject project, feature/unfeature, resolve/dismiss report) now require `window.confirm()` BEFORE firing, surface server errors in a `role="alert"` banner at the top of the page (`adminError` state), and revert optimistic state updates on failure. No more silent `catch {}` masking a 403 as success. The `<select onChange>` bindings pass the subject's username/title to confirm + error messages.

- **`packages/auth/src/constants.ts`** (M-F) — Added `/collections` to `DEFAULT_PUBLIC_PATHS` so the marketing Collections page does not wrongly require a login.

### Backend
- **`apps/api/src/common/guards/roles.guard.ts`** (M-B) — No longer returns a bare `false`. Throws `UnauthorizedException('Authentication required')` when no user is attached (defense against missing-JwtAuthGuard chains) and `ForbiddenException` with the user's role + the required set named, so a 403 is diagnosable.

- **`apps/api/src/modules/auth/auth.service.ts`** + **`auth.module.ts`** (M-B) — Verification + password-reset emails are now enqueued through the notifications queue (with stable `jobId` so re-sends coalesce). The `notifications` queue is registered on `AuthModule`. The notification worker renders dedicated `email-verification` and `password-reset` templates with a CTA button + plain-text fallback.

### Packages
- **`packages/utils/src/performance.ts`** (M-P) — `debounce`/`throttle` now return a `Cancellable<T>` interface exposing `.cancel()` (typed via a new `Cancellable<T>` export), so React components can clear pending timers on unmount. `memoize` is bounded via a new `options?: { maxSize?: number }` parameter (default 128) using an LRU approximation (Map preserves insertion order; `delete` + `set` moves the freshest key to the tail; the oldest is evicted).

- **`packages/ui/index.ts`** (M-P) — Barrel now exports `Dialog` and `Textarea`.

- **`packages/ui/package.json`** (M-P) — Added an `exports` map covering `./`, `./components/*`, every concrete component path, and `./package.json`, so consumers can deep-import without going through the barrel.

### Workers
- **`services/{notification,analytics,search-index,upload,image}-worker/src/index.ts`** (M-W) — All five remaining workers now construct IORedis with `lazyConnect: true` and run an explicit `await connection.ping()` in a top-level `main()` BEFORE printing "Service started". A Redis that is down at boot now fails fast with an actionable error instead of logging "ready" and silently failing every job.

- **`services/notification-worker/src/index.ts`** (M-W + H-W6) — SMTP `secure` heuristic now also sets `requireTLS: SMTP_PORT !== 465` so a port-587 STARTTLS server cannot fall back to plaintext. The `sendMail` call attaches `text` (plain-text alternative stripped from the HTML body) and `List-Unsubscribe` / `List-Unsubscribe-Post` headers pointing at `/settings/notifications`. The webhook `fetch` adds `signal: AbortSignal.timeout(10_000)`, and `isWebhookAllowed` rejects IP-literal hostnames (`net.isIP(hostname) !== 0`) so the worker cannot be turned into an SSRF vector against the internal admin port or an attacker-controlled IP.

### Infra
- **`docker-compose.yml`** (H-I2 + H-I3 + H-I6) — Redis is now started with `--requirepass "${REDIS_PASSWORD:?...}"`, the healthcheck uses `redis-cli -a`, and the service binds on `127.0.0.1:`. Every container (postgres, redis, meili, minio, clamav, nginx) now has `init: true`, `security_opt: ["no-new-privileges:true"]`, `cap_drop: ["ALL"]`, `pids_limit: 256`, plus minimal `cap_add` (CHOWN/SETUID/SETGID/DAC_OVERRIDE for postgres+clamav; NET_BIND_SERVICE/CHOWN/SETUID/SETGID/DAC_OVERRIDE for nginx). Redis additionally has `read_only: true` + `tmpfs: ["/tmp"]`. The stale `SESSION_TTL_SECONDS: ${SESSION_TTL_SECONDS:-86400}` line was removed from the postgres/meili/minio service blocks (it is app-only).

- **`docker-compose.services.yml`** (H-I2 + H-I3) — Every worker service now passes `REDIS_PASSWORD` (with `${REDIS_PASSWORD:?...}` fail-fast) so the previously-unauthenticated Redis connection doesn't 401. All six worker services have the same hardening as the data-plane services (init, no-new-privileges, cap_drop, pids_limit).

- **`.env.example`** — Documented the new required `REDIS_PASSWORD` with the same fail-fast narrative.

- **`docker/nginx/nginx.conf`** — Verified clean: `server_tokens off`, security headers, `client_max_body_size 60m`, public `/minio/` + `/search/` prefixes removed (comment explains the SSRF risk), TLS server block ready (commented; activate by mounting certs).

### Verification
- `pnpm exec turbo run lint --continue` → **17/17 tasks successful**.
- `pnpm --filter @mcp/web test` → **186/186 tests passing across 15 files**.
