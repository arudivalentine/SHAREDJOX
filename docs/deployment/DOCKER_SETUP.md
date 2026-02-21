# Docker Development Environment Setup

## Prerequisites

- Docker 24.0+
- Docker Compose 2.20+
- 4GB RAM minimum (8GB recommended)
- 10GB free disk space

### Installation

**macOS (Homebrew):**
```bash
brew install docker docker-compose
```

**Ubuntu/Debian:**
```bash
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
```

**Windows:**
Download [Docker Desktop](https://www.docker.com/products/docker-desktop)

## Quick Start

### 1. Start All Services
```bash
cd infrastructure/docker
make up
```

This starts:
- **Laravel API** (PHP-FPM) on port 9000
- **Nginx** on port 80
- **React Frontend** (Vite) on port 5173
- **PostgreSQL** on port 5432
- **Redis** on port 6379
- **Reverb** (WebSocket) on port 8080
- **Horizon** (Queue Worker)

### 2. Run Migrations
```bash
make migrate
```

### 3. Access Services

| Service | URL |
|---------|-----|
| API | http://localhost/api |
| Frontend | http://localhost:5173 |
| WebSocket | ws://localhost:8080 |
| Database | localhost:5432 |
| Redis | localhost:6379 |

## Common Commands

### View Logs
```bash
make logs
```

### SSH into Containers
```bash
make shell-app       # PHP container
make shell-frontend  # Node container
```

### Database Operations
```bash
make migrate         # Run migrations
make fresh           # Reset database
```

### Stop Services
```bash
make down
```

### Clean Everything
```bash
make clean           # Remove containers and volumes
```

## Service Details

### App (PHP-FPM)
- **Image:** Custom PHP 8.3 with extensions
- **Port:** 9000 (internal)
- **Volume:** `../../apps/api:/var/www/api`
- **Dependencies:** PostgreSQL, Redis

### Web (Node/Vite)
- **Image:** Node 20 Alpine
- **Port:** 5173
- **Volume:** `../../apps/web:/app`
- **HMR:** Enabled for live reload

### Nginx
- **Image:** nginx:alpine
- **Port:** 80
- **Config:** `./nginx/conf.d/default.conf`
- **Serves:** Laravel API + Vite frontend

### PostgreSQL
- **Image:** postgres:15-alpine
- **Port:** 5432
- **Database:** sharedjox
- **User:** sharedjox
- **Password:** sharedjox_dev
- **Volume:** `postgres-data`

### Redis
- **Image:** redis:7-alpine
- **Port:** 6379
- **Volume:** `redis-data`
- **Used for:** Cache, Queue, Session, Broadcasting

### Reverb (WebSocket)
- **Image:** Custom PHP 8.3
- **Port:** 8080
- **Command:** `php artisan reverb:start`
- **Dependencies:** Redis, PostgreSQL

### Horizon (Queue Worker)
- **Image:** Custom PHP 8.3
- **Command:** `php artisan horizon`
- **Dependencies:** Redis, PostgreSQL

## Environment Variables

### API (.env.docker)
```
APP_ENV=local
DB_HOST=postgres
REDIS_HOST=redis
REVERB_HOST=0.0.0.0
BROADCAST_DRIVER=reverb
```

### Frontend (.env.docker)
```
VITE_API_URL=http://localhost/api
VITE_WS_URL=ws://localhost:8080
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :80
lsof -i :5173
lsof -i :8080

# Kill process
kill -9 <PID>
```

### Permission Denied
```bash
# Fix Docker socket permissions
sudo chmod 666 /var/run/docker.sock

# Or add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Containers Won't Start
```bash
# Check logs
docker-compose logs app

# Rebuild images
make build

# Restart services
make down
make up
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check credentials in .env.docker
# Default: sharedjox / sharedjox_dev

# Restart PostgreSQL
docker-compose restart postgres
```

### Vite HMR Not Working
```bash
# Ensure --host flag is set in Dockerfile
# Check VITE_API_URL and VITE_WS_URL in .env.docker
# Restart frontend
docker-compose restart web
```

### WebSocket Connection Failed
```bash
# Check Reverb is running
docker-compose ps reverb

# Check port 8080 is accessible
curl http://localhost:8080

# View Reverb logs
docker-compose logs reverb
```

## Development Workflow

### 1. Edit Code
- Backend: Edit `apps/api/` files (auto-reloaded)
- Frontend: Edit `apps/web/` files (HMR enabled)

### 2. Run Migrations
```bash
make migrate
```

### 3. View Logs
```bash
make logs
```

### 4. Debug
```bash
# SSH into container
make shell-app

# Run artisan commands
php artisan tinker
php artisan queue:work
```

## Performance Tips

1. **Use named volumes** for database persistence
2. **Bind mounts** for live code reloading
3. **Multi-stage builds** for production (separate compose file)
4. **Resource limits** in docker-compose.yml if needed

## Production Deployment

For production, use separate configuration:
- `docker-compose.prod.yml` (no bind mounts)
- Multi-stage builds (smaller images)
- Environment-specific secrets
- Nginx with SSL/TLS
- Database backups
- Monitoring and logging

See `docs/deployment/PRODUCTION.md` for details.

## Health Checks

All services have health checks configured:

```bash
# View health status
docker-compose ps

# Check specific service
docker inspect sharedjox-app --format='{{.State.Health.Status}}'
```

## Useful Docker Commands

```bash
# View all containers
docker ps -a

# View image sizes
docker images

# Remove unused images
docker image prune

# View container stats
docker stats

# Execute command in container
docker-compose exec app php artisan tinker

# View container logs
docker-compose logs -f app

# Rebuild specific service
docker-compose build --no-cache app
```

## Next Steps

1. Run `make up` to start all services
2. Run `make migrate` to setup database
3. Open http://localhost in browser
4. Start developing!

## Support

For issues, check:
- `docker-compose logs` for error messages
- Service health: `docker-compose ps`
- Port conflicts: `lsof -i :<port>`
- Docker daemon: `docker ps`
