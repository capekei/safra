#!/bin/bash
# SafraReport File Organization - Dominican Republic Marketplace
# Organización de archivos por características con estructura optimizada

set -e

echo "🇩🇴 SafraReport - Organización de archivos"
echo "=========================================="

# Create proper directory structure
echo "📁 Creando estructura de directorios..."

# Server-side organization
mkdir -p server/{routes/{admin,user,auth},middleware,utils,database,seeds}
mkdir -p server/lib/{validation,helpers,types}

# Client-side organization (already mostly good, but ensure completeness)
mkdir -p client/src/{components/{admin,auth,ui,layout,news,error},hooks,lib,pages/{admin,user},utils}

echo "✅ Estructura de directorios creada"

# Move server files to appropriate locations
echo ""
echo "🔄 Reorganizando archivos del servidor..."

# Move route files
if [ -f "server/admin-routes.ts" ]; then
    mv server/admin-routes.ts server/routes/admin/routes.ts || echo "⚠️ Error moviendo admin-routes.ts"
fi

if [ -f "server/user-routes.ts" ]; then
    mv server/user-routes.ts server/routes/user/routes.ts || echo "⚠️ Error moviendo user-routes.ts"
fi

if [ -f "server/author-routes.ts" ]; then
    mv server/author-routes.ts server/routes/author-routes.ts || echo "⚠️ Error moviendo author-routes.ts"
fi

# Move middleware
if [ -f "server/admin-middleware.ts" ]; then
    mv server/admin-middleware.ts server/middleware/admin.ts || echo "⚠️ Error moviendo admin-middleware.ts"
fi

if [ -f "server/supabase-auth.ts" ]; then
    mv server/supabase-auth.ts server/middleware/auth.ts || echo "⚠️ Error moviendo supabase-auth.ts"
fi

# Move utilities and helpers
if [ -f "server/dr-helpers.ts" ]; then
    mv server/dr-helpers.ts server/lib/helpers/dominican.ts || echo "⚠️ Error moviendo dr-helpers.ts"
fi

if [ -f "server/utils.ts" ]; then
    mv server/utils.ts server/lib/utils/common.ts || echo "⚠️ Error moviendo utils.ts"
fi

# Move database and storage
if [ -f "server/storage.ts" ]; then
    mv server/storage.ts server/database/storage.ts || echo "⚠️ Error moviendo storage.ts"
fi

# Move seed files
if [ -f "server/seed.ts" ]; then
    mv server/seed.ts server/seeds/main.ts || echo "⚠️ Error moviendo seed.ts"
fi

if [ -f "server/seed-admin.ts" ]; then
    mv server/seed-admin.ts server/seeds/admin.ts || echo "⚠️ Error moviendo seed-admin.ts"
fi

# Move temporary/fix files
if [ -f "server/admin-articles-fix.ts" ]; then
    mv server/admin-articles-fix.ts server/utils/admin-articles-fix.ts || echo "⚠️ Error moviendo admin-articles-fix.ts"
fi

echo "✅ Archivos del servidor reorganizados"

# Update import paths in moved files
echo ""
echo "🔧 Actualizando rutas de importación..."

# Create a simple sed-based import updater
update_imports() {
    local file="$1"
    if [ -f "$file" ]; then
        # Update relative imports for server files
        sed -i '' 's|from "\./dr-helpers"|from "../lib/helpers/dominican"|g' "$file" 2>/dev/null || true
        sed -i '' 's|from "\./utils"|from "../lib/utils/common"|g' "$file" 2>/dev/null || true
        sed -i '' 's|from "\./storage"|from "../database/storage"|g' "$file" 2>/dev/null || true
        sed -i '' 's|from "\./admin-middleware"|from "../middleware/admin"|g' "$file" 2>/dev/null || true
        sed -i '' 's|from "\./supabase-auth"|from "../middleware/auth"|g' "$file" 2>/dev/null || true
        echo "Actualizado: $file"
    fi
}

# Update imports in moved files
find server/routes -name "*.ts" -exec bash -c 'update_imports "$0"' {} \; 2>/dev/null || true
find server/middleware -name "*.ts" -exec bash -c 'update_imports "$0"' {} \; 2>/dev/null || true

echo "✅ Rutas de importación actualizadas"

# Create index files for better organization
echo ""
echo "📄 Creando archivos de índice..."

# Server routes index
cat > server/routes/index.ts << 'EOF'
// SafraReport Routes Index - Dominican Republic Marketplace
export { default as adminRoutes } from './admin/routes';
export { default as userRoutes } from './user/routes';
export { default as authorRoutes } from './author-routes';
EOF

# Server middleware index
cat > server/middleware/index.ts << 'EOF'
// SafraReport Middleware Index - Dominican Republic Marketplace
export * from './admin';
export * from './auth';
EOF

# Server lib index
cat > server/lib/index.ts << 'EOF'
// SafraReport Server Library Index - Dominican Republic Marketplace
export * from './helpers/dominican';
export * from './utils/common';
EOF

echo "✅ Archivos de índice creados"

# Clean up empty directories
echo ""
echo "🧹 Limpiando directorios vacíos..."
find server -type d -empty -delete 2>/dev/null || true

echo ""
echo "✅ Organización de archivos completada"
echo ""
echo "📊 Nueva estructura:"
echo "server/"
echo "├── routes/"
echo "│   ├── admin/"
echo "│   ├── user/"
echo "│   └── auth/"
echo "├── middleware/"
echo "├── lib/"
echo "│   ├── helpers/"
echo "│   └── utils/"
echo "├── database/"
echo "└── seeds/"
echo ""
echo "🔍 Ejecutar './dr-test-commands.sh' para verificar que todo funciona correctamente"