FROM node:20-alpine

WORKDIR /app

# Install system dependencies for better performance on budget devices  
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && npm config set fund false \
    && npm config set audit false

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Fix package-lock.json sync issue and install dependencies
RUN rm -f package-lock.json && \
    npm install --prefer-offline --no-audit --no-fund

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies and unnecessary files for smaller image
RUN npm prune --production && \
    rm -rf client/src client/components.json vite.config.ts tsconfig.json && \
    rm -rf scripts/analysis scripts/testing scripts/maintenance && \
    npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 4000

# Health check for Dominican mobile networks
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

CMD ["npm", "run", "prod:start"]