#!/bin/bash
# SafraReport Dominican Republic File Cleanup Analysis
# Spanish error messages and cautious operations for DR marketplace

set -e

echo "🇩🇴 SafraReport - Análisis de limpieza de archivos"
echo "=================================================="

# Install analysis tools
echo "📦 Instalando herramientas de análisis..."
npm install --save-dev ts-prune knip ts-unused-exports 2>/dev/null || echo "⚠️ Error al instalar herramientas de análisis"

# Check if tools are available
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npm/npx no disponible"
    exit 1
fi

echo ""
echo "🔍 Ejecutando análisis de código no utilizado..."

# Run ts-prune to find unused exports
echo "1. Analizando exportaciones no utilizadas (ts-prune):"
echo "-------------------------------------------------"
npx ts-prune --skip client/src/vite-env.d.ts 2>/dev/null || echo "⚠️ ts-prune falló - continuando"

echo ""
echo "2. Analizando dependencias no utilizadas (knip):"
echo "------------------------------------------------"
npx knip --include files,dependencies,exports 2>/dev/null || echo "⚠️ knip falló - continuando"

echo ""
echo "3. Verificando archivos de respaldo y temporales:"
echo "-----------------------------------------------"
find . -name "*.backup*" -o -name "*nuclear*" -o -name "*.old" -o -name "*-fix.ts" | grep -v node_modules | sort

echo ""
echo "4. Archivos potencialmente no utilizados:"
echo "----------------------------------------"
find server/backup -type f 2>/dev/null | sort || echo "No hay archivos de respaldo"

echo ""
echo "✅ Análisis completado. Revisar resultados antes de eliminar archivos."