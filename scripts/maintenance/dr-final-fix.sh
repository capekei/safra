#!/bin/bash
# Final comprehensive fix for SafraReport file organization

echo "🔧 Final fix for SafraReport file organization..."

# Fix remaining imports that weren't caught
sed -i '' 's|from "\./dr-helpers"|from "../lib/helpers/dominican"|g' server/database/storage.ts

# Remove problematic lib/index.ts that references non-existent files
rm -f server/lib/index.ts

# Fix middleware admin.ts
sed -i '' 's|from "\./db"|from "../db"|g' server/middleware/admin.ts
sed -i '' 's|from "\./supabase-auth"|from "./auth"|g' server/middleware/admin.ts

# Fix remaining issues in routes/admin/routes.ts
sed -i '' 's|from "\./supabase-auth"|from "../../middleware/auth"|g' server/routes/admin/routes.ts
sed -i '' 's|from "\./utils"|from "../../utils"|g' server/routes/admin/routes.ts  
sed -i '' 's|from "\./supabase"|from "../../supabase"|g' server/routes/admin/routes.ts
sed -i '' 's|from "\./dr-helpers"|from "../../lib/helpers/dominican"|g' server/routes/admin/routes.ts

# Fix seeds
sed -i '' 's|from "\./db"|from "../db"|g' server/seeds/main.ts

# Fix migrate script
sed -i '' 's|from "\./storage"|from "./database/storage"|g' server/migrate-auth0-to-supabase.ts

# Fix main routes.ts
sed -i '' 's|import authorRoutes from "./author-routes";|import authorRoutes from "./routes/author-routes";|g' server/routes.ts

# Fix routes/index.ts to not import non-existent default export
cat > server/routes/index.ts << 'EOF'
// SafraReport Routes Index - Dominican Republic Marketplace
export { default as adminRoutes } from './admin/routes';
export { default as userRoutes } from './user/routes';
export * from './author-routes';
EOF

echo "✅ Final fixes applied"