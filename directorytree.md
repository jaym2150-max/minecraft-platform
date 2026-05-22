minecraft-platform/

│

├── apps/

│   │

│   ├── web/                            # Main frontend (Next.js)

│   │   ├── app/

│   │   │   ├── page.tsx

│   │   │   ├── layout.tsx

│   │   │   ├── globals.css

│   │   │   │

│   │   │   ├── mods/

│   │   │   │   ├── page.tsx

│   │   │   │   └── \[slug]/

│   │   │   │       └── page.tsx

│   │   │   │

│   │   │   ├── user/

│   │   │   │   └── \[username]/

│   │   │   │       └── page.tsx

│   │   │   │

│   │   │   ├── dashboard/

│   │   │   │   ├── page.tsx

│   │   │   │   ├── projects/

│   │   │   │   ├── uploads/

│   │   │   │   └── analytics/

│   │   │   │

│   │   │   ├── auth/

│   │   │   │   ├── login/

│   │   │   │   ├── register/

│   │   │   │   └── forgot-password/

│   │   │   │

│   │   │   ├── settings/

│   │   │   └── api/

│   │   │

│   │   ├── components/

│   │   │   ├── ui/

│   │   │   ├── layout/

│   │   │   ├── mod/

│   │   │   ├── user/

│   │   │   ├── dashboard/

│   │   │   └── shared/

│   │   │

│   │   ├── hooks/

│   │   ├── lib/

│   │   ├── services/

│   │   ├── store/

│   │   ├── styles/

│   │   ├── public/

│   │   │   ├── images/

│   │   │   ├── icons/

│   │   │   └── fonts/

│   │   │

│   │   ├── types/

│   │   ├── middleware.ts

│   │   ├── next.config.js

│   │   ├── tailwind.config.ts

│   │   ├── tsconfig.json

│   │   └── package.json

│   │

│   ├── api/                            # Main backend API (NestJS)

│   │   ├── src/

│   │   │   ├── modules/

│   │   │   │   ├── auth/

│   │   │   │   ├── users/

│   │   │   │   ├── projects/

│   │   │   │   ├── versions/

│   │   │   │   ├── uploads/

│   │   │   │   ├── comments/

│   │   │   │   ├── moderation/

│   │   │   │   ├── analytics/

│   │   │   │   ├── search/

│   │   │   │   ├── notifications/

│   │   │   │   ├── dependencies/

│   │   │   │   ├── teams/

│   │   │   │   ├── categories/

│   │   │   │   ├── loaders/

│   │   │   │   └── minecraft-versions/

│   │   │   │

│   │   │   ├── common/

│   │   │   │   ├── guards/

│   │   │   │   ├── interceptors/

│   │   │   │   ├── decorators/

│   │   │   │   ├── filters/

│   │   │   │   ├── middleware/

│   │   │   │   ├── dto/

│   │   │   │   ├── interfaces/

│   │   │   │   └── utils/

│   │   │   │

│   │   │   ├── config/

│   │   │   │   ├── database.config.ts

│   │   │   │   ├── redis.config.ts

│   │   │   │   ├── storage.config.ts

│   │   │   │   └── app.config.ts

│   │   │   │

│   │   │   ├── app.module.ts

│   │   │   └── main.ts

│   │   │

│   │   ├── prisma/

│   │   │   ├── schema.prisma

│   │   │   ├── migrations/

│   │   │   └── seed.ts

│   │   │

│   │   ├── uploads/

│   │   ├── test/

│   │   ├── tsconfig.json

│   │   └── package.json

│   │

│   ├── admin/                          # Internal admin panel

│   │   ├── app/

│   │   │   ├── dashboard/

│   │   │   ├── reports/

│   │   │   ├── malware/

│   │   │   ├── users/

│   │   │   ├── projects/

│   │   │   └── analytics/

│   │   │

│   │   ├── components/

│   │   ├── lib/

│   │   ├── middleware.ts

│   │   └── package.json

│   │

│   └── docs-site/                      # Public documentation

│       ├── app/

│       ├── content/

│       └── package.json

│

├── packages/

│   │

│   ├── ui/                             # Shared UI library

│   │   ├── components/

│   │   ├── styles/

│   │   └── package.json

│   │

│   ├── types/                          # Shared TypeScript types

│   │   ├── src/

│   │   │   ├── user.ts

│   │   │   ├── project.ts

│   │   │   ├── version.ts

│   │   │   ├── api.ts

│   │   │   └── analytics.ts

│   │   └── package.json

│   │

│   ├── utils/

│   │   ├── src/

│   │   └── package.json

│   │

│   ├── config/

│   │   ├── eslint/

│   │   ├── prettier/

│   │   ├── tailwind/

│   │   └── tsconfig/

│   │

│   ├── auth/

│   │   ├── src/

│   │   └── package.json

│   │

│   ├── sdk/                            # Public SDK

│   │   ├── src/

│   │   │   ├── client.ts

│   │   │   ├── projects.ts

│   │   │   ├── versions.ts

│   │   │   └── users.ts

│   │   └── package.json

│   │

│   └── eslint-config/

│       └── package.json

│

├── services/

│   │

│   ├── upload-worker/

│   │   ├── src/

│   │   └── package.json

│   │

│   ├── virus-scanner/

│   │   ├── src/

│   │   └── package.json

│   │

│   ├── image-processor/

│   │   ├── src/

│   │   └── package.json

│   │

│   ├── search-indexer/

│   │   ├── src/

│   │   └── package.json

│   │

│   ├── analytics-worker/

│   │   ├── src/

│   │   └── package.json

│   │

│   └── notification-worker/

│       ├── src/

│       └── package.json

│

├── infrastructure/

│   │

│   ├── terraform/

│   ├── kubernetes/

│   ├── nginx/

│   ├── cloudflare/

│   └── monitoring/

│

├── docker/

│   │

│   ├── postgres/

│   ├── redis/

│   ├── meilisearch/

│   ├── clamav/

│   ├── minio/

│   └── nginx/

│

├── scripts/

│   ├── seed.ts

│   ├── migrate.ts

│   ├── create-admin.ts

│   ├── sync-modrinth.ts

│   ├── cleanup-uploads.ts

│   └── generate-types.ts

│

├── docs/

│   ├── architecture/

│   ├── api/

│   ├── database/

│   ├── deployment/

│   ├── security/

│   └── roadmap/

│

├── .github/

│   ├── workflows/

│   │   ├── ci.yml

│   │   ├── lint.yml

│   │   ├── test.yml

│   │   └── deploy.yml

│   │

│   ├── ISSUE\_TEMPLATE/

│   └── PULL\_REQUEST\_TEMPLATE.md

│

├── .env

├── .env.example

├── .gitignore

├── .prettierrc

├── turbo.json

├── pnpm-workspace.yaml

├── docker-compose.yml

├── package.json

├── README.md

└── LICENSE

