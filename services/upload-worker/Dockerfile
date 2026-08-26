# syntax=docker/dockerfile:1.6
# Multi-stage build for @mcp/upload-worker (BullMQ worker, no HTTP port).
# Build context is the repo root (docker-compose.services.yml sets context: .).

# ---- Stage 1: deps ----
# Install only the dependencies required by this service (and its workspace
# transitive deps via the `...` filter) using the frozen lockfile.
FROM node:20-alpine AS deps
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo

# Copy only the workspace manifests first to maximize layer caching.
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy every workspace package's package.json so `pnpm install --filter ...`
# can resolve `workspace:*` deps (e.g. @mcp/types) without the full source.
COPY packages/auth/package.json      ./packages/auth/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/sdk/package.json         ./packages/sdk/
COPY packages/types/package.json       ./packages/types/
COPY packages/ui/package.json           ./packages/ui/
COPY packages/utils/package.json       ./packages/utils/

# Copy this service's own package.json.
COPY services/upload-worker/package.json ./services/upload-worker/

# `...` expands to include all transitive workspace dependencies.
RUN pnpm install --frozen-lockfile --filter @mcp/upload-worker...

# ---- Stage 2: build ----
# Copy the full source for the workspace packages this service depends on plus
# the service itself, then build with TypeScript.
FROM deps AS build
COPY packages/types/ ./packages/types/
COPY services/upload-worker/ ./services/upload-worker/
RUN pnpm --filter @mcp/upload-worker run build

# ---- Stage 3: runner ----
# Minimal non-root runtime image with tini for proper PID-1 signal handling.
FROM node:20-alpine AS runner
ENV NODE_ENV=production
RUN apk add --no-cache tini
WORKDIR /app
USER node

# Copy the built artifact, its production node_modules, and the package.json
# (needed by pnpm's symlink layout at runtime).
COPY --from=build --chown=node:node /repo/services/upload-worker/package.json ./package.json
COPY --from=build --chown=node:node /repo/services/upload-worker/dist ./dist
COPY --from=build --chown=node:node /repo/node_modules ./node_modules
COPY --from=build --chown=node:node /repo/packages/types/package.json ./packages/types/package.json

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
