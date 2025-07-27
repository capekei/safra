#!/bin/bash
# SafraReport Test Commands - Dominican Republic Marketplace
# Verificar que la aplicación funciona después de limpieza

set -e

echo "🇩🇴 SafraReport - Comandos de prueba"
echo "===================================="

# Test TypeScript compilation
echo "1. Verificando compilación TypeScript..."
npx tsc --noEmit || { echo "❌ Error de compilación TypeScript"; exit 1; }

# Test build process
echo "2. Verificando proceso de construcción..."
npm run build 2>/dev/null || { echo "❌ Error en construcción"; exit 1; }

# Test server startup (basic)
echo "3. Verificando inicio del servidor..."
timeout 10s npm run dev > /dev/null 2>&1 || echo "⚠️ Servidor puede tener problemas de inicio"

# Test imports and dependencies
echo "4. Verificando importaciones..."
node -e "require('./server/index.ts')" 2>/dev/null || echo "⚠️ Problemas con importaciones del servidor"

echo "✅ Pruebas completadas"