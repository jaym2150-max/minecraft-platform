# Multi-stage build: install deps once, lean runtime image.
FROM node:20-alpine AS build
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /repo

# Copy workspace manifests first for layer caching.
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY services/__SERVICE__/package.json ./services/__SERVICE__/
COPY packages/types/package.json ./packages/types/
RUN pnpm --filter @mcp/__SERVICE__ fetch

# Now copy source for this service.
COPY packages/types/ ./packages/types/
COPY services/__SERVICE__/ ./services/__SERVICE__/
RUN pnpm install --filter @mcp/types... --filter @mcp/__SERVICE__... --offline
RUN pnpm --filter @mcp/__SERVICE__ build

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app
COPY --from=build /repo /repo
WORKDIR /repo/services/__SERVICE__
EXPOSE 3000
CMD ["pnpm", "start"]
