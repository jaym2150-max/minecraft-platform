-- Minecraft Platform — PostgreSQL Initialization
-- This runs on first container startup

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Performance indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_project_slug ON "Project" (slug);
CREATE INDEX IF NOT EXISTS idx_project_author_id ON "Project" ("authorId");
CREATE INDEX IF NOT EXISTS idx_project_status ON "Project" (status);
CREATE INDEX IF NOT EXISTS idx_project_category_id ON "Project" ("categoryId");
CREATE INDEX IF NOT EXISTS idx_project_created_at ON "Project" ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_project_downloads ON "Project" ("downloads" DESC);

CREATE INDEX IF NOT EXISTS idx_project_version_project_id ON "ProjectVersion" ("projectId");
CREATE INDEX IF NOT EXISTS idx_project_version_status ON "ProjectVersion" (status);

CREATE INDEX IF NOT EXISTS idx_download_project_id ON "Download" ("projectId");
CREATE INDEX IF NOT EXISTS idx_download_created_at ON "Download" ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_download_project_created ON "Download" ("projectId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_comment_project_id ON "Comment" ("projectId");
CREATE INDEX IF NOT EXISTS idx_comment_author_id ON "Comment" ("authorId");

CREATE INDEX IF NOT EXISTS idx_user_email ON "User" (email);
CREATE INDEX IF NOT EXISTS idx_user_username ON "User" (username);

CREATE INDEX IF NOT EXISTS idx_loader_project_id ON "Loader" ("projectId");
CREATE INDEX IF NOT EXISTS idx_loader_type ON "Loader" (type);

CREATE INDEX IF NOT EXISTS idx_dependency_dependent_id ON "Dependency" ("dependentId");
CREATE INDEX IF NOT EXISTS idx_dependency_required_id ON "Dependency" ("requiredId");

-- Trigram index for case-insensitive substring search
CREATE INDEX IF NOT EXISTS idx_project_title_trgm ON "Project" USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_project_description_trgm ON "Project" USING gin (description gin_trgm_ops);
