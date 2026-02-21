# Environment Variables Reference

## Backend (apps/api/.env)

### Application
| Variable | Default | Description |
|----------|---------|-------------|
| APP_NAME | SharedJox | Application name |
| APP_ENV | local | Environment (local, staging, production) |
| APP_DEBUG | true | Debug mode (local only) |
| APP_URL | http://localhost | Application URL |

### Database
| Variable | Default | Description |
|----------|---------|-------------|
| DB_CONNECTION | pgsql | Database driver |
| DB_HOST | postgres | Database host |
| DB_PORT | 5432 | Database port |
| DB_DATABASE | sharedjox | Database name |
| DB_USERNAME | sharedjox | Database user |
| DB_PASSWORD | sharedjox_dev | Database password |

### Cache & Session
| Variable | Default | Description |
|----------|---------|-------------|
| CACHE_DRIVER | redis | Cache driver |
| SESSION_DRIVER | redis | Session driver |
| QUEUE_CONNECTION | redis | Queue driver |

### Redis
| Variable | Default | Description |
|----------|---------|-------------|
| REDIS_HOST | redis | Redis host |
| REDIS_PORT | 6379 | Redis port |
| REDIS_PASSWORD | null | Redis password |

### Broadcasting (WebSocket)
| Variable | Default | Description |
|----------|---------|-------------|
| BROADCAST_DRIVER | reverb | Broadcast driver |
| REVERB_APP_KEY | sharedjox | Reverb app key |
| REVERB_APP_SECRET | sharedjox-secret | Reverb app secret |
| REVERB_HOST | 0.0.0.0 | Reverb host |
| REVERB_PORT | 8080 | Reverb port |
| REVERB_SCHEME | http | Reverb scheme (http/https) |

### Mail
| Variable | Default | Description |
|----------|---------|-------------|
| MAIL_MAILER | log | Mail driver |
| MAIL_FROM_ADDRESS | dev@sharedjox.local | From email address |

### Stripe
| Variable | Default | Description |
|----------|---------|-------------|
| STRIPE_PUBLIC_KEY | pk_test_ | Stripe public key |
| STRIPE_SECRET_KEY | sk_test_ | Stripe secret key |
| STRIPE_WEBHOOK_SECRET | whsec_test_ | Stripe webhook secret |

### AI Service
| Variable | Default | Description |
|----------|---------|-------------|
| OPENAI_API_KEY | (empty) | OpenAI API key |
| AI_SERVICE_URL | http://ai:8000 | AI service URL |

### Frontend URLs
| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_URL | http://localhost | Frontend API URL |
| VITE_WS_URL | ws://localhost:8080 | WebSocket URL |

## Frontend (apps/web/.env)

### API Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_URL | http://localhost/api | Backend API URL |
| VITE_WS_URL | ws://localhost:8080 | WebSocket server URL |
| VITE_STRIPE_PUBLIC_KEY | pk_test_ | Stripe public key |

## Docker Environment

### Local Development (.env.docker)
```bash
# Backend
APP_ENV=local
APP_DEBUG=true
DB_HOST=postgres
REDIS_HOST=redis
BROADCAST_DRIVER=reverb

# Frontend
VITE_API_URL=http://localhost/api
VITE_WS_URL=ws://localhost:8080
```

### Production (.env.production)
```bash
# Backend
APP_ENV=production
APP_DEBUG=false
DB_HOST=prod-db.example.com
REDIS_HOST=prod-redis.example.com
BROADCAST_DRIVER=reverb

# Frontend
VITE_API_URL=https://api.sharedjox.com
VITE_WS_URL=wss://api.sharedjox.com:8080
```

## Service-Specific Variables

### PostgreSQL
```bash
POSTGRES_DB=sharedjox
POSTGRES_USER=sharedjox
POSTGRES_PASSWORD=sharedjox_dev
```

### Redis
```bash
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=null
```

### Reverb
```bash
REVERB_HOST=0.0.0.0
REVERB_PORT=8080
REVERB_APP_KEY=sharedjox
REVERB_APP_SECRET=sharedjox-secret
```

## Local vs Production

### Local Development
- APP_DEBUG=true
- DB_HOST=localhost (or postgres in Docker)
- REDIS_HOST=localhost (or redis in Docker)
- VITE_API_URL=http://localhost/api
- VITE_WS_URL=ws://localhost:8080

### Production
- APP_DEBUG=false
- DB_HOST=managed database service
- REDIS_HOST=managed cache service
- VITE_API_URL=https://api.sharedjox.com
- VITE_WS_URL=wss://api.sharedjox.com:8080
- All secrets from AWS Secrets Manager or similar

## Stripe Configuration

### Test Mode
```bash
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

### Live Mode
```bash
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
```

## AI Service Configuration

### Local Development
```bash
OPENAI_API_KEY=sk-...
AI_SERVICE_URL=http://localhost:8000
```

### Docker
```bash
OPENAI_API_KEY=sk-...
AI_SERVICE_URL=http://ai:8000
```

### Production
```bash
OPENAI_API_KEY=sk-... (from AWS Secrets Manager)
AI_SERVICE_URL=https://ai.sharedjox.com
```

## Setting Environment Variables

### Docker Compose
Variables are set in `docker-compose.yml` under `environment:` section.

### Local Development
Create `.env` file in project root:
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### Docker Development
Use `.env.docker` files:
```bash
cp apps/api/.env.docker apps/api/.env
cp apps/web/.env.docker apps/web/.env
```

### Production
Use environment-specific files or secrets manager:
```bash
# AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id sharedjox/prod

# Or use .env.production
cp apps/api/.env.production apps/api/.env
```

## Security Best Practices

1. **Never commit .env files** - Add to .gitignore
2. **Use secrets manager** - AWS Secrets Manager, HashiCorp Vault
3. **Rotate secrets regularly** - Especially API keys
4. **Use strong passwords** - Database, Redis, etc.
5. **Limit environment access** - Only production team
6. **Audit environment changes** - Log all modifications
7. **Use different keys per environment** - Dev, staging, prod

## Validation

### Check Environment
```bash
# Backend
php artisan env

# Frontend
echo $VITE_API_URL
```

### Test Connections
```bash
# Database
psql -h $DB_HOST -U $DB_USERNAME -d $DB_DATABASE

# Redis
redis-cli -h $REDIS_HOST -p $REDIS_PORT ping

# API
curl $VITE_API_URL/api/auth/me

# WebSocket
wscat -c $VITE_WS_URL
```

## Troubleshooting

### Variable Not Found
- Check .env file exists
- Verify variable name spelling
- Restart application/container
- Check environment scope (local vs Docker)

### Connection Failed
- Verify host/port values
- Check service is running
- Verify credentials
- Check firewall rules

### Wrong Value Used
- Check .env file is loaded
- Verify no conflicting system variables
- Check docker-compose.yml overrides
- Restart container
