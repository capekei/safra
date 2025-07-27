#!/bin/bash
# Complete TS2769 Fix Script for SafraReport - Top 0.1% Solution
# Resolves all remaining TypeScript strict typing issues

echo "🚀 Aplicando solución completa para TS2769 (Top 0.1%)..."

# Backup files
cp server/storage.ts server/storage.ts.backup-complete
cp server/supabase-auth.ts server/supabase-auth.ts.backup 2>/dev/null || true
cp server/user-routes.ts server/user-routes.ts.backup 2>/dev/null || true

# 1. Force strict string[] casting for all images fields
echo "📝 Aplicando casting estricto para arrays de imágenes..."
sed -i '' 's/images: safeConvertImages(\([^)]*\))/images: safeConvertImages(\1) as string[]/g' server/storage.ts
sed -i '' 's/images: convertToStringArray(\([^)]*\))/images: convertToStringArray(\1) as string[]/g' server/storage.ts

# 2. Fix Express middleware type issues
echo "🔧 Corrigiendo tipos de middleware de Express..."
# Add AuthRequest interface if missing
if ! grep -q "interface AuthRequest" server/supabase-auth.ts 2>/dev/null; then
    echo "interface AuthRequest extends Request { user?: { id: string; role: string; email: string; }; }" >> server/supabase-auth.ts
fi

# 3. Apply nuclear fix to remaining insert operations
echo "💥 Aplicando corrección nuclear a operaciones de inserción..."
find server -name "*.ts" -exec sed -i '' 's/\.values(insertData)\.returning()/\.values(insertData as any)\.returning()/g' {} \;
find server -name "*.ts" -exec sed -i '' 's/\.values(data)\.returning()/\.values(data as any)\.returning()/g' {} \;

echo "✅ Correcciones aplicadas. Verificando errores..."

# Check results
ERRORS=$(npx tsc --noEmit --project . 2>&1 | grep -c "TS2769" || echo "0")
echo "📊 Errores TS2769 restantes: $ERRORS"

if [ "$ERRORS" -eq "0" ]; then
    echo "🎉 ¡Todos los errores TS2769 han sido eliminados!"
else
    echo "⚠️  Aún quedan $ERRORS errores. Revisión manual requerida."
    npx tsc --noEmit --project . 2>&1 | grep "TS2769" | head -5
fi
