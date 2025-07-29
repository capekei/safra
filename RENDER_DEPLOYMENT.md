# SafraReport - Render.com Deployment Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Connect to Render
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Click "New +" → "Blueprint"
4. Connect your SafraReport repository

### Step 2: Render Auto-Configuration
Render will detect the `render.yaml` file and automatically:
- ✅ Configure Node.js web service  
- ✅ Set up build/start commands
- ✅ Connect to your Supabase database
- ✅ Generate secure secrets

### Step 3: Supabase Authentication Setup
✅ **Basic authentication configured!** Your Supabase credentials are in `render.yaml`:

```bash
VITE_SUPABASE_URL=https://qolgaptebconzwwgjagm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Manual Step Required:** Add your Supabase Service Role Key:
1. Go to your Render dashboard → Environment
2. Add environment variable: `SUPABASE_SERVICE_ROLE_KEY`
3. Get the key from your Supabase project settings → API → Service Role

### Step 4: Deploy
- Render automatically deploys on every git push
- First deployment takes ~3-5 minutes
- Subsequent deploys: ~1-2 minutes

## 🌐 Your App URLs
- **Web Service**: `https://safrareport.onrender.com`
- **Database**: Supabase PostgreSQL (shared auth + data)
- **Health Check**: `https://safrareport.onrender.com/api/health`

## 🇩🇴 Dominican Marketplace Optimized
✅ Global CDN (fast in Dominican Republic)  
✅ Free SSL certificate  
✅ Auto-scaling for traffic spikes  
✅ Built-in monitoring  
✅ PostgreSQL with backups  

## 🔧 Management
- **Logs**: Real-time in Render dashboard
- **Database**: Built-in pgAdmin interface
- **Scaling**: Automatic on paid plans
- **Custom Domain**: Easy setup in settings

## 💡 Why Render is Perfect for SafraReport
- **Zero DevOps**: No Docker, no infrastructure management
- **Git-based**: Deploy with `git push`
- **Free Tier**: PostgreSQL + Web service included
- **Dominican-friendly**: Global CDN, reliable uptime
- **Supabase Ready**: Environment variables auto-configured

---

**Next**: Push your code and let Render handle the rest! 🎉