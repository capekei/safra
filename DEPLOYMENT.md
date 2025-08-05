# 🚀 SafraReport Deployment Guide

## Production Deployment (Render)

### Prerequisites
- GitHub repository connected to Render
- Domain configured (optional)

### Automatic Deployment
1. **Push to branch**: `feat/next14-neon-refactor`
2. **Render auto-detects**: `render.yaml` configuration
3. **Database provisions**: PostgreSQL automatically
4. **Health check**: Available at `/api/health`

### Manual Deployment Steps
```bash
# 1. Build the application
npm run build

# 2. Deploy to Render Dashboard
# - Connect GitHub repository
# - Select branch: feat/next14-neon-refactor
# - Auto-configuration via render.yaml

# 3. Environment variables (auto-configured)
# - DATABASE_URL (from Render PostgreSQL)
# - JWT_SECRET (auto-generated)
# - SESSION_SECRET (auto-generated)
```

### Database Setup
```bash
# Automatic via render.yaml on first deployment
# Manual setup if needed:
./scripts/setup-render-database.sh
```

### Health Check
```bash
curl https://safrareport.onrender.com/api/health
```

### Cost Analysis
- **Database**: $7/month (Render PostgreSQL)
- **Hosting**: $7/month (Render Starter)
- **Total**: $14/month (72% reduction from $50/month)

## Environment Configuration

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://...

# JWT Authentication  
JWT_SECRET=auto-generated
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
SESSION_SECRET=auto-generated
BCRYPT_ROUNDS=12

# Application URLs
FRONTEND_URL=https://safrareport.onrender.com
API_BASE_URL=https://safrareport.onrender.com/api

# Security
CORS_ORIGIN=https://safrareport.onrender.com
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Dominican Republic Settings
DEFAULT_TIMEZONE=America/Santo_Domingo
DEFAULT_CURRENCY=DOP
DEFAULT_LOCALE=es-DO
```

## Monitoring & Maintenance

### Health Monitoring
- **Endpoint**: `/api/health`
- **Database Check**: `/api/debug/db`
- **Performance**: Render dashboard metrics

### Backup Strategy
- **Database**: Automatic Render PostgreSQL backups
- **Code**: GitHub repository with all branches
- **Environment**: Template in `.env.production`

### Scaling
- **Current**: Single Render service
- **Auto-scaling**: 1-3 instances based on CPU/memory
- **Database**: Render PostgreSQL with connection pooling