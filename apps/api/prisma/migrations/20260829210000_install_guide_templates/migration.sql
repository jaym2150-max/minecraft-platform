-- Install guide templates — admin-editable per-loader install instructions
-- (spec §31) rendered against a Project's loaders + game versions.

CREATE TABLE "install_guide_templates" (
    "id" TEXT NOT NULL,
    "loader" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "body" TEXT NOT NULL,
    "recommended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "install_guide_templates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "install_guide_templates_loader_idx" ON "install_guide_templates"("loader");
CREATE INDEX "install_guide_templates_recommended_idx" ON "install_guide_templates"("recommended");
