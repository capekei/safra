#!/usr/bin/env bash
set -euo pipefail

# 📝 Purpose: Full test suite execution
# 🎯 Usage: ./scripts/test.sh [--coverage] [--ui]
# 🔧 Requirements: Node 20+, pnpm 8+

echo "🧪 Running SafraReport test suite..."

# Ensure we're in project root
cd "$(dirname "$0")/.."

# Install dependencies
pnpm install

# Parse command line arguments
COVERAGE=false
UI=false

for arg in "$@"; do
  case $arg in
    --coverage)
      COVERAGE=true
      shift
      ;;
    --ui)
      UI=true
      shift
      ;;
    *)
      # Unknown option
      ;;
  esac
done

# Run tests with appropriate flags
if [ "$UI" = true ]; then
  echo "🎨 Starting test UI..."
  vitest --ui --config .config/vitest.config.ts
elif [ "$COVERAGE" = true ]; then
  echo "📊 Running tests with coverage..."
  vitest run --coverage --config .config/vitest.config.ts
else
  echo "⚡ Running all tests..."
  vitest run --config .config/vitest.config.ts
fi

echo "✅ Tests completed!"