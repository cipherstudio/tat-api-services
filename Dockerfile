# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install production dependencies only
RUN yarn install --frozen-lockfile --production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

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
CMD ["yarn", "start:prod"]

# Development stage
FROM node:20-alpine AS development

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install all dependencies
RUN yarn install --frozen-lockfile

# Copy source code and environment files
COPY . .

# Environment argument with default to development
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Copy appropriate .env file based on environment
RUN cp .env.${NODE_ENV} .env

# Expose port
EXPOSE 3000

# Start the application in development mode
CMD ["yarn", "start:dev"]

# Staging stage
FROM node:20-alpine AS staging

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install production dependencies only
RUN yarn install --frozen-lockfile --production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy environment files
COPY .env.* ./

# Set environment to staging
ENV NODE_ENV=staging

# Copy appropriate .env file
RUN cp .env.staging .env

# Expose port
EXPOSE 3000

# Start the application
CMD ["yarn", "start:prod"] 