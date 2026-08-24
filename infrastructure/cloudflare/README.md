# Cloudflare Worker

Edge caching layer for the public API.

## Features

- Caches GET responses to popular public endpoints (60s TTL)
- Adds CORS headers to all responses
- Forwards all other requests to the origin
- Cloudflare-native observability

## Setup

```bash
# Install wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy
wrangler publish
```

## Cached Endpoints

- `GET /api/v1/projects` - Project listings
- `GET /api/v1/categories` - Categories
- `GET /api/v1/minecraft-versions` - Minecraft versions
- `GET /api/v1/loaders` - Loader types

## Adding More Endpoints

To cache additional endpoints, add them to `CACHEABLE_PATHS` in `worker.ts`.

## Rate Limiting

The worker doesn't implement rate limiting itself. Use Cloudflare's
native Rate Limiting rules in the dashboard for that.
