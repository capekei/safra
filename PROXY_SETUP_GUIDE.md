# SafraReport Proxy Setup Guide

## 🚀 Quick Start

### Development Setup

1. **Vite Proxy Configuration** ✅ (Already configured)
   ```typescript
   // vite.config.ts
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:5000',
         changeOrigin: true,
         secure: false,
       },
       '/uploads': {
         target: 'http://localhost:5000',  
         changeOrigin: true,
         secure: false,
       },
     },
   }
   ```

2. **Start Development Servers**
   ```bash
   # Terminal 1: Start backend (from root directory)
   npm run dev

   # Terminal 2: Start frontend (Vite will proxy API calls)
   cd client && npm run dev
   ```

3. **Test API Connection**
   - Open browser console at `http://localhost:5173`
   - Check for successful `/api/articles` requests
   - No CORS errors should appear

### Production Deployment

#### For Vercel/Netlify Frontend + Replit Backend

1. **Set Environment Variables**
   ```bash
   # In Vercel/Netlify dashboard
   VITE_API_BASE_URL=https://your-replit-app.replit.app
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   # Deploy dist/ folder to hosting service
   ```

#### For Full Replit Deployment

1. **Use Existing Configuration** (No changes needed)
   - Backend serves frontend in production
   - API routes available at `/api/*`
   - Static files at `/uploads/*`

## 🔧 Troubleshooting

### Common Issues

#### CORS Errors in Development
**Symptoms**: `Access-Control-Allow-Origin` errors in console

**Solutions**:
1. Ensure backend is running on port 5000
2. Restart Vite dev server after proxy config changes
3. Check browser console for network tab details

**Verify**:
```bash
# Check backend is running
curl http://localhost:5000/api/articles

# Check proxy is working  
curl http://localhost:5173/api/articles
```

#### 404 Errors on API Routes
**Symptoms**: API calls return 404 in development

**Solutions**:
1. Check backend server is running
2. Verify API routes exist in `server/routes.ts`
3. Check proxy target matches backend port

**Debug**:
```typescript
// Add to vite.config.ts for debugging
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
    secure: false,
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq, req) => {
        console.log('Proxying:', req.method, req.url);
      });
      proxy.on('error', (err) => {
        console.log('Proxy error:', err);
      });
    },
  },
}
```

#### Environment Variable Issues
**Symptoms**: Wrong API URLs in production

**Solutions**:
1. Set `VITE_API_BASE_URL` in hosting platform
2. Check environment variable format
3. Rebuild after env var changes

**Verify**:
```typescript
// Add temporary logging in queryClient.ts
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Mode:', import.meta.env.MODE);
```

## 🎯 Best Practices

### Development
- ⚠️ Never hardcode API URLs in components
- ✅ Use relative URLs (`/api/articles`) in development
- ✅ Let Vite proxy handle routing to backend
- ✅ Check browser dev tools network tab for errors

### Production
- ✅ Set `VITE_API_BASE_URL` environment variable
- ✅ Use HTTPS for production API endpoints
- ✅ Test API connectivity after deployment
- ⚠️ Never commit API keys to version control

### Security
- ✅ Use `changeOrigin: true` in proxy config
- ✅ Validate API responses with TypeScript
- ✅ Handle network errors gracefully
- ⚠️ Never expose sensitive backend URLs in frontend

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Backend running on correct port (5000)
- [ ] Vite proxy configured correctly  
- [ ] No CORS errors in development
- [ ] API responses validated with TypeScript
- [ ] Environment variables documented

### Post-deployment
- [ ] `VITE_API_BASE_URL` set in hosting platform
- [ ] Frontend build successful
- [ ] API calls working in production
- [ ] No console errors on live site
- [ ] Performance monitoring enabled

## 🔍 Network Diagnostics

### Check API Connectivity
```bash
# Backend health check
curl -i http://localhost:5000/api/articles

# Frontend proxy test  
curl -i http://localhost:5173/api/articles

# Production API test
curl -i https://your-domain.com/api/articles
```

### Browser Dev Tools
1. Open Network tab
2. Filter by "Fetch/XHR"
3. Look for `/api/` requests
4. Check response status and headers
5. Verify no CORS preflight failures

### Performance Monitoring
```typescript
// Add to queryClient.ts for monitoring
if (import.meta.env.MODE === 'development') {
  console.log('🔍 API Request:', { url, method, timestamp: Date.now() });
}
```

## 📚 Additional Resources

- [Vite Proxy Documentation](https://vitejs.dev/config/server-options.html#server-proxy)
- [CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Environment Variables in Vite](https://vitejs.dev/guide/env-and-mode.html)
- [TypeScript API Validation](./client/src/lib/apiTypes.ts)