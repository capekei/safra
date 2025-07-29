# SafraReport - Production Deployment Guide

## 🚀 Quick Production Deployment

### Prerequisites
- Node.js 18+ 
- Production database (Neon PostgreSQL recommended)
- Auth0 production account configured
- Environment variables configured

### Production Build & Deploy

```bash
# 1. Build for production
npm run prod:build

# 2. Check production readiness  
npm run prod:check

# 3. Start in production mode
npm run prod:start
```

## 🔧 Environment Configuration

### Required Environment Variables

Create `.env.production` with these variables:

```bash
NODE_ENV=production

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Session Security
SESSION_SECRET=your_super_long_random_secret_key_here

# Auth0 Production
AUTH0_DOMAIN=your-production-domain.auth0.com
AUTH0_CLIENT_ID=your_production_client_id
AUTH0_CLIENT_SECRET=your_production_client_secret
AUTH0_AUDIENCE=https://api.safrareport.com
AUTH0_ISSUER_BASE_URL=https://your-production-domain.auth0.com
AUTH0_SECRET=your_32_character_auth0_secret

# Server Configuration
PORT=4000
REPLIT_URL=https://your-production-domain.com
```

### Security Checklist

- [ ] Use strong, unique secrets for production
- [ ] Enable SSL/TLS (sslmode=require in DATABASE_URL)
- [ ] Configure Auth0 for production domain
- [ ] Verify .env files are in .gitignore
- [ ] Run `npm audit fix` to address vulnerabilities

## 🌐 Deployment Platforms

### Railway Deployment
```bash
# Railway automatically uses these scripts:
railway:build → npm run build
railway:dev → npm run dev
```

### Manual Server Deployment
```bash
# 1. Clone repository
git clone <your-repo>
cd SafraReport

# 2. Install dependencies
npm ci --production

# 3. Build application  
npm run prod:build

# 4. Configure environment variables
cp .env.production .env

# 5. Start production server
npm run prod:start
```

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "run", "prod:start"]
```

## 📊 Production Monitoring

### Health Checks
- **Server**: `GET /api/health`
- **Database**: Connection tested on startup
- **Build Output**: `dist/index.js` & `dist/public/`

### Logging
- Production logs are structured and optimized
- Console debugging disabled in production builds
- Request logging via Morgan middleware

### Performance
- Static file serving for client assets
- Gzipped assets (Vite optimization)
- Database connection pooling
- Chunked JavaScript bundles

## 🔍 Troubleshooting

### Common Issues

**Build Fails:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm ci
npm run prod:build
```

**Database Connection Error:**
- Verify DATABASE_URL format: `postgresql://user:pass@host:port/db?sslmode=require`
- Check network connectivity to database
- Ensure SSL is properly configured

**Auth0 Issues:**
- Verify production callback URLs are configured
- Check Auth0 domain matches production environment
- Ensure client ID/secret are for production application

**Static Files Not Loading:**
- Verify `dist/public/` directory exists after build
- Check file permissions on production server
- Ensure reverse proxy (if used) serves static files correctly

## 📈 Performance Optimization

### Production Features Enabled
- ✅ Console statement removal in builds
- ✅ CSS minification and optimization  
- ✅ JavaScript chunking and compression
- ✅ Asset optimization for Dominican mobile users
- ✅ Gzip compression for all assets
- ✅ Static file caching headers

### Database Optimization
- Connection pooling configured
- SSL required for security
- Prepared statements for queries
- Index optimization for Dominican location data

## 🛡️ Security Features

### CORS Configuration
- Production-ready CORS settings
- Credential support for authentication
- Method and header allowlists

### Headers Security
- Helmet middleware enabled
- CSP configured for production
- Security headers for Dominican compliance

### Authentication
- Auth0 integration with production settings
- Session security with strong secrets
- Admin access controls

---

## 🚨 Final Checklist Before Deploy

- [ ] Run `npm run prod:check` - all tests pass
- [ ] Environment variables configured in production
- [ ] Database accessible from production environment  
- [ ] Auth0 production application configured
- [ ] SSL certificates configured
- [ ] Domain DNS configured
- [ ] Monitoring/logging configured
- [ ] Backup strategy in place

---

**Need Help?** Check the logs in production mode or run the production readiness checker for detailed diagnostics.