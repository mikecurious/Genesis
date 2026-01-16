.PHONY: help build up down restart logs clean dev prod backup restore test

# Default target
help:
	@echo "My Genesis Fortune - Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev              - Start development environment"
	@echo "  make dev-logs         - View development logs"
	@echo "  make dev-down         - Stop development environment"
	@echo ""
	@echo "Production:"
	@echo "  make build            - Build production images"
	@echo "  make up               - Start production environment"
	@echo "  make down             - Stop production environment"
	@echo "  make restart          - Restart production services"
	@echo "  make logs             - View production logs"
	@echo ""
	@echo "Maintenance:"
	@echo "  make backup           - Backup MongoDB database"
	@echo "  make restore FILE=... - Restore MongoDB from backup"
	@echo "  make clean            - Remove all containers and volumes (⚠️ DANGER)"
	@echo "  make ps               - Show running containers"
	@echo "  make health           - Check service health"
	@echo ""

# Development commands
dev:
	docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ Development environment started"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:5000"
	@echo "MongoDB: localhost:27017"

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

dev-down:
	docker-compose -f docker-compose.dev.yml down

# Production commands
build:
	docker-compose build --no-cache
	@echo "✅ Production images built"

up:
	docker-compose up -d
	@echo "✅ Production environment started"
	@echo "Run 'make logs' to view logs"

down:
	docker-compose down
	@echo "✅ Production environment stopped"

restart:
	docker-compose restart
	@echo "✅ Services restarted"

logs:
	docker-compose logs -f

# Status and health
ps:
	docker-compose ps

health:
	@echo "Checking service health..."
	@curl -s http://localhost:5000/api/health | jq . || echo "❌ Backend not responding"
	@curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend is running" || echo "❌ Frontend not responding"

# Database operations
backup:
	@echo "Creating MongoDB backup..."
	@mkdir -p ./backups
	docker-compose exec -T mongodb mongodump --out /data/backup
	docker cp mygenesisfortune-mongodb:/data/backup ./backups/backup-$$(date +%Y%m%d-%H%M%S)
	@echo "✅ Backup created in ./backups/"

restore:
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Error: Please specify backup file"; \
		echo "Usage: make restore FILE=./backups/backup-20240101-120000"; \
		exit 1; \
	fi
	@echo "Restoring MongoDB from $(FILE)..."
	docker cp $(FILE) mygenesisfortune-mongodb:/data/restore
	docker-compose exec -T mongodb mongorestore /data/restore
	@echo "✅ Database restored"

# Maintenance
clean:
	@echo "⚠️  WARNING: This will remove all containers, volumes, and data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		docker-compose -f docker-compose.dev.yml down -v; \
		echo "✅ Cleaned up all containers and volumes"; \
	else \
		echo "Cancelled"; \
	fi

# Testing
test:
	docker-compose exec backend npm test

# Update and rebuild
update:
	git pull
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d
	@echo "✅ Application updated and restarted"
