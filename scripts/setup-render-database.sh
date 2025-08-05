#!/bin/bash
set -e

echo "🗄️  SafraReport Database Setup for Render"
echo "========================================"

if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is required"
    echo "💡 Set it to your Render PostgreSQL connection string"
    exit 1
fi

echo "📋 Database URL: ${DATABASE_URL:0:20}..."
echo ""

echo "🔧 Applying base schema..."
psql "$DATABASE_URL" -f migrations/0000_slim_sebastian_shaw.sql

echo "🔐 Applying authentication enhancements..."  
psql "$DATABASE_URL" -f migrations/0002_enhance_auth_schema.sql

echo "📊 Verifying tables..."
psql "$DATABASE_URL" -c "\dt"

echo ""
echo "✅ Database setup completed successfully!"
echo "🎯 Ready for SafraReport deployment"