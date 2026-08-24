# Kubernetes Manifests

Production-ready Kubernetes manifests for Minecraft Platform.

## Directory Structure

```
kubernetes/
├── 00-namespace.yaml
├── 01-secrets.yaml.template
├── 10-postgres.yaml
├── 11-redis.yaml
├── 20-api.yaml
├── 21-web.yaml
├── 22-admin.yaml
├── 23-docs.yaml
├── 30-workers.yaml
├── 40-ingress.yaml
├── 50-network-policies.yaml
└── 60-monitoring.yaml
```

## Quick Start

```bash
# 1. Create the namespace
kubectl apply -f 00-namespace.yaml

# 2. Create secrets (edit first!)
cp 01-secrets.yaml.template 01-secrets.yaml
# Edit 01-secrets.yaml with your values
kubectl apply -f 01-secrets.yaml

# 3. Deploy infrastructure
kubectl apply -f 10-postgres.yaml
kubectl apply -f 11-redis.yaml

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n minecraft-platform --timeout=300s

# 4. Run migrations (one-time job)
kubectl apply -f job-migrate.yaml
kubectl wait --for=condition=complete job/db-migrate -n minecraft-platform --timeout=120s

# 5. Deploy apps
kubectl apply -f 20-api.yaml
kubectl apply -f 21-web.yaml
kubectl apply -f 22-admin.yaml
kubectl apply -f 23-docs.yaml
kubectl apply -f 30-workers.yaml

# 6. Configure ingress
kubectl apply -f 40-ingress.yaml

# 7. Set up monitoring
kubectl apply -f 60-monitoring.yaml
```

## Scaling

Each app deployment has a `HorizontalPodAutoscaler` (HPA) configured:

```bash
# Manual scale
kubectl scale deployment api --replicas=5 -n minecraft-platform

# View HPA status
kubectl get hpa -n minecraft-platform
```

## Ingress

Uses the [ingress-nginx](https://kubernetes.github.io/ingress-nginx/) controller. Routes:

- `minecraftplatform.com` → web
- `api.minecraftplatform.com` → api
- `admin.minecraftplatform.com` → admin
- `docs.minecraftplatform.com` → docs

TLS is handled by cert-manager with Let's Encrypt.

## Production Checklist

- [ ] Use a managed database (RDS, Cloud SQL) instead of in-cluster Postgres
- [ ] Use a managed Redis (ElastiCache, MemoryStore) instead of in-cluster Redis
- [ ] Configure pod disruption budgets
- [ ] Set resource requests and limits on all containers
- [ ] Enable network policies
- [ ] Configure pod security standards
- [ ] Set up backup/restore procedures
- [ ] Configure monitoring and alerting
- [ ] Use sealed-secrets or external-secrets for secret management
