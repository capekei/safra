#!/bin/bash
# Test TypeScript fixes for SafraReport
echo "🧪 Probando correcciones de TypeScript..."

echo "1. Verificación TypeScript..."
npm run check || npx tsc --noEmit --project .

echo "2. Prueba de construcción..."
npm run build

echo "3. Verificación de linting..."
npm run lint

echo "4. Conteo de errores TS2769..."
npx tsc --noEmit --project . 2>&1 | grep -c "TS2769" || echo "0 errores TS2769 encontrados ✅"

echo "✅ Pruebas completadas."
