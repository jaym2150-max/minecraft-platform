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