-- Speed up the game-version facet query: WHERE project.status = 'PUBLISHED'
-- AND versionString = '1.20.1' now uses a covering index instead of a seqscan.
CREATE INDEX "loaders_versionString_idx" ON "loaders"("versionString");
CREATE INDEX "loaders_type_idx" ON "loaders"("type");
CREATE INDEX "loaders_type_versionString_idx" ON "loaders"("type", "versionString");
