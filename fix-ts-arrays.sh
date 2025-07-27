#!/bin/bash
# Quick TypeScript Array Fix for SafraReport storage.ts
# Forces array-like objects to proper string[] arrays

echo "🔧 Aplicando correcciones rápidas de TypeScript..."

# Force type assertions for images arrays in insert operations
sed -i '' 's/images: convertToStringArray(data\.images)/images: convertToStringArray(data.images) as string[]/g' server/storage.ts
sed -i '' 's/images: safeConvertImages(data\.images)/images: safeConvertImages(data.images) as string[]/g' server/storage.ts

# Add explicit type casting for problematic inserts
sed -i '' 's/\.insert(insertData)/\.insert(insertData as any)/g' server/storage.ts

echo "✅ Correcciones aplicadas. Ejecuta 'npm run check' para verificar."
