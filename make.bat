@echo off
setlocal enabledelayedexpansion

:: Define package manager
set PACKAGE_MANAGER=npm

:: Define colors
set GREEN=echo.
set YELLOW=echo.
set RED=echo.

:: Check for command
if "%1" == "" (
    call :help
    exit /b 0
)

:: Execute requested command
if "%1" == "help" (
    call :help
) else if "%1" == "install" (
    call :install
) else if "%1" == "generate" (
    call :generate %2 %3 %4 %5 %6 %7 %8 %9
) else if "%1" == "generate-with-auth" (
    call :generate_with_auth %2 %3 %4 %5 %6 %7 %8 %9
) else if "%1" == "generate-with-pagination" (
    call :generate_with_pagination %2 %3 %4 %5 %6 %7 %8 %9
) else if "%1" == "generate-full" (
    call :generate_full %2 %3 %4 %5 %6 %7 %8 %9
) else if "%1" == "migration-create" (
    call :migration_create %2 %3 %4 %5 %6 %7 %8 %9
) else if "%1" == "migration-run" (
    call :migration_run
) else if "%1" == "migration-revert" (
    call :migration_revert
) else if "%1" == "migration-list" (
    call :migration_list
) else if "%1" == "docker-dev-build" (
    call :docker_dev_build
) else if "%1" == "docker-staging-build" (
    call :docker_staging_build
) else if "%1" == "docker-prod-build" (
    call :docker_prod_build
) else if "%1" == "docker-dev-run" (
    call :docker_dev_run
) else if "%1" == "docker-staging-run" (
    call :docker_staging_run
) else if "%1" == "docker-prod-run" (
    call :docker_prod_run
) else if "%1" == "docker-compose-dev" (
    call :docker_compose_dev
) else if "%1" == "docker-compose-staging" (
    call :docker_compose_staging
) else if "%1" == "docker-compose-prod" (
    call :docker_compose_prod
) else if "%1" == "docker-compose-down-dev" (
    call :docker_compose_down_dev
) else if "%1" == "docker-compose-down-staging" (
    call :docker_compose_down_staging
) else if "%1" == "docker-compose-down-prod" (
    call :docker_compose_down_prod
) else if "%1" == "docker-logs" (
    call :docker_logs
) else if "%1" == "docker-ps" (
    call :docker_ps
) else if "%1" == "docker-restart" (
    call :docker_restart
) else if "%1" == "docker-clean" (
    call :docker_clean
) else if "%1" == "docker-test" (
    call :docker_test
) else if "%1" == "docker-test-e2e" (
    call :docker_test_e2e
) else if "%1" == "docker-migration-run" (
    call :docker_migration_run
) else if "%1" == "docker-migration-list" (
    call :docker_migration_list
) else (
    echo Unknown command: %1
    echo Run 'make help' to see available commands.
    exit /b 1
)

exit /b 0

:help
echo Usage: make [target]
echo.
echo Available targets:
echo.
echo Installation:
echo   install                        Install all dependencies
echo.
echo Module Generation:
echo   generate                       Generate a new module. Usage: make generate name=^<module-name^> [flags]
echo   generate-with-auth             Generate a new module with auth guard. Usage: make generate-with-auth name=^<module-name^>
echo   generate-with-pagination       Generate a new module with pagination. Usage: make generate-with-pagination name=^<module-name^>
echo   generate-full                  Generate a new module with auth and pagination. Usage: make generate-full name=^<module-name^>
echo.
echo Database Migrations:
echo   migration-create               Create a new migration. Usage: make migration-create name=^<migration-name^>
echo   migration-run                  Run pending migrations
echo   migration-revert               Revert the last migration
echo   migration-list                 List all migrations
echo.
echo Docker Build:
echo   docker-dev-build               Build development Docker image
echo   docker-staging-build           Build staging Docker image
echo   docker-prod-build              Build production Docker image
echo.
echo Docker Run:
echo   docker-dev-run                 Run development Docker container
echo   docker-staging-run             Run staging Docker container
echo   docker-prod-run                Run production Docker container
echo.
echo Docker Compose:
echo   docker-compose-dev             Start development environment with Docker Compose
echo   docker-compose-staging         Start staging environment with Docker Compose
echo   docker-compose-prod            Start production environment with Docker Compose
echo   docker-compose-down-dev        Stop development environment
echo   docker-compose-down-staging    Stop staging environment
echo   docker-compose-down-prod       Stop production environment
echo.
echo Docker Utilities:
echo   docker-logs                    View container logs
echo   docker-ps                      List running containers
echo   docker-restart                 Restart containers
echo   docker-clean                   Clean up resources
echo.
echo Docker Testing:
echo   docker-test                    Run tests in Docker container
echo   docker-test-e2e                Run e2e tests in Docker container
echo.
echo Docker Migrations:
echo   docker-migration-run           Run database migrations in Docker container
echo   docker-migration-list          List migrations in Docker container
exit /b 0

:install
echo Installing dependencies...
%PACKAGE_MANAGER% install --legacy-peer-deps
if not exist logs mkdir logs
exit /b 0

:generate
set name=%2
if "!name!" == "" (
    echo Error: Module name is required. Usage: make generate name=^<module-name^>
    exit /b 1
)
%PACKAGE_MANAGER% run generate -- module -n %name% %3 %4 %5 %6 %7 %8 %9
exit /b 0

:generate_with_auth
set name=%2
if "!name!" == "" (
    echo Error: Module name is required.
    exit /b 1
)
%PACKAGE_MANAGER% run generate -- module -n %name% -a
exit /b 0

:generate_with_pagination
set name=%2
if "!name!" == "" (
    echo Error: Module name is required.
    exit /b 1
)
%PACKAGE_MANAGER% run generate -- module -n %name% -p
exit /b 0

:generate_full
set name=%2
if "!name!" == "" (
    echo Error: Module name is required.
    exit /b 1
)
%PACKAGE_MANAGER% run generate -- module -n %name% -p -a
exit /b 0

:migration_create
set name=%2
if "!name!" == "" (
    echo Error: Migration name is required.
    exit /b 1
)
%PACKAGE_MANAGER% run knex:migrate:make %name%
exit /b 0

:migration_run
%PACKAGE_MANAGER% run knex:migrate
exit /b 0

:migration_revert
%PACKAGE_MANAGER% run knex:migrate:rollback
exit /b 0

:migration_list
%PACKAGE_MANAGER% run knex:migrate:list
exit /b 0

:docker_dev_build
docker build --target development -t tat-api:dev .
exit /b 0

:docker_staging_build
docker build --target staging -t tat-api:staging .
exit /b 0

:docker_prod_build
docker build --target production -t tat-api:prod .
exit /b 0

:docker_dev_run
docker run -d -p 3000:3000 --name tat-api-dev tat-api:dev
exit /b 0

:docker_staging_run
docker run -d -p 3000:3000 --name tat-api-staging tat-api:staging
exit /b 0

:docker_prod_run
docker run -d -p 3000:3000 --name tat-api-prod tat-api:prod
exit /b 0

:docker_compose_dev
call :docker_dev_build
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
exit /b 0

:docker_compose_staging
call :docker_staging_build
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
exit /b 0

:docker_compose_prod
call :docker_prod_build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
exit /b 0

:docker_compose_down_dev
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
exit /b 0

:docker_compose_down_staging
docker-compose -f docker-compose.yml -f docker-compose.staging.yml down
exit /b 0

:docker_compose_down_prod
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
exit /b 0

:docker_logs
docker-compose logs -f
exit /b 0

:docker_ps
docker-compose ps
exit /b 0

:docker_restart
docker-compose restart
exit /b 0

:docker_clean
docker-compose down -v --remove-orphans
docker system prune -f
exit /b 0

:docker_test
docker-compose exec api npm run test
exit /b 0

:docker_test_e2e
docker-compose exec api npm run test:e2e
exit /b 0

:docker_migration_run
docker-compose exec api npm run knex:migrate
exit /b 0

:docker_migration_list
docker-compose exec api npm run knex:migrate:list
exit /b 0 