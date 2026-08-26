# syntax=docker/dockerfile:1.6
# Multi-stage build for @mcp/image-processor (BullMQ + sharp).
# NOTE: sharp ships prebuilt alpine musl binaries via optionalDeps; the
# node:20-alpine libc matches. If sharp musl resolution fails, set
# ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1 before install.

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
COPY services/image-processor/package.json ./services/image-processor/

RUN pnpm install --frozen-lockfile --filter @mcp/image-processor...

# ---- Stage 2: build ----
FROM deps AS build
COPY services/image-processor/ ./services/image-processor/
RUN pnpm --filter @mcp/image-processor run build
RUN pnpm --filter @mcp/image-processor prune --prod

# ---- Stage 3: runner ----
# image-processor needs /tmp scratch space for sharp caches. In k8s mount a
# tmpfs at /tmp; readOnlyRootFilesystem is still safe with that emptyDir.
FROM node:20-alpine AS runner
ENV NODE_ENV=production
RUN apk add --no-cache tini
WORKDIR /app
USER node

COPY --from=build --chown=node:node /repo/services/image-processor/package.json ./package.json
COPY --from=build --chown=node:node /repo/services/image-processor/dist ./dist
COPY --from=build --chown=node:node /repo/node_modules ./node_modules

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
