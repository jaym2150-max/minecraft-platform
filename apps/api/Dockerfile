# syntax=docker/dockerfile:1.6
# Multi-stage build for @mcp/api (NestJS API, port 4000).
# Triggers: docker-compose.yml + README "docker compose up --build" for "API + 6 workers".

# ---- Stage 1: deps ----
FROM node:20-alpine AS deps
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# All workspace packages; api transitively depends on @mcp/sdk, @mcp/types,
# @mcp/utils, and @mcp/eslint-config (dev, needed by the build script).
COPY packages/auth/package.json      ./packages/auth/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/sdk/package.json         ./packages/sdk/
COPY packages/types/package.json       ./packages/types/
COPY packages/ui/package.json           ./packages/ui/
COPY packages/utils/package.json       ./packages/utils/

COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile --filter @mcp/api...

# ---- Stage 2: build ----
FROM deps AS build
# @prisma/client needs the generated runtime; copy the schema and generate.
COPY apps/api/prisma ./apps/api/prisma
RUN pnpm --filter @mcp/api db:generate

# Build the workspace package the API imports at runtime (@mcp/types), then the
# API itself. (@mcp/utils/@mcp/sdk are declared-but-unused deps; @mcp/types is
# the only workspace package actually `import`ed by apps/api/src, so its `dist`
# must exist before `require("@mcp/types")` resolves at runtime.)
COPY packages/types/ ./packages/types/
COPY apps/api/        ./apps/api/

RUN pnpm --filter @mcp/types run build
RUN pnpm --filter @mcp/api run build
RUN pnpm --filter @mcp/api prune --prod

# ---- Stage 3: runner ----
FROM node:20-alpine AS runner
ENV NODE_ENV=production
RUN apk add --no-cache tini
WORKDIR /app
USER node

EXPOSE 4000
COPY --from=build --chown=node:node /repo/apps/api/package.json ./package.json
COPY --from=build --chown=node:node /repo/apps/api/prisma ./prisma
COPY --from=build --chown=node:node /repo/apps/api/dist ./dist
COPY --from=build --chown=node:node /repo/node_modules ./node_modules
# @mcp/types is the only workspace package the API imports at runtime; its dist
# must exist alongside the pnpm symlink in node_modules.
COPY --from=build --chown=node:node /repo/packages/types/package.json ./packages/types/package.json
COPY --from=build --chown=node:node /repo/packages/types/dist ./packages/types/dist

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]