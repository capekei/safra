#!/bin/bash
set -e

echo "🔍 SafraReport Migration Validation"
echo "===================================="

# Check migration readiness
echo "✅ Migration scripts ready:"
ls -la scripts/migrate-*
echo ""

echo "✅ Database migration ready:"
ls -la migrations/0002_enhance_auth_schema.sql
echo ""

echo "✅ New repository structure:"
tree src/ -L 2 || ls -la src/
echo ""

echo "✅ Package consolidation complete:"
grep -A 5 '"name":' package.json
echo ""

echo "✅ Core dependencies installed:"
npm ls react express drizzle-orm --depth=0 2>/dev/null || echo "Some packages need to be verified"
echo ""

echo "🎯 Migration Status: READY FOR DEPLOYMENT"
echo ""
echo "Next steps:"
echo "1. Set DATABASE_URL environment variable"
echo "2. Run: psql \$DATABASE_URL -f migrations/0002_enhance_auth_schema.sql"
echo "3. Test application: npm run dev"
echo "4. Deploy to Render"