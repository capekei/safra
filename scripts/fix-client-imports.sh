#!/bin/bash
set -e

echo "🔧 Fixing client import paths..."

cd "$(dirname "$0")/../src/client"

# Fix all @/ imports in the client directory
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components|./components|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/hooks|./hooks|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/lib|./lib|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/pages|./pages|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/utils|./lib/utils|g'

# Fix relative imports for nested files
find ./components -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|\./components|../components|g'
find ./pages -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|\./components|../components|g'
find ./pages -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|\./hooks|../hooks|g'
find ./pages -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|\./lib|../lib|g'

# Fix deeply nested components
find ./components/ui -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|../components|../../components|g'
find ./pages/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|\.\./components|../../components|g'
find ./pages/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|\.\./hooks|../../hooks|g'
find ./pages/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|\.\./lib|../../lib|g'

echo "✅ Client import paths fixed!"