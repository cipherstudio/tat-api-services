# TAT API Services

A modern NestJS API service with authentication, session management, and comprehensive documentation.

## Features

- 🔐 Authentication with JWT
- 👥 User Management
- 📱 Two-Factor Authentication
- 🔄 Session Management
- 📝 Audit Logging
- 📊 Pagination Support
- 🔢 API Versioning
- 📚 Swagger Documentation
- 🔍 Type Safety
- 🧪 Unit Testing Support
- 🎯 Code Generation Tools

## Database

This project uses Knex.js as the query builder for database operations with Oracle database.

### Migrations

Knex migrations are used to manage database schema changes:

```bash
# Run migrations
npm run knex:migrate

# Create a new migration
npm run knex:migrate:make -- migration_name

# Rollback the last batch of migrations
npm run knex:migrate:rollback

# List all migrations and their status
npm run knex:migrate:list
```

### Seeds

Seed data can be managed with the following commands:

```bash
# Run all seed files
npm run knex:seed:run

# Create a new seed file
npm run knex:seed:make -- seed_name
```

## Prerequisites

- Node.js >= 16.0.0
- Yarn package manager
- PostgreSQL database

## Installation

```bash
# Install dependencies
yarn install
```

## Configuration

Create a `.env` file in the root directory:

```env
# Application
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=tat_api_db

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Mail
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your_email
MAIL_PASSWORD=your_password
MAIL_FROM=noreply@example.com
```

## Docker Support

The project includes Docker support for multiple environments (development, staging, and production).

### Prerequisites

- Docker
- Docker Compose

### Environment Configuration

The project uses environment-specific configuration files:

- `.env.development` - Development environment settings
- `.env.staging` - Staging environment settings
- `.env.production` - Production environment settings

### Development Environment

```bash
# Build and start development containers
make docker-compose-dev

# View logs
make docker-logs

# Run database migrations
make docker-migration-run

# Stop development containers
make docker-compose-down-dev
```

### Staging Environment

```bash
# Build and start staging containers
make docker-compose-staging

# Stop staging containers
make docker-compose-down-staging
```

### Production Environment

```bash
# Build and start production containers
make docker-compose-prod

# Stop production containers
make docker-compose-down-prod
```

### Available Docker Commands

```bash
# Build environment-specific images
make docker-dev-build
make docker-staging-build
make docker-prod-build

# Run environment-specific containers
make docker-dev-run
make docker-staging-run
make docker-prod-run

# Start environment-specific services with Docker Compose
make docker-compose-dev
make docker-compose-staging
make docker-compose-prod

# Stop environment-specific services
make docker-compose-down-dev
make docker-compose-down-staging
make docker-compose-down-prod

# General commands
make docker-logs     # View container logs
make docker-ps      # List running containers
make docker-restart # Restart containers
make docker-clean   # Clean up resources
```

### Docker Compose Services

Each environment (dev/staging/prod) includes:

- **API**: NestJS application
  - Development: Hot-reload enabled
  - Staging/Production: Optimized build
- **PostgreSQL**: Database service
  - Development DB: `tat_api_dev_db`
  - Staging DB: `tat_api_staging_db`
  - Production DB: `tat_api_prod_db`
  - Default credentials (customize per environment):
    - Username: postgres
    - Password: environment-specific
    
### Environment-Specific Features

- **Development**:
  - Hot-reload enabled
  - Volume mounts for local development
  - Development-specific environment variables
  
- **Staging**:
  - Production-like environment
  - Staging-specific database
  - Staging environment variables
  
- **Production**:
  - Optimized build
  - Automatic container restart
  - Production environment variables
  - Enhanced security settings

## Running the Application

```bash
# Development
yarn start:dev

# Production
yarn build
yarn start:prod
```

## API Documentation

The API documentation is available at `/api/docs` when the application is running. It includes:

- Authentication endpoints
- User management endpoints
- Request/response schemas
- Authentication flows
- API versioning information

## API Versioning

The API uses URI versioning:

- Base URL: `/api/v1`
- Future versions will be: `/api/v2`, `/api/v3`, etc.

Example endpoints:
- GET `/api/v1/users`
- POST `/api/v1/auth/login`
- GET `/api/v1/auth/profile`

## Module Generation

The project provides two ways to generate new modules:

### Using Make Commands (Recommended)

```bash
# Basic module generation
make generate name=product

# With pagination support
make generate-with-pagination name=product

# With authentication
make generate-with-auth name=product

# With all features (auth and pagination)
make generate-full name=product

# Additional flags can be passed using the flags parameter
make generate name=product flags="--version 2"
```

The Make commands provide a simpler interface and handle cross-platform compatibility automatically. They're the recommended way to generate new modules.

### Using TypeScript Script Directly

```bash
# Basic module
yarn ts-node scripts/generate-module.ts <module-name>

# With pagination
yarn ts-node scripts/generate-module.ts <module-name> --pagination

# With authentication
yarn ts-node scripts/generate-module.ts <module-name> --auth

# With specific version
yarn ts-node scripts/generate-module.ts <module-name> --version 2

# All options
yarn ts-node scripts/generate-module.ts <module-name> --pagination --auth --version 2
```

Generated module structure:
```