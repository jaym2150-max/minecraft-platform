# Deployment Guide

This guide covers deploying Minecraft Platform to production.

## Deployment Options

We support several deployment strategies:

1. **Docker Compose** - Single-host deployment (good for small/medium instances)
2. **Kubernetes** - Production-grade orchestration (recommended for scale)
3. **Cloudflare Workers + Managed Services** - Edge-first deployment

## Prerequisites

- A domain name with DNS configured
- TLS certificates (Let's Encrypt recommended)
- A managed PostgreSQL database (AWS RDS, DigitalOcean, etc.)
- A managed Redis instance (Upstash, Redis Cloud)
- An S3-compatible object store (AWS S3, R2, MinIO)
- An email service (SendGrid, Mailgun, AWS SES)
- Meilisearch Cloud or self-hosted

## Environment Variables

All environment variables are documented in `.env.example`. Critical production values:

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Must be `production` |
| `JWT_SECRET` | Use a cryptographically random 64+ char string |
| `DATABASE_URL` | Connection string for your production database |
| `REDIS_URL` | Connection string for Redis |
| `MEILISEARCH_URL` | URL of your Meilisearch instance |
| `S3_ENDPOINT` | S3 endpoint (omit for AWS) |
| `S3_BUCKET` | Bucket for private uploads |
| `S3_PUBLIC_BUCKET` | Bucket for public assets |
| `SMTP_*` | Email delivery credentials |
| `WEB_URL` | Public URL of the web app |
| `API_URL` | Public URL of the API |

## Docker Compose (Simple)

```bash
# Build images
docker compose -f docker-compose.prod.yml build

# Run migrations
docker compose -f docker-compose.prod.yml run --rm api pnpm db:migrate:prod

# Start all services
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

## Kubernetes (Production)

Manifests are in `infrastructure/kubernetes/`. To deploy:

```bash
# Create namespace
kubectl apply -f infrastructure/kubernetes/namespace.yaml

# Create secrets (do not commit these)
kubectl create secret generic mcp-secrets \
  --from-literal=jwt-secret=$(openssl rand -hex 32) \
  --from-literal=database-url=$DATABASE_URL \
  --from-literal=redis-url=$REDIS_URL \
  -n minecraft-platform

# Apply manifests
kubectl apply -f infrastructure/kubernetes/ -n minecraft-platform

# Run migrations
kubectl exec -it deployment/api -n minecraft-platform -- pnpm db:migrate:prod
```

## SSL/TLS

We recommend using a reverse proxy (Nginx, Caddy, or a managed load balancer) for TLS termination.

See `infrastructure/nginx/` for sample configs.

## Monitoring

Prometheus + Grafana dashboards are available in `infrastructure/monitoring/`.

Key metrics to monitor:

- API request rate and error rate
- Database connection pool utilization
- Redis memory usage
- Queue depth (BullMQ)
- Disk usage on object storage
- ClamAV scan times

## Backups

- **Database**: Daily automated backups via your managed Postgres
- **Object storage**: Use S3 versioning and lifecycle rules
- **Configuration**: Store in version control (excluding secrets)

## Scaling

The platform is designed to scale horizontally:

- API: Stateless, can run multiple replicas behind a load balancer
- Workers: Independent processes, scale each based on queue depth
- Database: Vertical scaling or read replicas for heavy reads
- Search: Meilisearch supports clustering
- Storage: S3 is infinitely scalable

## CI/CD

GitHub Actions workflows in `.github/workflows/` handle:

- `ci.yml` - Lint, test, and build on every PR
- `lint.yml` - Linting on push
- `deploy.yml` - Production deployment on main branch

## Rollback

If a deployment introduces issues:

```bash
# Kubernetes
kubectl rollout undo deployment/api -n minecraft-platform

# Docker
docker compose -f docker-compose.prod.yml down
git checkout <previous-tag>
docker compose -f docker-compose.prod.yml up -d
```

Always ensure migrations are backward-compatible.
