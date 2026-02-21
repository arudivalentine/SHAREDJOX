# Docker Development Environment

## Quick Start

```bash
docker-compose up -d
bash infrastructure/scripts/start.sh
```

## Services

| Service | Port | Purpose |
|---------|------|---------|
| Nginx | 80 | Reverse proxy, API gateway |
| Node (Vite) | 5173 | React dev server with HMR |
| PHP-FPM | 9000 | Laravel API (internal) |
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Cache, sessions, queues |

## Hot Reload

- **React**: Automatic via Vite HMR on file changes in `apps/web/src`
- **Laravel**: File changes in `apps/api/app` trigger PHP-FPM reload
- **Database**: Migrations run automatically on container startup

## Common Commands

```bash
# View logs
docker-compose logs -f php-fpm
docker-compose logs -f node

# Run Artisan commands
docker-compose exec php-fpm php artisan tinker

# Run npm commands
docker-compose exec node npm run build

# Access database
docker-compose exec postgres psql -U sharedjox -d sharedjox

# Rebuild containers
docker-compose build --no-cache
```

## Health Checks

All services include health checks. View status:

```bash
docker-compose ps
```

Services are ready when all show `healthy` status.

## Troubleshooting

**Port already in use:**
```bash
docker-compose down
# Or change ports in docker-compose.yml
```

**Database connection failed:**
```bash
docker-compose logs postgres
docker-compose exec postgres pg_isready -U sharedjox
```

**Node modules issues:**
```bash
docker-compose exec node npm ci
```

**PHP extensions missing:**
```bash
docker-compose build --no-cache php-fpm
docker-compose up -d
```
