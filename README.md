# Minecraft Platform

A production-grade Minecraft mod hosting platform inspired by CurseForge and Modrinth.

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript + TailwindCSS + shadcn/ui
- **Backend:** NestJS + Prisma + PostgreSQL
- **Search:** Meilisearch
- **Cache/Queues:** Redis + BullMQ
- **Storage:** S3-compatible (MinIO)
- **Infrastructure:** Docker Compose

## Getting Started

### Prerequisites

- Node.js >= 20.x
- pnpm >= 9.x
- Docker & Docker Compose

### Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Start infrastructure services (Postgres, Redis, MinIO, Meili, ClamAV, nginx)
pnpm docker:up

# 3. Generate Prisma client + push schema
pnpm db:generate
pnpm db:push

# 4. (Optional) Seed the database
pnpm db:seed

# 5. Start development — API + web + every worker
pnpm dev

# Tip: in another terminal, start the workers in containers alongside dev:
# docker compose -f docker-compose.services.yml up upload-worker virus-scanner image-processor search-indexer analytics-worker notification-worker
```

### Development URLs

| Service      | URL                      |
|-------------|--------------------------|
| Web App     | http://localhost:3003     |
| API         | http://localhost:4000     |
| Admin Panel | http://localhost:3001     |
| Docs Site   | http://localhost:3002     |
| MinIO       | http://localhost:9000     |
| Meilisearch | http://localhost:7700     |
| PostgreSQL  | localhost:5432            |
| Redis       | localhost:6379            |

## Project Structure

```
├── apps/
│   ├── web/              # Main frontend (Next.js 15)
│   ├── api/              # Backend API (NestJS + Prisma + PostgreSQL)
│   ├── admin/            # Admin panel (Next.js — internal)
│   └── docs-site/        # Documentation site (Next.js)
├── packages/
│   ├── ui/               # Shared UI components (shadcn/ui based)
│   ├── types/            # Shared TypeScript types
│   ├── utils/            # ApiClient + helpers
│   ├── auth/             # AuthProvider, useAuth, AUTH_COOKIE_NAME
│   ├── sdk/              # Public McpSDK client
│   └── eslint-config/    # Shared ESLint configuration
├── services/
│   ├── upload-worker/    # BullMQ worker — upload post-processing
│   ├── virus-scanner/    # BullMQ worker — ClamAV scanning
│   ├── image-processor/  # BullMQ worker — Sharp image resizing
│   ├── search-indexer/   # BullMQ worker — Meilisearch indexing
│   ├── analytics-worker/ # BullMQ worker — analytics aggregation
│   └── notification-worker/ # BullMQ worker — email / webhook notifications
├── infrastructure/       # Terraform, K8s, Nginx, Cloudflare
├── docker/              # Docker service configs (postgres, redis, minio, clamav, nginx)
├── scripts/             # Utility scripts
└── docs/                # Documentation
```

## Workers

Each service is a standalone BullMQ worker. During development you can run
all of them through `pnpm dev` (Turbo fans them out). For containerised
deploys use `docker-compose.yml` together with `docker-compose.services.yml`:

```bash
docker compose up -d              # Postgres, Redis, MinIO, Meili, ClamAV, nginx
docker compose -f docker-compose.services.yml up --build   # API + 6 workers
```

Workers in production should be deployed as their own deployments in
`infrastructure/kubernetes/` so they can scale independently from the web tier.

## Required env

Minimum for local dev (`pnpm docker:up` populates infrastructure only — you
still need a `.env`):

```
NODE_ENV=development
API_PORT=4000
WEB_URL=http://localhost:3003
ADMIN_URL=http://localhost:3001
API_URL=http://localhost:4000

JWT_SECRET=<64 hex chars>
CSRF_SECRET=<distinct 64 hex chars>
TFA_ENC_KEY=<32 hex chars>

DATABASE_URL=postgresql://mcp:mcp@localhost:5432/minecraft_platform
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_API_KEY=<16+ chars>

S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=<minio user>
S3_SECRET_KEY=<minio password>
S3_BUCKET=uploads
S3_PUBLIC_BUCKET=public

CLAMAV_HOST=localhost
CLAMAV_PORT=3310
```

The startup env validation in `apps/api/src/common/env.ts` will refuse to
boot the API in production if any of these are missing, look like a
placeholder, or are too short.

## License

MIT
