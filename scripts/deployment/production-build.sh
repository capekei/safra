#!/bin/bash

# Production Build Script for SafraReport
# This script prepares the application for production deployment

set -e

echo "🏗️  Starting SafraReport production build..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo "📋 Node.js version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Update browserslist db
echo "🌐 Updating browserslist database..."
npx update-browserslist-db@latest

# Run TypeScript check
echo "🔍 Running TypeScript check..."
npx tsc --noEmit

# Build the application
echo "🏗️  Building application..."
npm run build

# Verify build output
if [ ! -d "dist" ]; then
    echo "❌ Build failed: dist directory not found"
    exit 1
fi

if [ ! -f "dist/index.js" ]; then
    echo "❌ Build failed: server build not found"
    exit 1
fi

if [ ! -d "dist/public" ]; then
    echo "❌ Build failed: client build not found"
    exit 1
fi

echo "✅ Production build completed successfully!"
echo "📁 Server build: dist/index.js"
echo "📁 Client build: dist/public/"
echo ""
echo "🚀 Ready for deployment!"
echo "   To start in production: NODE_ENV=production node dist/index.js"