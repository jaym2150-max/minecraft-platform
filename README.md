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

# 2. Start infrastructure services
pnpm docker:up

# 3. Generate Prisma client
pnpm db:generate

# 4. Run database migrations
pnpm db:migrate

# 5. Seed the database
pnpm db:seed

# 6. Start development
pnpm dev
```

### Development URLs

| Service      | URL                      |
|-------------|--------------------------|
| Web App     | http://localhost:3000     |
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
│   ├── web/              # Main frontend (Next.js)
│   ├── api/              # Backend API (NestJS)
│   ├── admin/            # Internal admin panel
│   └── docs-site/        # Public documentation
├── packages/
│   ├── ui/               # Shared UI components
│   ├── types/            # Shared TypeScript types
│   ├── utils/            # Helper utilities
│   ├── config/           # Shared configurations
│   ├── auth/             # Auth package
│   ├── sdk/              # Public API client SDK
│   └── eslint-config/    # ESLint configuration
├── services/
│   ├── upload-worker/    # File upload processing
│   ├── virus-scanner/    # Malware scanning
│   ├── image-processor/  # Image resizing/optimization
│   ├── search-indexer/   # Meilisearch indexing
│   ├── analytics-worker/ # Analytics processing
│   └── notification-worker/ # Notification delivery
├── infrastructure/       # Terraform, K8s, Nginx, Cloudflare
├── docker/              # Docker service configs
├── scripts/             # Utility scripts
└── docs/                # Documentation
```

## License

MIT
