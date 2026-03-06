# AmEDU Admin Dashboard Dockerfile
# Optimized for Google Cloud Run deployment with runtime env substitution

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build with placeholder values that will be replaced at runtime
ENV VITE_API_URL=__VITE_API_URL_PLACEHOLDER__
ENV VITE_APP_NAME="AmEDU Admin"

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install serve globally for serving static files
RUN npm install -g serve

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Default port (can be overridden by PORT env variable)
ENV PORT=3789

# Create entrypoint script that replaces placeholders with runtime env vars
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'set -e' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo '# Replace placeholder with actual VITE_API_URL from runtime env' >> /app/entrypoint.sh && \
    echo 'if [ -n "$VITE_API_URL" ]; then' >> /app/entrypoint.sh && \
    echo '  find /app/dist -type f -name "*.js" -exec sed -i "s|__VITE_API_URL_PLACEHOLDER__|$VITE_API_URL|g" {} \;' >> /app/entrypoint.sh && \
    echo '  echo "Replaced VITE_API_URL with: $VITE_API_URL"' >> /app/entrypoint.sh && \
    echo 'else' >> /app/entrypoint.sh && \
    echo '  echo "WARNING: VITE_API_URL not set, using placeholder"' >> /app/entrypoint.sh && \
    echo 'fi' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo '# Start the server' >> /app/entrypoint.sh && \
    echo 'exec serve -s dist -l ${PORT}' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 3789

# Start with entrypoint script
CMD ["/app/entrypoint.sh"]
