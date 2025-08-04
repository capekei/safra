#!/usr/bin/env bash
set -euo pipefail

# 📝 Purpose: Database seeding with comprehensive data
# 🎯 Usage: ./scripts/db/seed.sh
# 🔧 Requirements: Node 20+, DATABASE_URL configured

echo "🌱 Seeding SafraReport database..."

# Ensure we're in project root
cd "$(dirname "$0")/../.."

# Check if DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL not found in environment"
  echo "💡 Make sure .env file is configured"
  exit 1
fi

# Run comprehensive seed script
echo "📊 Running comprehensive seed script..."
tsx server/seeds/comprehensive-seed.ts

echo "✅ Database seeded successfully!"
echo "📈 Ready for development with sample data"