#!/bin/bash
set -e

echo "🏗️  SafraReport Simple Build (Render Ready)"
echo "==========================================="

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf src/client/dist src/server/dist src/shared/dist

# Build shared library (skip type checking for now)
echo "📦 Building shared library..."
cd src/shared
npx tsc --noEmit false --skipLibCheck true
cd ../..

# Build client (essential for production)
echo "🌐 Building client..."
cd src/client
npm run build 2>/dev/null || npx vite build
cd ../..

# Skip server TypeScript compilation for now - use runtime transpilation
echo "🖥️  Server will use runtime transpilation (tsx)"

echo "✅ Simple build completed!"
echo "📁 Output locations:"
echo "   - Client: src/client/dist/"  
echo "   - Server: Runtime transpiled via tsx"
echo "   - Shared: src/shared/dist/"