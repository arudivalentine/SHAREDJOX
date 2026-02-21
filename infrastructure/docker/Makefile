.PHONY: help up down build logs shell-app shell-frontend migrate fresh horizon reverb test npm-install npm-dev

help:
	@echo "SharedJox Docker Commands"
	@echo "========================="
	@echo "make up              - Start all containers"
	@echo "make down            - Stop all containers"
	@echo "make build           - Build all images"
	@echo "make logs            - View container logs"
	@echo "make shell-app       - SSH into app container"
	@echo "make shell-frontend  - SSH into frontend container"
	@echo "make migrate         - Run database migrations"
	@echo "make fresh           - Fresh migration (reset database)"
	@echo "make horizon         - View Horizon queue dashboard"
	@echo "make reverb          - View Reverb WebSocket server"
	@echo "make test            - Run tests"
	@echo "make npm-install     - Install npm dependencies"
	@echo "make npm-dev         - Run npm dev server"

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build --no-cache

logs:
	docker-compose logs -f

shell-app:
	docker-compose exec app sh

shell-frontend:
	docker-compose exec web sh

migrate:
	docker-compose exec app php artisan migrate

fresh:
	docker-compose exec app php artisan migrate:fresh

horizon:
	docker-compose exec app php artisan horizon

reverb:
	docker-compose exec reverb php artisan reverb:start

test:
	docker-compose exec app php artisan test

npm-install:
	docker-compose exec web npm install

npm-dev:
	docker-compose exec web npm run dev

ps:
	docker-compose ps

restart:
	docker-compose restart

clean:
	docker-compose down -v
