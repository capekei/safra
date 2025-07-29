# SafraReport - Replit Deployment Checklist

## Pre-Deployment Setup

### 1. Replit Secrets Configuration ✅
- [ ] `DATABASE_URL` - Must include `sslmode=require`
  ```
  postgresql://user:password@host:port/database?sslmode=require
  ```
- [ ] `VITE_API_BASE_URL` - Your deployment URL
  ```
  https://your-app-name.your-replit-username.repl.co
  ```

### 2. Environment Validation ✅
- [ ] Server logs show "✅ Database connection successful"
- [ ] Server logs show "📰 Published articles count: 9"
- [ ] No SSL warnings in server startup logs

### 3. Build Verification ✅
- [ ] `npm run build` completes without critical errors
- [ ] Build output shows ~145kb for dist/index.js
- [ ] No TypeScript compilation errors

## Deployment Testing

### 1. API Endpoints Test
```bash
# Test articles endpoint
curl https://your-deployment-url.repl.co/api/articles

# Should return JSON array with 9 articles
# If returns 500/empty, check DB connection
# If CORS error, check origins configuration
```

### 2. Frontend Verification
- [ ] Homepage loads without errors
- [ ] Console shows "✅ Deploy articles loaded: 9 articles"
- [ ] No fetch errors in Network tab
- [ ] Articles render correctly in UI

### 3. Error Scenarios
- [ ] If empty: Check DATABASE_URL secret in Replit
- [ ] If 500 error: Check server console for DB connection failures
- [ ] If CORS: Verify origin configuration in server/index.ts
- [ ] If timeout: Check Replit status (status.replit.com)

## Troubleshooting Steps

### Database Issues
1. **Connection Failures**
   - Verify DATABASE_URL format with sslmode=require
   - Check Replit status for PostgreSQL outages
   - Consider migrating to Neon.tech if persistent

2. **SSL Issues** 
   - Ensure DATABASE_URL includes `?sslmode=require`
   - Update connection string in Replit Secrets

3. **Timeout Issues**
   - Check Replit system status
   - File support ticket: replit.com/support

### Frontend Issues
1. **Fetch Failures**
   - Verify VITE_API_BASE_URL matches deployment URL
   - Check browser Network tab for specific errors
   - Use debug button in article grid for environment info

2. **Caching Issues**
   - Clear browser cache completely
   - `cache: 'no-store'` is implemented in fetch calls
   - Redeploy if persistent

### Build Issues
1. **TypeScript Errors**
   - Run `npm run build` locally first
   - Fix any critical compilation errors
   - Duplicate method warnings are non-critical

## Emergency Workarounds

### 1. Database Migration to Neon
If Replit PostgreSQL is unstable:
```bash
# Install Neon packages (already included)
npm install @neondatabase/serverless drizzle-orm

# Update DATABASE_URL to Neon format
# Create account at neon.tech
```

### 2. Force Refresh Methods
- Redeploy from Replit dashboard
- Clear all browser caches
- Use incognito/private browsing mode
- Test from different device/network

### 3. Debug Information Collection
- Server console logs on startup
- Browser Network tab screenshots
- Articles API curl response
- Error messages in Spanish for users

## Success Indicators
- ✅ Server: "✅ Database connection successful"
- ✅ Server: "📰 Published articles count: 9" 
- ✅ Frontend: "✅ Deploy articles loaded: 9 articles"
- ✅ UI: All 9 articles visible on homepage
- ✅ API: curl returns 9 articles in JSON format

## Support Contacts
- Replit Support: replit.com/support
- Status Page: status.replit.com
- Community: Replit Discord/Reddit
- Database: Consider Neon.tech migration if needed