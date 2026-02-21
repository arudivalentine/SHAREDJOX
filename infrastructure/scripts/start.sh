#!/bin/bash

set -e

echo "🚀 Starting SharedJox development environment..."

if [ ! -f "apps/api/.env" ]; then
    echo "📋 Creating Laravel .env..."
    cp infrastructure/docker/.env.example apps/api/.env
fi

if [ ! -d "apps/api/vendor" ]; then
    echo "📦 Installing PHP dependencies..."
    docker-compose exec -T php-fpm composer install
fi

if [ ! -d "apps/web/node_modules" ]; then
    echo "📦 Installing Node dependencies..."
    docker-compose exec -T node npm install
fi

echo "🗄️  Running database migrations..."
docker-compose exec -T php-fpm php artisan migrate --force

echo "✅ Environment ready!"
echo ""
echo "📍 Access points:"
echo "   API:  http://localhost/api"
echo "   Web:  http://localhost:5173"
echo "   DB:   localhost:5432"
echo ""
echo "🛑 To stop: docker-compose down"
