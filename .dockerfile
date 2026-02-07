# Railway-optimized Dockerfile for Next.js
FROM node:18-alpine AS builder

# Install build dependencies if needed
RUN apk add --no-cache git python3 make g++

WORKDIR /app

# Copy package files first (caching layer)
COPY package*.json ./
COPY package-lock.json* ./

# Install ALL dependencies (Railway needs dev deps for build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy built application from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json

# Install production dependencies only (for node_modules)
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
