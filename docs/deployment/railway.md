# SafraReport Railway Deployment Guide
## Dominican Marketplace App - Production Ready

### 🚀 Quick Deploy Commands

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Initialize project in SafraReport directory
cd /Users/josealvarez/Desktop/SafraReport
railway init

# 4. Set environment variables
railway variables set NODE_ENV=production
railway variables set DATABASE_URL="postgresql://neondb_owner:npg_oI0tCbLKq8rS@ep-small-block-adohp1p0.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
railway variables set SESSION_SECRET="PYsimSLGFQpsH16vOm6VcZOP2a4k4PU6IzUqaUM5aNCf3IFrwb3zPYf7IDjY7RdW2l0y9yizg3QtfwLY9tSB9w=="

# 5. Deploy to Railway
railway up
```

### 📦 Project Structure (Vite + Express)
```
SafraReport/
├── client/           # React + Vite frontend
│   ├── src/         # Spanish UI components
│   └── .env.production
├── server/          # Express API backend
├── shared/          # Shared schemas
├── package.json     # Monorepo dependencies
├── vite.config.ts   # Build configuration
└── railway.toml     # Deployment config
```

### 🔧 Environment Variables for Railway

**Required:**
- `NODE_ENV=production`
- `DATABASE_URL` (from Neon PostgreSQL)
- `SESSION_SECRET` (for user authentication)
- `PORT` (auto-provided by Railway)

**Dominican Features:**
- Spanish-first UI
- DOP currency formatting
- Province-based filtering
- Mobile-optimized layout

### 🏥 Health Checks
- Endpoint: `/api/health`
- Database connectivity test
- Article count verification

### 🔄 Rollback Strategy
```bash
# Tag current deployment
git tag -a v1.0.0 -m "SafraReport v1.0.0 - Dominican Marketplace"
git push origin v1.0.0

# Rollback if needed
railway rollback [deployment-id]
```

### 📊 Post-Deploy Verification
```bash
# Test API endpoints
curl https://your-app.railway.app/api/health
curl https://your-app.railway.app/api/articles

# Test Spanish UI
curl -I https://your-app.railway.app/
```

### 🚨 Dominican Republic Specific Features
- ✅ Spanish language interface
- ✅ DOP currency display
- ✅ 32 provinces support
- ✅ Mobile-first design
- ✅ Clasificados (classifieds)
- ✅ Reseñas (business reviews)
- ✅ Noticias (news articles)