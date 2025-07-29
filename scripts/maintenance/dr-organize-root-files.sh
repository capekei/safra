#!/bin/bash
# SafraReport Root Files Organization - Dominican Republic Marketplace
# Organización de archivos raíz con nombres en español

set -e

echo "🇩🇴 SafraReport - Organización de archivos raíz"
echo "=============================================="

# Create organized directory structure
echo "📁 Creando estructura de directorios..."

# Documentation directories
mkdir -p docs/{deployment,guides,admin}
mkdir -p scripts/{database,deployment,maintenance,analysis}
mkdir -p config/{development,production}
mkdir -p tools/{testing,cleanup}

echo "✅ Estructura de directorios creada"

# Step 1: Organize Documentation
echo ""
echo "📖 Organizando documentación..."

# Deployment documentation
if [ -f "RAILWAY_DEPLOYMENT.md" ]; then
    mv RAILWAY_DEPLOYMENT.md docs/deployment/railway.md
fi

if [ -f "REPLIT_DEPLOYMENT_CHECKLIST.md" ]; then
    mv REPLIT_DEPLOYMENT_CHECKLIST.md docs/deployment/replit-checklist.md
fi

if [ -f "DEPLOYMENT_AUDIT.md" ]; then
    mv DEPLOYMENT_AUDIT.md docs/deployment/audit.md
fi

if [ -f "SUPABASE_MIGRATION_GUIDE.md" ]; then
    mv SUPABASE_MIGRATION_GUIDE.md docs/deployment/supabase-migration.md
fi

# Admin and guides
if [ -f "ADMIN_ACCESS_GUIDE.md" ]; then
    mv ADMIN_ACCESS_GUIDE.md docs/admin/access-guide.md
fi

if [ -f "ROUTING_GUIDE.md" ]; then
    mv ROUTING_GUIDE.md docs/guides/routing.md
fi

if [ -f "PROXY_SETUP_GUIDE.md" ]; then
    mv PROXY_SETUP_GUIDE.md docs/guides/proxy-setup.md
fi

if [ -f "LIGHTHOUSE_OPTIMIZATION_PLAN.md" ]; then
    mv LIGHTHOUSE_OPTIMIZATION_PLAN.md docs/guides/lighthouse-optimization.md
fi

# Keep core docs in root
echo "Manteniendo documentación principal en raíz: README.md, LICENSE, CLAUDE.md"

echo "✅ Documentación organizada"

# Step 2: Organize Scripts and Tools
echo ""
echo "🔧 Organizando scripts y herramientas..."

# Database scripts
if [ -f "create-admin-user.js" ]; then
    mv create-admin-user.js scripts/database/create-admin-user.js
fi

if [ -f "backup.sql" ]; then
    mv backup.sql scripts/database/backup.sql
fi

# Analysis and cleanup scripts
if [ -f "dr-cleanup-analysis.sh" ]; then
    mv dr-cleanup-analysis.sh scripts/analysis/cleanup-analysis.sh
fi

if [ -f "dr-organize-files.sh" ]; then
    mv dr-organize-files.sh scripts/analysis/organize-files.sh
fi

if [ -f "dr-safe-cleanup.sh" ]; then
    mv dr-safe-cleanup.sh scripts/maintenance/safe-cleanup.sh
fi

if [ -f "dr-test-commands.sh" ]; then
    mv dr-test-commands.sh scripts/testing/test-commands.sh
fi

if [ -f "fix-import-paths.sh" ]; then
    mv fix-import-paths.sh scripts/maintenance/fix-import-paths.sh
fi

if [ -f "fix-ts-quick.sh" ]; then
    mv fix-ts-quick.sh scripts/maintenance/fix-ts-quick.sh
fi

if [ -f "dr-final-fix.sh" ]; then
    mv dr-final-fix.sh scripts/maintenance/final-fix.sh
fi

if [ -f "test-complete-solution.sh" ]; then
    mv test-complete-solution.sh scripts/testing/complete-solution.sh
fi

if [ -f "test-ts-fixes.sh" ]; then
    mv test-ts-fixes.sh scripts/testing/ts-fixes.sh
fi

if [ -f "setup-supabase-env.sh" ]; then
    mv setup-supabase-env.sh scripts/deployment/setup-supabase-env.sh
fi

echo "✅ Scripts organizados"

# Step 3: Organize Configuration Files
echo ""
echo "⚙️ Organizando archivos de configuración..."

# Move development configs
if [ -f "railway.toml" ]; then
    mv railway.toml config/deployment/railway.toml
fi

if [ -f "railway-healthcheck.js" ]; then
    mv railway-healthcheck.js config/deployment/railway-healthcheck.js
fi

if [ -f "replit.md" ]; then
    mv replit.md config/deployment/replit.md
fi

# Development and testing files
if [ -f "QUICK_ACCESS_TEST.html" ]; then
    mv QUICK_ACCESS_TEST.html tools/testing/quick-access-test.html
fi

if [ -f "lighthouse-desktop-report.json" ]; then
    mv lighthouse-desktop-report.json tools/testing/lighthouse-desktop-report.json
fi

if [ -f "lighthouse-mobile-report.json" ]; then
    mv lighthouse-mobile-report.json tools/testing/lighthouse-mobile-report.json
fi

# Keep important config files in root
echo "Manteniendo archivos de configuración principales en raíz:"
echo "- package.json, tsconfig.json, vite.config.ts"
echo "- tailwind.config.ts, postcss.config.js, components.json"
echo "- drizzle.config.ts, middleware.ts"

echo "✅ Archivos de configuración organizados"

# Step 4: Create index files for better organization
echo ""
echo "📄 Creando archivos de índice..."

# Create docs index
cat > docs/README.md << 'EOF'
# SafraReport Documentation
## Documentación del Marketplace Dominicano

### 📋 Índice de Documentación

#### Deployment / Despliegue
- [Railway Deployment](deployment/railway.md) - Guía de despliegue en Railway
- [Replit Deployment](deployment/replit-checklist.md) - Lista de verificación para Replit
- [Supabase Migration](deployment/supabase-migration.md) - Migración de base de datos
- [Deployment Audit](deployment/audit.md) - Auditoría de despliegue

#### Guides / Guías
- [Routing Guide](guides/routing.md) - Configuración de rutas
- [Proxy Setup](guides/proxy-setup.md) - Configuración de proxy
- [Lighthouse Optimization](guides/lighthouse-optimization.md) - Optimización de rendimiento

#### Admin / Administración
- [Access Guide](admin/access-guide.md) - Guía de acceso administrativo

### 🇩🇴 Dominican Republic Specific
- Spanish-first documentation
- DOP currency formatting
- Mobile-optimized guides
- Production-ready deployment instructions
EOF

# Create scripts index
cat > scripts/README.md << 'EOF'
# SafraReport Scripts
## Scripts del Marketplace Dominicano

### 📋 Índice de Scripts

#### Database / Base de Datos
- `database/create-admin-user.js` - Crear usuario administrador
- `database/backup.sql` - Respaldo de base de datos

#### Deployment / Despliegue
- `deployment/setup-supabase-env.sh` - Configurar entorno Supabase

#### Testing / Pruebas
- `testing/test-commands.sh` - Comandos de prueba principales
- `testing/complete-solution.sh` - Prueba de solución completa
- `testing/ts-fixes.sh` - Pruebas de correcciones TypeScript

#### Maintenance / Mantenimiento
- `maintenance/safe-cleanup.sh` - Limpieza segura de archivos
- `maintenance/fix-import-paths.sh` - Corregir rutas de importación
- `maintenance/fix-ts-quick.sh` - Correcciones rápidas TypeScript
- `maintenance/final-fix.sh` - Correcciones finales

#### Analysis / Análisis
- `analysis/cleanup-analysis.sh` - Análisis de limpieza de código
- `analysis/organize-files.sh` - Organización de archivos

### 🔧 Uso
Todos los scripts incluyen mensajes en español y manejo de errores para el mercado dominicano.
EOF

# Create config index
cat > config/README.md << 'EOF'
# SafraReport Configuration
## Configuración del Marketplace Dominicano

### 📋 Archivos de Configuración

#### Deployment / Despliegue
- `deployment/railway.toml` - Configuración de Railway
- `deployment/railway-healthcheck.js` - Health check para Railway
- `deployment/replit.md` - Notas de configuración Replit

### 🇩🇴 Dominican Republic Settings
- Configuración optimizada para República Dominicana
- Variables de entorno para DOP currency
- Configuración de zona horaria EST
EOF

echo "✅ Archivos de índice creados"

# Step 5: Update any shell script permissions
echo ""
echo "🔐 Actualizando permisos de scripts..."
find scripts -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true

echo ""
echo "✅ Organización de archivos raíz completada"
echo ""
echo "📊 Nueva estructura de archivos raíz:"
echo "SafraReport/"
echo "├── docs/"
echo "│   ├── deployment/"
echo "│   ├── guides/"
echo "│   └── admin/"
echo "├── scripts/"
echo "│   ├── database/"
echo "│   ├── deployment/"
echo "│   ├── testing/"
echo "│   ├── maintenance/"
echo "│   └── analysis/"
echo "├── config/"
echo "│   └── deployment/"
echo "├── tools/"
echo "│   └── testing/"
echo "└── [archivos de configuración principales]"
echo ""
echo "🔍 Archivos mantenidos en raíz:"
echo "- README.md, LICENSE, CLAUDE.md, GEMINI.md"
echo "- package.json, tsconfig.json, vite.config.ts"
echo "- tailwind.config.ts, postcss.config.js"
echo "- drizzle.config.ts, middleware.ts, components.json"