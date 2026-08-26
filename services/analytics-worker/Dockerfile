# syntax=docker/dockerfile:1.6
# Multi-stage build for @mcp/analytics-worker (BullMQ + Prisma).

# ---- Stage 1: deps ----
FROM node:20-alpine AS deps
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/auth/package.json      ./packages/auth/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/sdk/package.json         ./packages/sdk/
COPY packages/types/package.json       ./packages/types/
COPY packages/ui/package.json           ./packages/ui/
COPY packages/utils/package.json       ./packages/utils/
COPY services/analytics-worker/package.json ./services/analytics-worker/

RUN pnpm install --frozen-lockfile --filter @mcp/analytics-worker...

# ---- Stage 2: build ----
FROM deps AS build
COPY packages/types/ ./packages/types/
COPY services/analytics-worker/ ./services/analytics-worker/
RUN pnpm --filter @mcp/analytics-worker run build
RUN pnpm --filter @mcp/analytics-worker prune --prod

# ---- Stage 3: runner ----
FROM node:20-alpine AS runner
ENV NODE_ENV=production
RUN apk add --no-cache tini
WORKDIR /app
USER node

COPY --from=build --chown=node:node /repo/services/analytics-worker/package.json ./package.json
COPY --from=build --chown=node:node /repo/services/analytics-worker/dist ./dist
COPY --from=build --chown=node:node /repo/node_modules ./node_modules
COPY --from=build --chown=node:node /repo/packages/types/package.json ./packages/types/package.json

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
