-- Dependency resolver + per-project compatibility score.

-- AlterTable: enrich Dependency with constraint semantics + semver range so
-- the modpack resolver can detect missing/incompatible constraints instead
-- of blindly picking the latest approved version.
ALTER TABLE "dependencies" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'REQUIRED';
ALTER TABLE "dependencies" ADD COLUMN "versionRange" TEXT;
ALTER TABLE "dependencies" ADD COLUMN "loaderType" "LoaderType";

-- AlterTable: cached 0–100 compatibility score, populated by the resolver.
ALTER TABLE "projects" ADD COLUMN "compatibilityScore" DOUBLE PRECISION;

-- CreateIndex: filter dependencies by constraint kind during resolution.
CREATE INDEX "dependencies_kind_idx" ON "dependencies"("kind");

-- CreateIndex: filter dependencies by loader (constraint scoping).
CREATE INDEX "dependencies_loaderType_idx" ON "dependencies"("loaderType");
