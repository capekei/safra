# SafraReport - Environment Variables for Deployment

## 🚨 Required Environment Variables

Your deployment is failing because `DATABASE_URL` is missing. Here's how to fix it:

### Railway Deployment

1. **Go to your Railway project dashboard**
2. **Click on "Variables" tab**
3. **Add these environment variables:**

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
SESSION_SECRET=your_super_long_random_secret_key_here
AUTH0_DOMAIN=your-production-domain.auth0.com
AUTH0_CLIENT_ID=your_production_client_id
AUTH0_CLIENT_SECRET=your_production_client_secret
AUTH0_AUDIENCE=https://api.safrareport.com
AUTH0_ISSUER_BASE_URL=https://your-production-domain.auth0.com
AUTH0_SECRET=your_32_character_auth0_secret
PORT=4000
```

### Vercel Deployment

1. **Go to your Vercel project dashboard**
2. **Settings → Environment Variables**
3. **Add the same variables as above**

### Docker Deployment

```bash
docker run -e DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require" \
           -e NODE_ENV=production \
           -e SESSION_SECRET="your_secret" \
           -p 4000:4000 \
           your-app-name
```

## 🌐 Database Setup (Neon PostgreSQL)

1. **Create a Neon database** at https://neon.tech
2. **Copy the connection string** 
3. **Format should be:**
   ```
   postgresql://username:password@hostname:port/database?sslmode=require
   ```

## 🔐 Generate Secrets

**Session Secret (64+ characters):**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Auth0 Secret (32 characters):**
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## ✅ Verification

After setting environment variables, your deployment should show:
```
✅ DATABASE_URL format validated
🔐 SSL mode: Required
🌍 DB Host: your-host.neon.tech
✅ Database connection successful
```

## 🇩🇴 Dominican Marketplace Notes

- SSL required for Dominican banking compliance
- Database optimized for 3G mobile networks
- Session security for user account protection
- DOP currency calculations require stable DB connection

---

**Need Help?** Check the Railway/Vercel logs for the exact error message and verify all environment variables are set correctly.