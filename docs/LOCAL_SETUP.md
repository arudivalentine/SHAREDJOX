# Local Development Setup (No Docker)

## Prerequisites

- PHP 8.3 with extensions: pdo_pgsql, redis, zip, mbstring
- Node 20+
- PostgreSQL 15
- Redis 7
- Composer

## Quick Start

### 1. Database Setup

```bash
createdb sharedjox
psql sharedjox < /dev/null
```

### 2. Laravel Setup

```bash
cd apps/api
cp ../../infrastructure/docker/.env.example .env

# Edit .env
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=sharedjox
DB_USERNAME=postgres
DB_PASSWORD=your_password

composer install
php artisan migrate
php artisan serve --port=8000
```

### 3. React Setup

```bash
cd apps/web
npm install
npm run dev
```

Access:
- API: http://localhost:8000
- Web: http://localhost:5173

## When Docker Network Recovers

Run `docker-compose up -d` to switch to containerized setup.
