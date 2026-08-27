-- Data quality detection (spec §46, §48, §76).
-- ProjectStatus gains DEPRECATED; DataIssue persists detected issues for the
-- admin data-quality dashboard.

-- AddValueToEnum: append DEPRECATED to the existing ProjectStatus enum.
ALTER TYPE "ProjectStatus" ADD VALUE 'DEPRECATED';

-- CreateEnum
CREATE TYPE "DataIssueKind" AS ENUM (
    'DUPLICATE_TITLE',
    'DUPLICATE_SLUG',
    'DUPLICATE_EXTERNAL',
    'MISSING_DESCRIPTION',
    'MISSING_ICON',
    'MISSING_VERSIONS',
    'BROKEN_SOURCE_URL',
    'BROKEN_DISCORD_URL',
    'BROKEN_WIKI_URL',
    'INACTIVE_RELEASE_TRAIL'
);

-- CreateEnum
CREATE TYPE "DataIssueStatus" AS ENUM ('OPEN', 'IGNORED', 'RESOLVED');

-- CreateTable
CREATE TABLE "data_issues" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "kind" "DataIssueKind" NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 1,
    "status" "DataIssueStatus" NOT NULL DEFAULT 'OPEN',
    "detail" TEXT,
    "relatedId" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_issues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "data_issues_projectId_idx" ON "data_issues"("projectId");
CREATE INDEX "data_issues_kind_status_idx" ON "data_issues"("kind", "status");
CREATE INDEX "data_issues_status_severity_idx" ON "data_issues"("status", "severity");

-- AddForeignKey
ALTER TABLE "data_issues" ADD CONSTRAINT "data_issues_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
