# SafraReport - Environment Variables for Deployment

## 🚨 Required Environment Variables

Your deployment is failing because `DATABASE_URL` is missing. Here's how to fix it:

### Railway Deployment - Quick Setup

1. **Go to your Railway project dashboard**
2. **Click on "Variables" tab**
3. **Copy/paste these exact values:**

```bash
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_oI0tCbLKq8rS@ep-small-block-adohp1p0.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
SESSION_SECRET=supersecretrandomkey64characterslong1234567890abcdefghijklmnop
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_AUDIENCE=https://api.safrareport.com
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_SECRET=randomkey32characterslong12345678
PORT=4000
```

**🚨 REQUIRED: Update AUTH0_* values with your actual Auth0 credentials**

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