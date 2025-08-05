# 🚀 SafraReport Startup Verification Guide

## Quick Health Check Commands

### 1. **Comprehensive System Health Check**
```bash
# Check all endpoints and system health
npm run health-check

# Check production deployment
npm run health-check:prod
```

### 2. **Database Verification**
```bash
# Verify database connectivity and data integrity
npm run verify-db
```

### 3. **Development Startup**
```bash
# Start development servers with health monitoring
npm run dev

# In another terminal, verify everything is working:
npm run health-check
```

## Manual Verification Steps

### 1. **Environment Setup Check**
- ✅ Node.js 20+ installed: `node --version`
- ✅ npm 10+ installed: `npm --version`
- ✅ Environment file exists: `ls -la .env*`
- ✅ Database URL configured: `echo $DATABASE_URL | head -c 50`

### 2. **Core Services Status**
- **Frontend (React + Vite)**: http://localhost:5173
- **Backend (Express + tsx)**: http://localhost:4000
- **Health Check**: http://localhost:4000/api/health
- **Database Debug**: http://localhost:4000/api/debug/db

### 3. **Key API Endpoints**
```bash
# Test core endpoints manually
curl http://localhost:4000/api/health
curl http://localhost:4000/api/articles
curl http://localhost:4000/api/categories
curl http://localhost:4000/api/provinces
```

## Production Deployment Verification

### 1. **Render Deployment Status**
- **Service URL**: https://safrareport.onrender.com
- **Health Check**: https://safrareport.onrender.com/api/health
- **Database Debug**: https://safrareport.onrender.com/api/debug/db

### 2. **Production Health Check**
```bash
# Comprehensive production test
npm run health-check:prod

# Or test specific URL
BASE_URL=https://safrareport.onrender.com npm run health-check
```

## Troubleshooting Common Issues

### 🔴 **Server Won't Start**
```bash
# Check if ports are in use
lsof -i :4000
lsof -i :5173

# Check environment variables
cat .env | grep -E "DATABASE_URL|NODE_ENV"

# Verify dependencies
npm install
npm run type-check
```

### 🔴 **Database Connection Failed**
```bash
# Run comprehensive database check
npm run verify-db

# Manual database test
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()').then(r => console.log('✅ DB OK:', r.rows[0])).catch(e => console.log('❌ DB Error:', e.message));
"
```

### 🔴 **Build Failures**
```bash
# Check TypeScript compilation
npm run type-check

# Run linting
npm run lint

# Clean build
rm -rf dist/ src/client/dist/
npm run build
```

### 🔴 **Missing Dependencies**
```bash
# Install missing Radix UI components (common issue)
npm install @radix-ui/react-slider @radix-ui/react-dialog @radix-ui/react-toast

# Verify all dependencies
npm audit
depcheck
```

## Development Workflow Verification

### 1. **Start Development**
```bash
# Terminal 1: Start all services
npm run dev

# Terminal 2: Run health check
npm run health-check

# Terminal 3: Monitor logs
tail -f dev-debug.log
```

### 2. **Code Quality Check**
```bash
# Before committing changes
npm run type-check    # TypeScript validation
npm run lint         # Code style check
npm run test         # Run test suites
npm run health-check # System health
```

### 3. **Database Operations**
```bash
# Initialize database
npm run db:push      # Apply schema changes
npm run db:seed      # Add sample data
npm run verify-db    # Verify everything works
```

## Performance Monitoring

### 1. **Response Time Benchmarks**
- **Health Check**: < 100ms
- **Articles API**: < 500ms
- **Database Queries**: < 200ms
- **Frontend Load**: < 2s

### 2. **Resource Usage**
```bash
# Monitor during development
npm run dev &
sleep 5
npm run health-check

# Check memory usage
ps aux | grep -E "(node|tsx)" | head -5
```

## Dominican Republic Specific Checks

### 1. **Localization Verification**
- ✅ 31 Dominican provinces loaded
- ✅ DOP currency support
- ✅ Spanish (es-DO) locale
- ✅ Santo Domingo timezone
- ✅ Mobile network optimization

### 2. **Content Verification**
```bash
# Check Dominican-specific data
curl http://localhost:4000/api/provinces | jq 'length'  # Should be 31
curl http://localhost:4000/api/weather | jq '.location'  # Should be "Santo Domingo"
curl http://localhost:4000/api/exchange-rates | jq '.usd.rate'  # Should be ~60 DOP
```

## Quick Start Checklist

- [ ] Environment file configured (`.env`)
- [ ] Dependencies installed (`npm install`)
- [ ] Database connection working (`npm run verify-db`)
- [ ] Development servers started (`npm run dev`)
- [ ] Health check passing (`npm run health-check`)
- [ ] All endpoints responding
- [ ] TypeScript compilation clean (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)

## Emergency Recovery

If nothing works:

```bash
# Nuclear reset (be careful!)
git stash                    # Save changes
rm -rf node_modules/         # Delete dependencies
rm -rf dist/                 # Delete build artifacts
rm -rf .next/               # Delete Next.js cache (if any)
npm cache clean --force      # Clear npm cache
npm install                  # Reinstall dependencies
npm run db:push              # Reset database schema
npm run db:seed              # Reseed data
npm run health-check         # Verify recovery
```

## Success Indicators

When SafraReport is running properly, you should see:

✅ **All health checks passing**  
✅ **Database connected with 31 provinces**  
✅ **Articles loading from API**  
✅ **Frontend accessible at localhost:5173**  
✅ **Backend responding at localhost:4000**  
✅ **Dominican Republic features working**  
✅ **No TypeScript or lint errors**

Run `npm run health-check` anytime to verify your system status!