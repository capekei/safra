#!/usr/bin/env bash
set -euo pipefail

# 📝 Purpose: Production build with validation
# 🎯 Usage: ./scripts/build.sh
# 🔧 Requirements: Node 20+, pnpm 8+

echo "🏗️ Building SafraReport for production..."

# Ensure we're in project root
cd "$(dirname "$0")/.."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Type check
echo "📝 Running TypeScript checks..."
tsc --noEmit --project .config/typescript.config.json

# Build client
echo "⚡ Building client..."
vite build --config .config/vite.config.ts

# Build server
echo "🔌 Building server..."
esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outdir=dist \
  --external:vite \
  --external:@vitejs/plugin-react

echo "✅ Build completed successfully!"
echo "📦 Output: dist/"