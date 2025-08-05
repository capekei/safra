#!/bin/bash
set -e

echo "🏗️  SafraReport Single Repo Build Process"
echo "======================================="

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf src/client/dist src/server/dist src/shared/dist

# Build shared library first (dependency for server)
echo "📦 Building shared library..."
cd src/shared
npm run build 2>/dev/null || tsc
cd ../..

# Build server (depends on shared)
echo "🖥️  Building server..."
cd src/server  
npm run build 2>/dev/null || (tsc && esbuild index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist)
cd ../..

# Build client (static assets)
echo "🌐 Building client..."
cd src/client
npm run build 2>/dev/null || (tsc && vite build)
cd ../..

echo "✅ Build completed successfully!"
echo "📁 Output locations:"
echo "   - Client: src/client/dist/"  
echo "   - Server: src/server/dist/"
echo "   - Shared: src/shared/dist/"