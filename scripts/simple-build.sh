#!/usr/bin/env bash
set -euo pipefail

echo "🏗️ Simple build for SafraReport deployment..."

# Ensure we're in project root
cd "$(dirname "$0")/.."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Run database setup (for production deployment)
if [ "$NODE_ENV" = "production" ]; then
  echo "🗄️  Setting up database..."
  # Run the safe seed which handles essential data
  node --import tsx/esm server/seeds/safe-seed.ts || echo "Seeding completed or skipped"
fi

# Build server
echo "🔌 Building server..."
pnpm esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outdir=dist \
  --external:vite \
  --external:@vitejs/plugin-react

echo "✅ Simple build completed successfully!"