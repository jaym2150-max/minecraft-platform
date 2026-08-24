minecraft-platform/
├── apps/
│   ├── web/                       # Main frontend (Next.js 15, App Router)
│   ├── api/                       # Backend API (NestJS + Prisma + PostgreSQL)
│   ├── admin/                     # Scaffold — internal admin panel (Next.js)
│   └── docs-site/                 # Scaffold — public documentation (Next.js)
├── packages/
│   ├── ui/                        # Shared UI components (shadcn/ui based)
│   ├── types/                     # Shared TypeScript types
│   ├── utils/                     # Utility helpers (ApiClient, etc.)
│   ├── auth/                      # Auth context & hooks (AuthProvider, useAuth)
│   ├── sdk/                       # Public API client SDK (McpSDK)
│   └── eslint-config/             # Shared ESLint config
├── services/
│   ├── upload-worker/             # File upload processing (BullMQ worker)
│   ├── virus-scanner/             # Malware scanning via ClamAV
│   ├── image-processor/           # Image resizing/optimization via Sharp
│   ├── search-indexer/            # Meilisearch indexing
│   ├── analytics-worker/          # Analytics event processing
│   └── notification-worker/       # Notification delivery (email, webhook)
├── docker/                        # Docker service configs (postgres, redis, minio, etc.)
├── .husky/                        # Git hooks (pre-commit → lint-staged)
├── .env                           # Development environment variables
├── .env.example                   # Environment variable template
├── turbo.json                     # Turborepo pipeline config
├── pnpm-workspace.yaml            # pnpm workspace config
├── docker-compose.yml             # Infrastructure services
└── package.json                   # Root workspace config
