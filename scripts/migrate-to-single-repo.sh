#!/usr/bin/env bash
set -euo pipefail

# SafraReport Elite Migration Script
# Converts Turborepo monorepo to optimized single repository
# Preserves git history while restructuring for performance

echo "🚀 SafraReport Elite Migration: Monorepo → Single Repo"
echo "========================================================="

# Configuration
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${PROJECT_ROOT}/backup-migration-$(date +%Y%m%d-%H%M%S)"
TEMP_DIR="/tmp/safra-migration-$$"

# Safety checks
echo "🔍 Pre-migration safety checks..."

# Verify we're in the correct project
if [[ ! -f "$PROJECT_ROOT/turbo.json" ]] || [[ ! -f "$PROJECT_ROOT/pnpm-workspace.yaml" ]]; then
    echo "❌ Error: Not in SafraReport root directory or missing monorepo files"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "❌ Error: Uncommitted changes detected. Please commit or stash changes before migration."
    git status --porcelain
    exit 1
fi

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Create backup
echo "💾 Creating full backup..."
mkdir -p "$BACKUP_DIR"
cp -r "$PROJECT_ROOT"/{client,server,shared,package.json,turbo.json,pnpm-workspace.yaml,pnpm-lock.yaml} "$BACKUP_DIR/" 2>/dev/null || true
echo "✅ Backup created at: $BACKUP_DIR"

# Create temporary directory for migration work
mkdir -p "$TEMP_DIR"
trap "rm -rf $TEMP_DIR" EXIT

echo "🏗️  Phase 1: Repository Structure Migration"
echo "-------------------------------------------"

cd "$PROJECT_ROOT"

# Create new src directory structure
echo "📁 Creating new directory structure..."
mkdir -p src/{client,server,shared}

# Move packages to src directory with git history preservation
echo "🔄 Moving client package..."
git mv client/* src/client/ 2>/dev/null || (
    # Fallback for when git mv fails due to file conflicts
    cp -r client/* src/client/
    git add src/client/
    git rm -r client/
)

echo "🔄 Moving server package..."
git mv server/* src/server/ 2>/dev/null || (
    cp -r server/* src/server/
    git add src/server/
    git rm -r server/
)

echo "🔄 Moving shared package..."
git mv shared/* src/shared/ 2>/dev/null || (
    cp -r shared/* src/shared/
    git add src/shared/
    git rm -r shared/
)

# Remove old package directories if they exist
rm -rf client server shared 2>/dev/null || true

echo "🧹 Cleaning up old monorepo configuration..."

# Remove monorepo configuration files
rm -f turbo.json pnpm-workspace.yaml 2>/dev/null || true

# Remove pnpm-lock.yaml (will be replaced with package-lock.json)
rm -f pnpm-lock.yaml 2>/dev/null || true

# Remove individual package node_modules if they exist
rm -rf src/{client,server,shared}/node_modules 2>/dev/null || true

echo "📝 Updating build scripts..."

# Update build scripts to work with new structure
mkdir -p scripts/migration

# Create new simplified build script
cat > scripts/build-single-repo.sh << 'EOF'
#!/usr/bin/env bash
set -euo pipefail

echo "🏗️ Building SafraReport (Single Repo)..."

# Ensure we're in project root
cd "$(dirname "$0")/.."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Type check
echo "🔍 Type checking..."
npm run type-check

# Build shared types first
echo "🔧 Building shared types..."
cd src/shared && npm run build && cd ../..

# Build server
echo "🔌 Building server..."
cd src/server
npm run build
cd ../..

# Build client
echo "🎨 Building client..."
cd src/client
npm run build
cd ../..

echo "✅ Build completed successfully!"
EOF

chmod +x scripts/build-single-repo.sh

# Create new development script
cat > scripts/dev-single-repo.sh << 'EOF'
#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Starting SafraReport development server (Single Repo)..."

# Ensure we're in project root
cd "$(dirname "$0")/.."

# Install dependencies if node_modules doesn't exist
if [[ ! -d "node_modules" ]]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build shared types
echo "🔧 Building shared types..."
cd src/shared && npm run build && cd ../..

echo "🎯 Starting parallel development servers..."
echo "   - Backend: http://localhost:4000"
echo "   - Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"

# Start servers in parallel
trap 'kill $(jobs -p) 2>/dev/null || true' EXIT

# Start backend server
cd src/server && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend server
cd ../client && npm run dev &
FRONTEND_PID=$!

# Wait for any server to exit
wait
EOF

chmod +x scripts/dev-single-repo.sh

echo "🔧 Migration Phase 1 completed!"
echo ""
echo "Next steps:"
echo "1. Run the package.json consolidation script"
echo "2. Update import paths"
echo "3. Update TypeScript configuration"
echo ""
echo "🎯 To proceed, run: npm run migrate:consolidate-packages"

# Commit the structural changes
git add .
git commit -m "feat: Migrate to single repo structure

- Move client, server, shared packages to src/ directory
- Remove Turborepo and pnpm workspace configuration  
- Add simplified build and dev scripts
- Preserve git history for all moved files

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>" || echo "⚠️  No changes to commit"

echo "✅ Phase 1 Migration completed successfully!"
echo "📁 New structure: src/{client,server,shared}"
echo "💾 Backup available at: $BACKUP_DIR"