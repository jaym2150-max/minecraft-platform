You are a senior full-stack architect and engineer.

Your task is to fully scaffold a production-grade Minecraft mod hosting platform monorepo inspired by CurseForge and Modrinth.

Tech Stack:
- Monorepo using pnpm workspaces + Turborepo
- Frontend: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui
- Backend: NestJS + Prisma + PostgreSQL
- Search: Meilisearch
- Cache/Queues: Redis + BullMQ
- Storage: S3-compatible architecture
- Infrastructure: Docker Compose
- Language: TypeScript everywhere

Project Name:
minecraft-platform

==================================================
GOALS
==================================================

Create:
1. Complete monorepo structure
2. Working workspace configuration
3. Docker setup
4. Shared packages
5. Frontend scaffold
6. Backend scaffold
7. Prisma setup
8. Environment configs
9. Basic auth-ready structure
10. Production-ready architecture conventions

==================================================
DIRECTORY STRUCTURE
==================================================

minecraft-platform/
│
├── apps/
│   ├── web/
│   ├── api/
│   ├── admin/
│   └── docs-site/
│
├── packages/
│   ├── ui/
│   ├── types/
│   ├── utils/
│   ├── config/
│   ├── auth/
│   ├── sdk/
│   └── eslint-config/
│
├── services/
│   ├── upload-worker/
│   ├── virus-scanner/
│   ├── image-processor/
│   ├── search-indexer/
│   ├── analytics-worker/
│   └── notification-worker/
│
├── infrastructure/
│   ├── terraform/
│   ├── kubernetes/
│   ├── nginx/
│   ├── cloudflare/
│   └── monitoring/
│
├── docker/
│   ├── postgres/
│   ├── redis/
│   ├── meilisearch/
│   ├── clamav/
│   ├── minio/
│   └── nginx/
│
├── scripts/
├── docs/
├── .github/
│
├── docker-compose.yml
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .gitignore
├── .env.example
├── README.md
└── LICENSE

==================================================
WEB APP REQUIREMENTS
==================================================

Inside apps/web:
- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- Route groups
- Proper layout structure
- Shared component architecture

Create folders:
- app/
- components/
- hooks/
- lib/
- services/
- store/
- styles/
- public/
- types/

Create routes:
- /
- /mods
- /mod/[slug]
- /user/[username]
- /dashboard
- /dashboard/projects
- /dashboard/uploads
- /dashboard/analytics
- /auth/login
- /auth/register
- /settings

==================================================
API REQUIREMENTS
==================================================

Inside apps/api:
- NestJS
- Prisma integration
- Modular architecture

Create modules:
- auth
- users
- projects
- versions
- uploads
- comments
- moderation
- analytics
- search
- notifications
- dependencies
- teams
- categories
- loaders
- minecraft-versions

Create:
- DTO structure
- guards
- decorators
- middleware
- filters
- interceptors
- config system

==================================================
DATABASE REQUIREMENTS
==================================================

Setup Prisma with PostgreSQL.

Create initial models:
- User
- Project
- ProjectVersion
- Category
- Loader
- MinecraftVersion
- Dependency
- Comment
- Notification
- Team
- TeamMember
- Download
- Report

Use:
- UUID IDs
- timestamps
- relations
- enums where appropriate

==================================================
DOCKER REQUIREMENTS
==================================================

Create docker-compose.yml with:
- postgres
- redis
- meilisearch
- minio
- clamav

Use sensible defaults.

==================================================
SHARED PACKAGES
==================================================

packages/types:
- shared TypeScript interfaces

packages/ui:
- reusable UI components

packages/utils:
- helper functions

packages/sdk:
- API client SDK

==================================================
DEV TOOLING
==================================================

Setup:
- ESLint
- Prettier
- strict TypeScript
- Husky
- lint-staged

==================================================
CODE QUALITY RULES
==================================================

- Use scalable enterprise architecture
- Keep code modular
- Use barrel exports where appropriate
- Use feature-based architecture
- Follow clean architecture principles
- Avoid spaghetti structure
- Add comments where useful
- Use environment-based configuration
- Keep everything production-grade

==================================================
OUTPUT REQUIREMENTS
==================================================

Generate:
1. Full folder structure
2. Important config files
3. Initial package.json files
4. Turbo config
5. Docker config
6. Prisma schema
7. Basic NestJS module structure
8. Basic Next.js setup
9. Shared package setup
10. Environment examples

The scaffold should be runnable immediately after:
- pnpm install
- docker compose up

The project should feel like a real scalable SaaS platform architecture.

=================================================
TO-DO LISTS
================================================
What's actually missing that we could realistically add
In rough priority order:

Tier 1 — High impact, low cost (advanced browse UX)
Full facet grid (loader, MC version, category, license, project type, environment, sidebar/checkbox) wired end-to-end in app/(marketing)/mods/page.tsx. Currently useMods only takes one loader + one category. Modrinth's filter sidebar is the single most-used UI.
Per-MC-version loader compatibility. Modrinth's UI: "Fabric 1.20.1" as a tag. Schema needs a LoaderCompat table linking a project to (loader, version) pairs and a multi-axis facet query.
Mod version / loader/versions route + download table. Modrinth's /mod/sodium/versions?l=fabric filter; needs server-side endpoint that returns versions filtered by loader and gameVersions[].
Modpacks (.mrpack) module + manifest export. Many users come specifically for modpacks; requires mc-versions[] + files[] snapshot.
Server pack generator (Modrinth feature). Builds a downloadable zip with mods/ folder pre-resolved.
CI/CD plugin (@mcp/mrpack-cli, @mcp/forge-uploader) so authors can publish via ./gradlew publishToMcp.
Hash-by-ID lookup UI on a /lookup page: paste sha256, get download link.
Plugin YML parser so Spigot/Bukkit/Paper plugins ingest metadata cleanly into the loaders enum.
Tier 2 — Governance, scale, and trust
Audit log table for admin actions (project status flips, role changes, takedowns). Required for any moderation story.
Verified creator badge + organization/studio model (Foundry/Studies analogues). Drives the "official Sodium" distinction.
Webhook on project publish (Discord/Slack) so team channels can subscribe to new releases.
Orthogonal modpack compatibility matrix between mod and Minecraft version.
Country-level analytics (privacy-respecting) → admins can see download distribution at a glance, like CF.
Open-source license audit + SPDX crosswalk for the License enum.
RSS feeds for new mods, mod updates, threads.
Tier 3 — Polish + engagement
OAuth login via Microsoft/Mojang (XBox Live account) — required because many creators won't sign up with GitHub.
i18n for at least 2 languages (Matrix/JSON on Next.js). Modrinth has 6.
Email digests of followed-project updates.
Newsletter / "what's new this week" widget like Modrinth's news.
Reports / moderation queue UI on apps/admin/app/reports/page.tsx (route exists; need operational dashboards).
DMCA workflow with public takedown form and admin-only thread type per THREAD_TYPE DMCA.
Audit log API endpoint.
Sitemap + robots.txt for SEO.
OG meta / share cards per project page (already implicit via Next 15 metadata API; just ensure cover image is fetched).
Mobile-app-friendly OpenAPI with rate-limit headers exposed.
Tier 4 — Long-term moats
Studio / Organization model: multi-team works on multiple projects, billing per studio.
Revenue split / payout automation (Stripe Connect or Payouts API).
Minecraft Hosting (a real, separate product): pre-provisioned profiles that download + install a curated modpack into a managed server (matches Modrinth Hosting).
Public launcher manifest for Prism / MultiMC / ATLauncher (one-line integration).
Server-listings, discovery feeds, shared instances (Modrinth's "share instances with friends" feature).
What this codebase is already doing well
Auth is stronger than CurseForge: bcrypt + TOTP AES-256-GCM, OAuth consent-code (no token-in-URL), per-route throttling, helmet with full CSP/CORP/COOP, Zod-validated env that refuses startup with placeholders.
API key + scopes model (ApiKeyScope enum) gives integrators first-class programmatic access; well ahead of SpigotMC which has no public API at all.
Magic-byte file validation + ClamAV + SHA-256/SHA-1/SHA-512 is full Modrinth-class behavior (curate competitors lack SHA-512 dedupe).
Session-bound JWT (jti revocation via Session table) — far better hygiene than CurseForge's session cookie.
Health check + Magic bytes for upload + the version-files bulk endpoint are non-trivial UX details that usually need a service rewrite.
Workers pipeline is correctly separated (Bull + ClamAV + Sharp + Meilisearch + esm worker) — almost nobody gets this right on first try.
TL;DR for your team
If you took this codebase to "feature parity with Modrinth", the gaps that move the needle are:

Faceted browse UI + per-version/loader query — biggest UX gap.
Modpacks + server-pack export — biggest catalog coverage gap.
CI/uploader CLI for authors — biggest acquisition-onboarding gap.
Audit log + verified-creator/org model — biggest trust/governance gap.
OAuth via Microsoft + i18n — biggest growth (international + Mojang-native) gap.
Sitemap + RSS + newsletter — biggest SEO/marketing gap.
Everything else on the list is incremental polish compared to those six.