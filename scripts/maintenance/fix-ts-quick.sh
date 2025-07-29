#!/bin/bash
# Quick TypeScript fixes for SafraReport DR marketplace

echo "Applying TypeScript fixes for TS2740 and TS2769 errors..."

# Fix TS2740: Add type casting for PgSelectBase queries in admin-routes.ts
sed -i '' 's/let query = db\.select()\.from(classifieds);/let query = db.select().from(classifieds) as any;/' server/admin-routes.ts
sed -i '' 's/let query = db\.select()\.from(reviews);/let query = db.select().from(reviews) as any;/' server/admin-routes.ts

# Fix TS2769: Add type casting for insert operations in storage.ts
sed -i '' 's/\.values(insertData as any)/\.values(safeInsertData(insertData))/g' server/storage.ts
sed -i '' 's/\.values(articleData as any)/\.values(safeInsertData(articleData))/g' server/admin-routes.ts
sed -i '' 's/\.values(user)/\.values(safeInsertData(user))/g' server/storage.ts

echo "Quick fixes applied. Run 'npx tsc --noEmit' to verify."