# Monitoring

Observability stack for Minecraft Platform.

## Stack

- **Prometheus** - Metrics collection
- **Grafana** - Dashboards
- **Loki** - Log aggregation
- **AlertManager** - Alert routing

## Files

- `prometheus.yml` - Scrape configuration
- `alerts.yml` - Alerting rules
- `grafana/` - Dashboard JSONs
- `loki/` - Log configuration

## Metrics Collected

### Application
- HTTP request rate and latency
- Error rates per endpoint
- Active database connections
- Queue depths
- Cache hit/miss rates

### Infrastructure
- CPU, memory, disk, network
- Database performance (queries/sec, slow queries)
- Redis memory usage and eviction rate

### Business
- New user signups
- New project uploads
- Downloads per day
- Active users (DAU/MAU)

## Key Alerts

| Alert | Trigger | Severity |
|-------|---------|----------|
| API Down | No response for 1m | Critical |
| High Error Rate | >10% 5xx for 5m | Critical |
| High Latency | p95 > 1s for 5m | Warning |
| Queue Backlog | >1000 jobs for 10m | Warning |
| Disk Low | <10% free | Warning |

## Run

```bash
docker compose -f docker-compose.monitoring.yml up -d
```

Then visit:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)
- AlertManager: http://localhost:9093
