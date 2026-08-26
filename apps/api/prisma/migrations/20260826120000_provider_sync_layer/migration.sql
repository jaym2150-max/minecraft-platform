-- Provider layer: external content providers, per-project provider links,
-- and persisted synchronization runs with structured logs.

-- CreateEnum
CREATE TYPE "ProviderLinkStatus" AS ENUM ('ACTIVE', 'HIDDEN', 'REMOVED');

-- CreateEnum
CREATE TYPE "SyncJobType" AS ENUM ('FULL_IMPORT', 'INCREMENTAL', 'STATS_REFRESH', 'SINGLE_PROJECT');

-- CreateEnum
CREATE TYPE "SyncJobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SyncTrigger" AS ENUM ('MANUAL', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "SyncLogLevel" AS ENUM ('INFO', 'WARN', 'ERROR');

-- CreateTable
CREATE TABLE "providers" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "apiUrl" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_projects" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "externalSlug" TEXT NOT NULL,
    "externalUrl" TEXT NOT NULL,
    "status" "ProviderLinkStatus" NOT NULL DEFAULT 'ACTIVE',
    "externalUpdatedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_jobs" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "type" "SyncJobType" NOT NULL,
    "status" "SyncJobStatus" NOT NULL DEFAULT 'PENDING',
    "trigger" "SyncTrigger" NOT NULL DEFAULT 'MANUAL',
    "processedCount" INTEGER NOT NULL DEFAULT 0,
    "createdCount" INTEGER NOT NULL DEFAULT 0,
    "updatedCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL,
    "syncJobId" TEXT NOT NULL,
    "level" "SyncLogLevel" NOT NULL DEFAULT 'INFO',
    "message" TEXT NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- AlterTable: external provider version id for idempotent version syncing.
-- Nullable + unique: existing rows keep NULL (Postgres allows multiple NULLs
-- in a unique index).
ALTER TABLE "project_versions" ADD COLUMN "externalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "providers_slug_key" ON "providers"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "provider_projects_providerId_projectId_key" ON "provider_projects"("providerId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "provider_projects_providerId_externalId_key" ON "provider_projects"("providerId", "externalId");

-- CreateIndex
CREATE INDEX "provider_projects_providerId_lastSyncedAt_idx" ON "provider_projects"("providerId", "lastSyncedAt");

-- CreateIndex
CREATE INDEX "sync_jobs_providerId_createdAt_idx" ON "sync_jobs"("providerId", "createdAt");

-- CreateIndex
CREATE INDEX "sync_jobs_status_createdAt_idx" ON "sync_jobs"("status", "createdAt");

-- CreateIndex
CREATE INDEX "sync_logs_syncJobId_createdAt_idx" ON "sync_logs"("syncJobId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "project_versions_projectId_externalId_key" ON "project_versions"("projectId", "externalId");

-- AddForeignKey
ALTER TABLE "provider_projects" ADD CONSTRAINT "provider_projects_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_projects" ADD CONSTRAINT "provider_projects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_jobs" ADD CONSTRAINT "sync_jobs_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_syncJobId_fkey" FOREIGN KEY ("syncJobId") REFERENCES "sync_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
