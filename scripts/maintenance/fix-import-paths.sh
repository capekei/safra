#!/bin/bash
# Fix import paths after file reorganization

echo "🔧 Fixing import paths after reorganization..."

# Fix server/database/storage.ts
sed -i '' 's|from "\./db"|from "../db"|g' server/database/storage.ts
sed -i '' 's|from "\./dr-helpers"|from "../lib/helpers/dominican"|g' server/database/storage.ts

# Fix server/middleware/admin.ts  
sed -i '' 's|from "\./db"|from "../db"|g' server/middleware/admin.ts
sed -i '' 's|from "\./supabase-auth"|from "./auth"|g' server/middleware/admin.ts

# Fix server/middleware/auth.ts
sed -i '' 's|from "\./supabase"|from "../supabase"|g' server/middleware/auth.ts

# Fix server/routes/admin/routes.ts
sed -i '' 's|from "\./db"|from "../../db"|g' server/routes/admin/routes.ts
sed -i '' 's|from "\./supabase-auth"|from "../../middleware/auth"|g' server/routes/admin/routes.ts
sed -i '' 's|from "\./admin-middleware"|from "../../middleware/admin"|g' server/routes/admin/routes.ts
sed -i '' 's|from "\./utils"|from "../../utils"|g' server/routes/admin/routes.ts
sed -i '' 's|from "\./upload"|from "../../upload"|g' server/routes/admin/routes.ts
sed -i '' 's|from "\./supabase"|from "../../supabase"|g' server/routes/admin/routes.ts
sed -i '' 's|from "\./dr-helpers"|from "../../lib/helpers/dominican"|g' server/routes/admin/routes.ts

# Fix server/routes/user/routes.ts
sed -i '' 's|from "\./storage"|from "../../database/storage"|g' server/routes/user/routes.ts
sed -i '' 's|from "\./supabase-auth"|from "../../middleware/auth"|g' server/routes/user/routes.ts

# Fix server/routes/author-routes.ts
sed -i '' 's|from "\./storage"|from "../database/storage"|g' server/routes/author-routes.ts
sed -i '' 's|from "\./supabase-auth"|from "../middleware/auth"|g' server/routes/author-routes.ts
sed -i '' 's|from "\./db"|from "../db"|g' server/routes/author-routes.ts

# Fix server/seeds files
sed -i '' 's|from "\./db"|from "../db"|g' server/seeds/admin.ts
sed -i '' 's|from "\./db"|from "../db"|g' server/seeds/main.ts

# Fix server/utils/admin-articles-fix.ts
sed -i '' 's|from "\./db"|from "../db"|g' server/utils/admin-articles-fix.ts
sed -i '' 's|from "\./admin-middleware"|from "../middleware/admin"|g' server/utils/admin-articles-fix.ts
sed -i '' 's|from "\./supabase-auth"|from "../middleware/auth"|g' server/utils/admin-articles-fix.ts
sed -i '' 's|from "\./supabase"|from "../supabase"|g' server/utils/admin-articles-fix.ts

# Fix other server files
sed -i '' 's|from "\./storage"|from "./database/storage"|g' server/auth.ts
sed -i '' 's|from "\./storage"|from "./database/storage"|g' server/migrate-auth0-to-supabase.ts
sed -i '' 's|from "\./storage"|from "./database/storage"|g' server/replit-auth.ts

# Fix import of author-routes in main routes
sed -i '' 's|import authorRoutes from "./author-routes";|import authorRoutes from "./routes/author-routes";|g' server/routes.ts

echo "✅ Import paths fixed"