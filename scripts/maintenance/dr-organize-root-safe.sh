#!/bin/bash
# SafraReport Root Files Organization - Safe Version
# Organización segura de archivos raíz con verificación de existencia

set -e

echo "🇩🇴 SafraReport - Organización segura de archivos raíz"
echo "==================================================="

# Function to safely move files
safe_move() {
    local src="$1"
    local dest="$2"
    if [ -f "$src" ]; then
        echo "Moviendo: $src → $dest"
        mv "$src" "$dest"
    else
        echo "⚠️ Archivo no encontrado: $src"
    fi
}

# Create organized directory structure
echo "📁 Creando estructura de directorios..."
mkdir -p docs/{deployment,guides,admin}
mkdir -p scripts/{database,deployment,maintenance,analysis}
mkdir -p config/{deployment}
mkdir -p tools/{testing}

echo "✅ Estructura de directorios creada"

# Step 1: Organize Documentation
echo ""
echo "📖 Organizando documentación..."

safe_move "RAILWAY_DEPLOYMENT.md" "docs/deployment/railway.md"
safe_move "REPLIT_DEPLOYMENT_CHECKLIST.md" "docs/deployment/replit-checklist.md"
safe_move "DEPLOYMENT_AUDIT.md" "docs/deployment/audit.md"
safe_move "SUPABASE_MIGRATION_GUIDE.md" "docs/deployment/supabase-migration.md"
safe_move "ADMIN_ACCESS_GUIDE.md" "docs/admin/access-guide.md"
safe_move "ROUTING_GUIDE.md" "docs/guides/routing.md"
safe_move "PROXY_SETUP_GUIDE.md" "docs/guides/proxy-setup.md"
safe_move "LIGHTHOUSE_OPTIMIZATION_PLAN.md" "docs/guides/lighthouse-optimization.md"

echo "✅ Documentación organizada"

# Step 2: Organize Scripts and Tools
echo ""
echo "🔧 Organizando scripts y herramientas..."

safe_move "create-admin-user.js" "scripts/database/create-admin-user.js"
safe_move "backup.sql" "scripts/database/backup.sql"
safe_move "dr-cleanup-analysis.sh" "scripts/analysis/cleanup-analysis.sh"
safe_move "dr-organize-files.sh" "scripts/analysis/organize-files.sh"
safe_move "dr-safe-cleanup.sh" "scripts/maintenance/safe-cleanup.sh"
safe_move "dr-test-commands.sh" "scripts/testing/test-commands.sh"
safe_move "fix-import-paths.sh" "scripts/maintenance/fix-import-paths.sh"
safe_move "fix-ts-quick.sh" "scripts/maintenance/fix-ts-quick.sh"
safe_move "dr-final-fix.sh" "scripts/maintenance/final-fix.sh"
safe_move "test-complete-solution.sh" "scripts/testing/complete-solution.sh"
safe_move "test-ts-fixes.sh" "scripts/testing/ts-fixes.sh"
safe_move "setup-supabase-env.sh" "scripts/deployment/setup-supabase-env.sh"

echo "✅ Scripts organizados"

# Step 3: Organize Configuration and Testing Files
echo ""
echo "⚙️ Organizando archivos de configuración y pruebas..."

safe_move "railway.toml" "config/deployment/railway.toml"
safe_move "railway-healthcheck.js" "config/deployment/railway-healthcheck.js"
safe_move "replit.md" "config/deployment/replit.md"
safe_move "QUICK_ACCESS_TEST.html" "tools/testing/quick-access-test.html"
safe_move "lighthouse-desktop-report.json" "tools/testing/lighthouse-desktop-report.json"
safe_move "lighthouse-mobile-report.json" "tools/testing/lighthouse-mobile-report.json"

echo "✅ Archivos de configuración organizados"

# Step 4: Create documentation indices
echo ""
echo "📄 Creando documentación de índices..."

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

### 🇩🇴 Características Dominicanas
- Mensajes de error en español
- Validación de moneda DOP
- Configuración de zona horaria EST
- Respaldo automático antes de cambios
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
- Configuración de zona horaria EST (-04:00)
- Configuración de idioma español (es-DO)

### ⚙️ Archivos de Configuración Principal (Raíz)
- `package.json` - Dependencias y scripts del proyecto
- `tsconfig.json` - Configuración TypeScript
- `vite.config.ts` - Configuración del bundler Vite
- `tailwind.config.ts` - Configuración de Tailwind CSS
- `drizzle.config.ts` - Configuración de base de datos Drizzle
- `middleware.ts` - Middleware de aplicación
- `components.json` - Configuración de componentes UI
EOF

# Create tools index
cat > tools/README.md << 'EOF'
# SafraReport Tools
## Herramientas del Marketplace Dominicano

### 📋 Herramientas de Desarrollo

#### Testing / Pruebas
- `testing/quick-access-test.html` - Prueba rápida de acceso
- `testing/lighthouse-desktop-report.json` - Reporte Lighthouse desktop
- `testing/lighthouse-mobile-report.json` - Reporte Lighthouse móvil

### 🇩🇴 Optimizaciones Dominicanas
- Pruebas específicas para conexiones lentas
- Validación de rendimiento móvil
- Métricas optimizadas para el mercado dominicano
EOF

echo "✅ Archivos de índice creados"

# Step 5: Update script permissions
echo ""
echo "🔐 Actualizando permisos de scripts..."
find scripts -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true

echo ""
echo "✅ Organización de archivos raíz completada exitosamente"
echo ""
echo "📊 Nueva estructura de directorios:"
echo "SafraReport/"
echo "├── docs/"
echo "│   ├── deployment/      # Guías de despliegue"
echo "│   ├── guides/          # Guías generales"
echo "│   └── admin/           # Documentación administrativa"
echo "├── scripts/"
echo "│   ├── database/        # Scripts de base de datos"
echo "│   ├── deployment/      # Scripts de despliegue"
echo "│   ├── testing/         # Scripts de prueba"
echo "│   ├── maintenance/     # Scripts de mantenimiento"
echo "│   └── analysis/        # Scripts de análisis"
echo "├── config/"
echo "│   └── deployment/      # Configuraciones de despliegue"
echo "└── tools/"
echo "    └── testing/         # Herramientas de prueba"
echo ""
echo "🏠 Archivos mantenidos en raíz (configuración principal):"
echo "- README.md, LICENSE, CLAUDE.md, GEMINI.md"
echo "- package.json, tsconfig.json, vite.config.ts"
echo "- tailwind.config.ts, postcss.config.js, components.json"
echo "- drizzle.config.ts, middleware.ts"