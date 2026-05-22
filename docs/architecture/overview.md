# Architecture Overview

## System Architecture

The Minecraft Platform follows a modern microservices architecture:

- **Frontend**: Next.js 15 with App Router
- **Backend**: NestJS REST API
- **Database**: PostgreSQL via Prisma ORM
- **Cache**: Redis
- **Search**: Meilisearch
- **Storage**: S3-compatible (MinIO)
- **Queues**: BullMQ
