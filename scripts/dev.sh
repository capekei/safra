#!/usr/bin/env bash
set -euo pipefail

# 📝 Purpose: Complete development environment setup
# 🎯 Usage: ./scripts/dev.sh
# 🔧 Requirements: Node 20+, pnpm 8+

echo "🚀 Starting SafraReport development environment..."

# Ensure we're in project root
cd "$(dirname "$0")/.."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Setup database (skipped due to schema conflicts)
echo "🗄️ Database setup skipped - schema alignment needed..."
# pnpm run db:push

# Start development servers in parallel
echo "⚡ Starting development servers..."
echo "📱 Frontend (Vite + React): http://localhost:5173"
echo "🔌 Backend API: http://localhost:4000"
echo ""
echo "🔄 Starting backend server..."
echo "   Backend logs will show here. Frontend runs separately."
echo "   Open another terminal and run: cd client && pnpm run dev"
echo "   Alternative: pnpm --filter=@safra/client run dev"
echo ""

# Use config files from .config directory
NODE_ENV=development tsx server/index.ts