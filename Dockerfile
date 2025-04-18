# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --legacy-peer-deps

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy knex directory for migrations
COPY --from=builder /app/knex ./knex
COPY --from=builder /app/knexfile.js ./knexfile.js

# Create logs directory
RUN mkdir -p logs

# Copy environment files
COPY .env.* ./

# Environment argument with default to production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Copy appropriate .env file based on environment
RUN cp .env.${NODE_ENV} .env

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]

# Development stage
FROM node:20-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci --legacy-peer-deps

# Copy source code and environment files
COPY . .

# Create logs directory
RUN mkdir -p logs

# Environment argument with default to development
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Copy appropriate .env file based on environment
RUN cp .env.${NODE_ENV} .env

# Expose port
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "start:dev"]

# Staging stage
FROM node:20-alpine AS staging

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --legacy-peer-deps

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy knex directory for migrations
COPY --from=builder /app/knex ./knex
COPY --from=builder /app/knexfile.js ./knexfile.js

# Create logs directory
RUN mkdir -p logs

# Copy environment files
COPY .env.* ./

# Set environment to staging
ENV NODE_ENV=staging

# Copy appropriate .env file
RUN cp .env.staging .env

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"] 