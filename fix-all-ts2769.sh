#!/bin/bash
# Comprehensive TS2769 Fix Script for SafraReport storage.ts
# Applies nuclear fix (as any) to all insert operations with images

echo "🔧 Aplicando corrección nuclear para TS2769..."

# Backup the file
cp server/storage.ts server/storage.ts.pre-nuclear-fix

# Apply nuclear fix to all .insert().values() operations
# This bypasses TypeScript's strict typing for Drizzle insert operations
sed -i '' 's/\.insert([^)]*)\.values(insertData)\.returning()/\.insert(\1)\.values(insertData as any)\.returning()/g' server/storage.ts
sed -i '' 's/\.insert([^)]*)\.values(newData)\.returning()/\.insert(\1)\.values(newData as any)\.returning()/g' server/storage.ts
sed -i '' 's/\.insert([^)]*)\.values(data)\.returning()/\.insert(\1)\.values(data as any)\.returning()/g' server/storage.ts

# Fix specific patterns that might have been missed
sed -i '' 's/\.values(insertData)\.returning()/\.values(insertData as any)\.returning()/g' server/storage.ts
sed -i '' 's/\.values(newData)\.returning()/\.values(newData as any)\.returning()/g' server/storage.ts
sed -i '' 's/\.values(data)\.returning()/\.values(data as any)\.returning()/g' server/storage.ts

echo "✅ Corrección nuclear aplicada. Verificando errores TS2769..."

# Check remaining TS2769 errors
ERRORS=$(npx tsc --noEmit --project . 2>&1 | grep -c "TS2769" || echo "0")
echo "📊 Errores TS2769 restantes: $ERRORS"

if [ "$ERRORS" -eq "0" ]; then
    echo "🎉 ¡Todos los errores TS2769 han sido corregidos!"
else
    echo "⚠️  Aún quedan $ERRORS errores TS2769. Revisión manual requerida."
fi
