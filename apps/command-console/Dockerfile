# RANGER Command Console - Cloud Run Deployment
# Phase 0: Static hosting with Basic Auth for demo access
#
# Build: gcloud run deploy ranger-console --source .
# Or locally: docker build -t ranger-console .

# ============================================
# Stage 1: Build the React application
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment configuration
ARG VITE_ADK_URL
ARG VITE_MAPTILER_API_KEY
ARG VITE_USE_ADK=true

# Set environment variables for build
ENV VITE_ADK_URL=$VITE_ADK_URL
ENV VITE_MAPTILER_API_KEY=$VITE_MAPTILER_API_KEY
ENV VITE_USE_ADK=$VITE_USE_ADK

# Build the application
RUN npm run build

# ============================================
# Stage 2: Production nginx image
# ============================================
FROM nginx:alpine

# Install apache2-utils for htpasswd command
RUN apk add --no-cache apache2-utils

# Build argument for demo password
# Default is intentionally weak - MUST be overridden in deployment
ARG DEMO_PASSWORD=changeme

# Create password file for Basic Auth
# Username: ranger (easy to remember for demos)
RUN htpasswd -cb /etc/nginx/.htpasswd ranger "$DEMO_PASSWORD"

# Copy built React app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Cloud Run expects port 8080
EXPOSE 8080

# Health check for Cloud Run
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
