# SafraReport - Production Deployment Guide

## 🚀 Current Status
SafraReport is **production-ready** with:
- ✅ Secure authentication (bcrypt + JWT + sessions)
- ✅ Type-safe backend with comprehensive tests (9/9 passing)
- ✅ Polished admin dashboard with full CRUD functionality
- ✅ Supabase integration for user management
- ✅ Modern React frontend with optimized build process

## 🌐 Deployment Options

### Option 1: Render.com (Recommended - Already Configured)

**Why Render?**
- ✅ Already configured with `render.yaml`
- ✅ Free tier available
- ✅ Automatic deployments on git push
- ✅ Built-in SSL certificates
- ✅ Good performance in Dominican Republic
- ✅ Easy environment variable management

**Quick Deploy Steps:**
1. **Connect Repository**
   ```bash
   # Push your code to GitHub if not already done
   git add .
   git commit -m "Production ready deployment"
   git push origin main
   ```

2. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Sign up/login with GitHub
   - Click "New +" → "Blueprint"
   - Select your SafraReport repository
   - Render will auto-detect `render.yaml` and configure everything

3. **Add Missing Environment Variable**
   - In Render dashboard → Environment
   - Add: `SUPABASE_SERVICE_ROLE_KEY`
   - Get value from Supabase Project Settings → API → Service Role Key

4. **Deploy!**
   - First deployment: ~3-5 minutes
   - Your app will be live at: `https://safrareport.onrender.com`

### Option 2: Railway (Alternative)

**Why Railway?**
- ✅ Simple deployment process
- ✅ Good free tier
- ✅ Automatic HTTPS
- ✅ Built-in monitoring

**Deploy Steps:**
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Deploy: `railway up`
4. Set environment variables in Railway dashboard

### Option 3: Direct Server (VPS/Dedicated)

**Why Direct Server?**
- ✅ Full control
- ✅ Better performance for high traffic
- ✅ Custom domain setup
- ✅ Cost-effective for scale

**Requirements:**
- Ubuntu 20.04+ or similar
- Node.js 20+
- PostgreSQL 14+
- Nginx (reverse proxy)
- SSL certificate (Let's Encrypt)

## 🔧 Production Optimizations

### 1. Environment Variables Checklist
```bash
# Required for all deployments
NODE_ENV=production
PORT=4000
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_secure_random_string
JWT_SECRET=your_jwt_secret

# Supabase (if using Supabase auth)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional
FRONTEND_URL=https://yourdomain.com
```

### 2. Database Setup
If using your own PostgreSQL:
```sql
-- Run the complete schema
\i server/complete-schema.sql

-- Verify tables exist
\dt

-- Check sample data
SELECT COUNT(*) FROM articles;
SELECT COUNT(*) FROM admin_users;
```

### 3. Performance Optimizations
```bash
# Enable production optimizations
export NODE_ENV=production

# Build with optimizations
npm run build

# Start with PM2 for process management (VPS only)
npm install -g pm2
pm2 start dist/index.js --name safrareport
pm2 startup
pm2 save
```

## 🔒 Security Checklist

### Pre-Deployment Security
- ✅ All secrets in environment variables (not hardcoded)
- ✅ HTTPS enforced
- ✅ Rate limiting enabled
- ✅ Input validation with Zod
- ✅ SQL injection protection (Drizzle ORM)
- ✅ XSS protection (Helmet middleware)
- ✅ CSRF protection enabled
- ✅ Secure session cookies
- ✅ Password hashing (bcrypt)

### Post-Deployment Security
- [ ] Monitor logs for suspicious activity
- [ ] Set up automated backups
- [ ] Configure monitoring/alerting
- [ ] Regular security updates

## 📊 Monitoring & Health Checks

### Health Check Endpoint
```bash
# Test your deployment
curl https://yourdomain.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-30T12:00:00.000Z",
  "database": "connected"
}
```

### Key Metrics to Monitor
- Response time (< 500ms)
- Error rate (< 1%)
- Database connections
- Memory usage
- CPU usage

## 🚨 Troubleshooting

### Common Issues

**1. Database Connection Errors**
```bash
# Check DATABASE_URL format
postgresql://username:password@host:port/database?sslmode=require

# Test connection
npm run db:push
```

**2. Build Failures**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm ci
npm run build
```

**3. Environment Variable Issues**
```bash
# Verify all required vars are set
echo $NODE_ENV
echo $DATABASE_URL
echo $SESSION_SECRET
```

**4. Supabase Auth Issues**
- Verify SUPABASE_SERVICE_ROLE_KEY is set
- Check Supabase project is active
- Confirm database schema matches

## 🎯 Post-Deployment Steps

1. **Test Core Functionality**
   - [ ] Homepage loads
   - [ ] Admin login works
   - [ ] Article creation/editing
   - [ ] User management
   - [ ] Database operations

2. **Performance Testing**
   - [ ] Load time < 3 seconds
   - [ ] Admin dashboard responsive
   - [ ] Database queries optimized

3. **Security Verification**
   - [ ] HTTPS working
   - [ ] Admin routes protected
   - [ ] Rate limiting active
   - [ ] No sensitive data exposed

## 🌟 Success Metrics

Your SafraReport deployment is successful when:
- ✅ All pages load without errors
- ✅ Admin authentication works
- ✅ CRUD operations function properly
- ✅ Database is populated with sample content
- ✅ Performance is acceptable (< 3s load time)
- ✅ Security measures are active

## 📞 Support

If you encounter issues:
1. Check the health endpoint: `/api/health`
2. Review server logs
3. Verify environment variables
4. Test database connectivity
5. Check Supabase project status

---

**SafraReport is production-ready!** 🇩🇴
Your Dominican news platform is optimized for performance, security, and scalability.
