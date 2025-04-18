# Detect OS
ifeq ($(OS),Windows_NT)
	SHELL := powershell.exe
	.SHELLFLAGS := -NoProfile -Command
	PACKAGE_MANAGER := npm.cmd
	RM_CMD = Remove-Item -Recurse -Force
	MKDIR_CMD = New-Item -ItemType Directory -Force
else
	SHELL := /bin/bash
	PACKAGE_MANAGER := npm
	RM_CMD = rm -rf
	MKDIR_CMD = mkdir -p
endif

# Colors for terminal output
ifeq ($(OS),Windows_NT)
	GREEN = Write-Host
	YELLOW = Write-Host
	RED = Write-Host
else
	GREEN = echo "\033[0;32m"
	YELLOW = echo "\033[0;33m"
	RED = echo "\033[0;31m"
endif

.PHONY: help \
        install \
        generate generate-with-auth generate-with-pagination generate-full \
        migration-create migration-run migration-revert migration-list \
        docker-dev-build docker-staging-build docker-prod-build \
        docker-dev-run docker-staging-run docker-prod-run \
        docker-compose-dev docker-compose-staging docker-compose-prod \
        docker-compose-down-dev docker-compose-down-staging docker-compose-down-prod \
        docker-logs docker-ps docker-restart docker-clean \
        docker-test docker-test-e2e \
        docker-migration-run docker-migration-list

help: ## Display this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Available targets:"
	@echo ""
	@echo "Installation:"
	@awk '/^install:/ { helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { printf "  \033[36m%-30s\033[0m %s\n", substr($$1, 0, index($$1, ":")-1), substr(lastLine, RSTART + 3, RLENGTH); } \
	}' $(MAKEFILE_LIST)
	@echo ""
	@echo "Module Generation:"
	@awk '/^generate.*:/ { helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { printf "  \033[36m%-30s\033[0m %s\n", substr($$1, 0, index($$1, ":")-1), substr(lastLine, RSTART + 3, RLENGTH); } \
	}' $(MAKEFILE_LIST)
	@echo ""
	@echo "Database Migrations:"
	@awk '/^migration.*:/ { helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { printf "  \033[36m%-30s\033[0m %s\n", substr($$1, 0, index($$1, ":")-1), substr(lastLine, RSTART + 3, RLENGTH); } \
	}' $(MAKEFILE_LIST)
	@echo ""
	@echo "Docker Build:"
	@awk '/^docker.*-build:/ { helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { printf "  \033[36m%-30s\033[0m %s\n", substr($$1, 0, index($$1, ":")-1), substr(lastLine, RSTART + 3, RLENGTH); } \
	}' $(MAKEFILE_LIST)
	@echo ""
	@echo "Docker Run:"
	@awk '/^docker.*-run:/ { helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { printf "  \033[36m%-30s\033[0m %s\n", substr($$1, 0, index($$1, ":")-1), substr(lastLine, RSTART + 3, RLENGTH); } \
	}' $(MAKEFILE_LIST)
	@echo ""
	@echo "Docker Compose:"
	@awk '/^docker-compose.*:/ { helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { printf "  \033[36m%-30s\033[0m %s\n", substr($$1, 0, index($$1, ":")-1), substr(lastLine, RSTART + 3, RLENGTH); } \
	}' $(MAKEFILE_LIST)
	@echo ""
	@echo "Docker Utilities:"
	@awk '/^docker-(logs|ps|restart|clean):/ { helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { printf "  \033[36m%-30s\033[0m %s\n", substr($$1, 0, index($$1, ":")-1), substr(lastLine, RSTART + 3, RLENGTH); } \
	}' $(MAKEFILE_LIST)
	@echo ""
	@echo "Docker Testing:"
	@awk '/^docker-test.*:/ { helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { printf "  \033[36m%-30s\033[0m %s\n", substr($$1, 0, index($$1, ":")-1), substr(lastLine, RSTART + 3, RLENGTH); } \
	}' $(MAKEFILE_LIST)
	@echo ""
	@echo "Docker Migrations:"
	@awk '/^docker-migration.*:/ { helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { printf "  \033[36m%-30s\033[0m %s\n", substr($$1, 0, index($$1, ":")-1), substr(lastLine, RSTART + 3, RLENGTH); } \
	}' $(MAKEFILE_LIST)

## Module Generation Commands

generate: ## Generate a new module. Usage: make generate name=<module-name> [flags]
ifeq ($(OS),Windows_NT)
	@if (!$$env:name) { Write-Host "Error: Module name is required. Usage: make generate name=<module-name>" -ForegroundColor Red; exit 1 }
	@$(PACKAGE_MANAGER) run generate -- module -n $$env:name $${args}
else
	@if [ -z "$(name)" ]; then echo "Error: Module name is required. Usage: make generate name=<module-name>" && exit 1; fi
	@$(PACKAGE_MANAGER) run generate -- module -n $(name) $(flags)
endif

generate-with-auth: ## Generate a new module with auth guard. Usage: make generate-with-auth name=<module-name>
ifeq ($(OS),Windows_NT)
	@if (!$$env:name) { Write-Host "Error: Module name is required." -ForegroundColor Red; exit 1 }
	@$(PACKAGE_MANAGER) run generate -- module -n $$env:name -a
else
	@if [ -z "$(name)" ]; then echo "Error: Module name is required." && exit 1; fi
	@$(PACKAGE_MANAGER) run generate -- module -n $(name) -a
endif

generate-with-pagination: ## Generate a new module with pagination. Usage: make generate-with-pagination name=<module-name>
ifeq ($(OS),Windows_NT)
	@if (!$$env:name) { Write-Host "Error: Module name is required." -ForegroundColor Red; exit 1 }
	@$(PACKAGE_MANAGER) run generate -- module -n $$env:name -p
else
	@if [ -z "$(name)" ]; then echo "Error: Module name is required." && exit 1; fi
	@$(PACKAGE_MANAGER) run generate -- module -n $(name) -p
endif

generate-full: ## Generate a new module with auth and pagination. Usage: make generate-full name=<module-name>
ifeq ($(OS),Windows_NT)
	@if (!$$env:name) { Write-Host "Error: Module name is required." -ForegroundColor Red; exit 1 }
	@$(PACKAGE_MANAGER) run generate -- module -n $$env:name -p -a
else
	@if [ -z "$(name)" ]; then echo "Error: Module name is required." && exit 1; fi
	@$(PACKAGE_MANAGER) run generate -- module -n $(name) -p -a
endif

## Migration Commands

migration-create: ## Create a new migration. Usage: make migration-create name=<migration-name>
ifeq ($(OS),Windows_NT)
	@if (!$$env:name) { Write-Host "Error: Migration name is required." -ForegroundColor Red; exit 1 }
	@$(PACKAGE_MANAGER) run knex:migrate:make $$env:name
else
	@if [ -z "$(name)" ]; then echo "Error: Migration name is required." && exit 1; fi
	@$(PACKAGE_MANAGER) run knex:migrate:make $(name)
endif

migration-run: ## Run pending migrations
	@$(PACKAGE_MANAGER) run knex:migrate

migration-revert: ## Revert the last migration
	@$(PACKAGE_MANAGER) run knex:migrate:rollback

migration-list: ## List all migrations
	@$(PACKAGE_MANAGER) run knex:migrate:list

## Installation and Setup

install: ## Install all dependencies
	@$(PACKAGE_MANAGER) install --legacy-peer-deps
	@$(MKDIR_CMD) logs

## Docker Build Commands

docker-dev-build: ## Build development Docker image
	docker build --target development -t tat-api:dev .

docker-staging-build: ## Build staging Docker image
	docker build --target staging -t tat-api:staging .

docker-prod-build: ## Build production Docker image
	docker build --target production -t tat-api:prod .

## Docker Run Commands

docker-dev-run: ## Run development Docker container
	docker run -d -p 3000:3000 --name tat-api-dev tat-api:dev

docker-staging-run: ## Run staging Docker container
	docker run -d -p 3000:3000 --name tat-api-staging tat-api:staging

docker-prod-run: ## Run production Docker container
	docker run -d -p 3000:3000 --name tat-api-prod tat-api:prod

## Docker Compose Commands

docker-compose-dev: docker-dev-build ## Start development environment with Docker Compose
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

docker-compose-staging: docker-staging-build ## Start staging environment with Docker Compose
	docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d

docker-compose-prod: docker-prod-build ## Start production environment with Docker Compose
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

docker-compose-down-dev: ## Stop development environment
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

docker-compose-down-staging: ## Stop staging environment
	docker-compose -f docker-compose.yml -f docker-compose.staging.yml down

docker-compose-down-prod: ## Stop production environment
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

## Docker Utility Commands

docker-logs: ## View Docker container logs
	docker-compose logs -f

docker-ps: ## List running Docker containers
	docker-compose ps

docker-restart: ## Restart Docker containers
	docker-compose restart

docker-clean: ## Clean Docker resources
	docker-compose down -v --remove-orphans

## Docker Test Commands

docker-test: ## Run tests in Docker container
	docker-compose exec api npm run test

docker-test-e2e: ## Run e2e tests in Docker container
	docker-compose exec api npm run test:e2e

## Docker Migration Commands

docker-migration-run: ## Run database migrations in Docker container
	docker-compose exec api npm run knex:migrate

docker-migration-list: ## List migrations in Docker container
	docker-compose exec api npm run knex:migrate:list 