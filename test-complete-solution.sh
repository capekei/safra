#!/bin/bash
# Complete Test Suite for SafraReport TS2769 Solution
# Validates TypeScript strict compliance, build, and lint

echo "🧪 Ejecutando suite de pruebas completa..."

echo "1. 📊 Conteo inicial de errores TS2769..."
INITIAL_ERRORS=$(npx tsc --noEmit --project . 2>&1 | grep -c "TS2769" || echo "0")
echo "   Errores iniciales: $INITIAL_ERRORS"

echo "2. 🔍 Verificación TypeScript estricta..."
npm run check || npx tsc --noEmit --project .
TS_EXIT_CODE=$?

echo "3. 🏗️  Prueba de construcción..."
npm run build
BUILD_EXIT_CODE=$?

echo "4. 📝 Verificación de linting..."
npm run lint
LINT_EXIT_CODE=$?

echo "5. 📊 Conteo final de errores TS2769..."
FINAL_ERRORS=$(npx tsc --noEmit --project . 2>&1 | grep -c "TS2769" || echo "0")
echo "   Errores finales: $FINAL_ERRORS"

echo "6. 🎯 Análisis específico de storage.ts..."
STORAGE_ERRORS=$(npx tsc --noEmit --project . 2>&1 | grep "storage.ts.*TS2769" | wc -l || echo "0")
echo "   Errores en storage.ts: $STORAGE_ERRORS"

echo ""
echo "📋 RESUMEN DE RESULTADOS:"
echo "   TypeScript: $([ $TS_EXIT_CODE -eq 0 ] && echo "✅ PASÓ" || echo "❌ FALLÓ")"
echo "   Build: $([ $BUILD_EXIT_CODE -eq 0 ] && echo "✅ PASÓ" || echo "❌ FALLÓ")"
echo "   Lint: $([ $LINT_EXIT_CODE -eq 0 ] && echo "✅ PASÓ" || echo "❌ FALLÓ")"
echo "   TS2769 Inicial → Final: $INITIAL_ERRORS → $FINAL_ERRORS"
echo "   Mejora: $((INITIAL_ERRORS - FINAL_ERRORS)) errores eliminados"

if [ "$FINAL_ERRORS" -eq "0" ]; then
    echo "🎉 ¡ÉXITO COMPLETO! Todos los errores TS2769 eliminados."
else
    echo "⚠️  Errores restantes requieren revisión manual:"
    npx tsc --noEmit --project . 2>&1 | grep "TS2769" | head -3
fi
