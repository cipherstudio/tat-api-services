@echo off
setlocal enabledelayedexpansion

:: Set colors
set "GREEN=[32m"
set "YELLOW=[33m"
set "RED=[31m"
set "RESET=[0m"

if "%1"=="" goto help
if "%1"=="help" goto help

:: Module Generation Commands
if "%1"=="generate" (
    if "%2"=="" (
        echo %RED%Error: Module name is required. Usage: make generate ^<module-name^>%RESET%
        exit /b 1
    )
    yarn generate %2 %3 %4
    exit /b 0
)

if "%1"=="generate-with-auth" (
    if "%2"=="" (
        echo %RED%Error: Module name is required.%RESET%
        exit /b 1
    )
    yarn generate %2 --auth
    exit /b 0
)

if "%1"=="generate-with-pagination" (
    if "%2"=="" (
        echo %RED%Error: Module name is required.%RESET%
        exit /b 1
    )
    yarn generate %2 --pagination
    exit /b 0
)

if "%1"=="generate-full" (
    if "%2"=="" (
        echo %RED%Error: Module name is required.%RESET%
        exit /b 1
    )
    yarn generate %2 --auth --pagination
    exit /b 0
)

:: Migration Commands
if "%1"=="migration-create" (
    if "%2"=="" (
        echo %RED%Error: Migration name is required.%RESET%
        exit /b 1
    )
    yarn run migration:create --name=%2
    exit /b 0
)

if "%1"=="migration-generate" (
    if "%2"=="" (
        echo %RED%Error: Migration name is required.%RESET%
        exit /b 1
    )
    yarn run migration:generate --name=%2
    exit /b 0
)

if "%1"=="migration-run" (
    yarn run migration:run
    exit /b 0
)

if "%1"=="migration-revert" (
    yarn run migration:revert
    exit /b 0
)

:: Installation Commands
if "%1"=="install" (
    yarn install
    exit /b 0
)

:: Docker Build Commands
if "%1"=="docker-dev-build" (
    docker build --target development -t tat-api:dev .
    exit /b 0
)

if "%1"=="docker-staging-build" (
    docker build --target staging -t tat-api:staging .
    exit /b 0
)

if "%1"=="docker-prod-build" (
    docker build --target production -t tat-api:prod .
    exit /b 0
)

:: Docker Run Commands
if "%1"=="docker-dev-run" (
    docker run -d -p 3000:3000 --name tat-api-dev tat-api:dev
    exit /b 0
)

if "%1"=="docker-staging-run" (
    docker run -d -p 3000:3000 --name tat-api-staging tat-api:staging
    exit /b 0
)

if "%1"=="docker-prod-run" (
    docker run -d -p 3000:3000 --name tat-api-prod tat-api:prod
    exit /b 0
)

:: Docker Compose Commands
if "%1"=="docker-compose-dev" (
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    exit /b 0
)

if "%1"=="docker-compose-staging" (
    docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
    exit /b 0
)

if "%1"=="docker-compose-prod" (
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    exit /b 0
)

if "%1"=="docker-compose-down-dev" (
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
    exit /b 0
)

if "%1"=="docker-compose-down-staging" (
    docker-compose -f docker-compose.yml -f docker-compose.staging.yml down
    exit /b 0
)

if "%1"=="docker-compose-down-prod" (
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
    exit /b 0
)

:: Docker Utility Commands
if "%1"=="docker-logs" (
    docker-compose logs -f
    exit /b 0
)

if "%1"=="docker-ps" (
    docker-compose ps
    exit /b 0
)

if "%1"=="docker-restart" (
    docker-compose restart
    exit /b 0
)

if "%1"=="docker-clean" (
    docker-compose down -v --remove-orphans
    exit /b 0
)

:: Docker Test Commands
if "%1"=="docker-test" (
    docker-compose exec api yarn test
    exit /b 0
)

if "%1"=="docker-test-e2e" (
    docker-compose exec api yarn test:e2e
    exit /b 0
)

:: Docker Migration Commands
if "%1"=="docker-migration-run" (
    docker-compose exec api yarn migration:run
    exit /b 0
)

if "%1"=="docker-migration-generate" (
    if "%2"=="" (
        echo %RED%Error: Migration name is required.%RESET%
        exit /b 1
    )
    docker-compose exec api yarn migration:generate --name=%2
    exit /b 0
)

echo %RED%Unknown command: %1%RESET%
exit /b 1

:help
echo Usage: make [target]
echo.
echo Available targets:
echo.
echo Installation:
echo   install                          Install all dependencies
echo.
echo Module Generation:
echo   generate                         Generate a new module. Usage: make generate ^<module-name^> [flags]
echo   generate-with-auth               Generate a new module with auth guard
echo   generate-with-pagination         Generate a new module with pagination
echo   generate-full                    Generate a new module with auth and pagination
echo.
echo Database Migrations:
echo   migration-create                 Create a new migration
echo   migration-generate               Generate a migration from entity changes
echo   migration-run                    Run pending migrations
echo   migration-revert                 Revert the last migration
echo.
echo Docker Build:
echo   docker-dev-build                 Build development Docker image
echo   docker-staging-build             Build staging Docker image
echo   docker-prod-build                Build production Docker image
echo.
echo Docker Run:
echo   docker-dev-run                   Run development Docker container
echo   docker-staging-run               Run staging Docker container
echo   docker-prod-run                  Run production Docker container
echo.
echo Docker Compose:
echo   docker-compose-dev               Start development environment
echo   docker-compose-staging           Start staging environment
echo   docker-compose-prod              Start production environment
echo   docker-compose-down-dev          Stop development environment
echo   docker-compose-down-staging      Stop staging environment
echo   docker-compose-down-prod         Stop production environment
echo.
echo Docker Utilities:
echo   docker-logs                      View Docker container logs
echo   docker-ps                        List running Docker containers
echo   docker-restart                   Restart Docker containers
echo   docker-clean                     Clean Docker resources
echo.
echo Docker Testing:
echo   docker-test                      Run tests in Docker container
echo   docker-test-e2e                  Run e2e tests in Docker container
echo.
echo Docker Migrations:
echo   docker-migration-run             Run database migrations in Docker container
echo   docker-migration-generate        Generate database migration in Docker container
exit /b 0 