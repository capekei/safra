#!/bin/bash
# SafraReport Safe File Cleanup - Dominican Republic Marketplace
# Limpieza segura de archivos con respaldo completo

set -e

echo "🇩🇴 SafraReport - Limpieza segura de archivos"
echo "============================================="

# Step 1: Create comprehensive backup
echo "🔒 Paso 1: Creando respaldo completo..."
git add -A
git commit -m "Pre-cleanup: Respaldo completo antes de limpieza de archivos" || echo "⚠️ No hay cambios para confirmar"

# Create external backup
BACKUP_DIR="/tmp/safra-backup-$(date +%Y%m%d-%H%M%S)"
echo "📁 Creando respaldo externo en: $BACKUP_DIR"
cp -r . "$BACKUP_DIR"
echo "✅ Respaldo creado en: $BACKUP_DIR"

# Step 2: List files to be deleted (for review)
echo ""
echo "📋 Paso 2: Archivos identificados para eliminación:"
echo "================================================="

# Backup files that are definitely safe to remove
echo "Archivos de respaldo (.backup, .pre-nuclear-fix):"
find . -name "*.backup*" -o -name "*nuclear*" -o -name "*.pre-nuclear-fix" | grep -v node_modules | sort

echo ""
echo "Scripts de corrección temporal:"
ls -la fix-*.sh 2>/dev/null || echo "No se encontraron scripts de corrección"

echo ""
echo "Archivos en directorio backup:"
find server/backup -type f 2>/dev/null | sort || echo "No hay archivos en server/backup"

# Step 3: Safe deletion with Spanish error messages
echo ""
echo "🗑️ Paso 3: Eliminando archivos de respaldo de forma segura..."

# Function to safely delete files
safe_delete() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "Eliminando: $file"
        git rm "$file" 2>/dev/null || rm "$file" || {
            echo "❌ Error al eliminar archivo: $file"
            return 1
        }
    else
        echo "⚠️ Archivo no encontrado: $file"
    fi
}

# Delete backup files
echo "Eliminando archivos de respaldo..."
safe_delete "server/storage.ts.backup"
safe_delete "server/storage.ts.backup-complete" 
safe_delete "server/storage.ts.pre-nuclear-fix"
safe_delete "server/supabase-auth.ts.backup"
safe_delete "server/supabase-auth.ts.nuclear-backup"
safe_delete "server/user-routes.ts.backup"
safe_delete "server/user-routes.ts.nuclear-backup"

# Delete temporary fix scripts
echo "Eliminando scripts de corrección temporal..."
safe_delete "fix-all-ts2769.sh"
safe_delete "fix-ts-arrays.sh"
safe_delete "fix-ts2769-complete.sh"
safe_delete "nuclear-fix-express.sh"

# Delete backup directory contents (but keep structure)
echo "Limpiando directorio de respaldo del servidor..."
if [ -d "server/backup" ]; then
    find server/backup -type f -name "*.ts" -exec git rm {} \; 2>/dev/null || find server/backup -type f -delete
fi

# Step 4: Clean up old documentation files
echo "Eliminando documentación obsoleta..."
safe_delete "ARTICLE_SAVE_ERROR_FIXES.md"
safe_delete "TS2769-SOLUTION-SUMMARY.md"

echo ""
echo "✅ Limpieza de archivos completada"
echo ""
echo "📊 Resumen:"
echo "- Respaldo completo creado en: $BACKUP_DIR"
echo "- Archivos eliminados: archivos .backup, scripts temporales, docs obsoletos"
echo "- Estructura del proyecto mantenida intacta"
echo ""
echo "🔍 Ejecutar './dr-test-commands.sh' para verificar que todo funciona correctamente"