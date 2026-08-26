# syntax=docker/dockerfile:1.6
# Multi-stage build for @mcp/web (Next.js 15, port 3003).
# next.config.js does NOT set `output: 'standalone'`, so this image runs the
# full `next start` server (node_modules/.bin/next start) — it is NOT a slim
# standalone image.

# ---- Stage 1: deps ----
FROM node:20-alpine AS deps
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# web depends on @mcp/auth, @mcp/sdk, @mcp/types, @mcp/ui, @mcp/utils + dev
# @mcp/eslint-config. The web build (next.config.js `transpilePackages`)
# compiles these workspace packages itself, so we only need their source at
# build time — but their package.json files are required for install.
COPY packages/auth/package.json      ./packages/auth/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/sdk/package.json         ./packages/sdk/
COPY packages/types/package.json       ./packages/types/
COPY packages/ui/package.json           ./packages/ui/
COPY packages/utils/package.json       ./packages/utils/

COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile --filter @mcp/web...

# ---- Stage 2: build ----
# Next.js `transpilePackages` consumes workspace source directly, so copy the
# full source of each transpiled package plus the web app, then build.
# @mcp/types ships `main: ./dist/index.js`, so pre-build it so the package
# resolves even though Next will re-transpile its src anyway.
FROM deps AS build
COPY packages/types/ ./packages/types/
COPY packages/utils/ ./packages/utils/
COPY packages/sdk/    ./packages/sdk/
COPY packages/auth/   ./packages/auth/
COPY packages/ui/     ./packages/ui/
COPY apps/web/        ./apps/web/
RUN pnpm --filter @mcp/types run build || true
RUN pnpm --filter @mcp/web run build

# ---- Stage 3: runner ----
# We run the full Next runtime (no standalone output), so node_modules, .next,
# and the package symlink tree all need to come along.
FROM node:20-alpine AS runner
ENV NODE_ENV=production
RUN apk add --no-cache tini
WORKDIR /app
USER node

EXPOSE 3003
# Copy the whole repo workspace layout the runtime symlinks point at.
COPY --from=build --chown=node:node /repo/apps/web/package.json ./apps/web/package.json
COPY --from=build --chown=node:node /repo/apps/web/.next         ./apps/web/.next
COPY --from=build --chown=node:node /repo/apps/web/public         ./apps/web/public
COPY --from=build --chown=node:node /repo/apps/web/next.config.js ./apps/web/next.config.js
COPY --from=build --chown=node:node /repo/packages/types/package.json ./packages/types/package.json
COPY --from=build --chown=node:node /repo/packages/types/ ./packages/types/
COPY --from=build --chown=node:node /repo/packages/utils/package.json ./packages/utils/package.json
COPY --from=build --chown=node:node /repo/packages/utils/ ./packages/utils/
COPY --from=build --chown=node:node /repo/packages/sdk/package.json ./packages/sdk/package.json
COPY --from=build --chown=node:node /repo/packages/sdk/ ./packages/sdk/
COPY --from=build --chown=node:node /repo/packages/auth/package.json ./packages/auth/package.json
COPY --from=build --chown=node:node /repo/packages/auth/ ./packages/auth/
COPY --from=build --chown=node:node /repo/packages/ui/package.json ./packages/ui/package.json
COPY --from=build --chown=node:node /repo/packages/ui/ ./packages/ui/
COPY --from=build --chown=node:node /repo/node_modules ./node_modules

WORKDIR /app/apps/web
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node_modules/.bin/next", "start"]
