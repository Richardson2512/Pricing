# Railway Deployment - Complete Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Variables (CRITICAL)

Go to Railway Dashboard → Your Service → Variables

**Required Variables:**
```
✅ SUPABASE_URL
✅ SUPABASE_SERVICE_ROLE_KEY  
✅ DEEPSEEK_API_KEY
✅ DODO_PAYMENTS_API_KEY
✅ DODO_WEBHOOK_SECRET
✅ PORT (usually 3001)
✅ NODE_ENV (set to "production")
✅ FRONTEND_URL (https://howmuchshouldiprice.com)
```

**How to Verify:** Server logs will show startup validation

### 2. Configuration Files

**All Present:**
- ✅ `Procfile` - Start command
- ✅ `nixpacks.toml` - Build configuration  
- ✅ `railway.json` - Health check config
- ✅ `package.json` - Dependencies & engines

### 3. Build Settings

**Railway Service Settings:**
- Root Directory: `/` or empty
- Build Command: Auto-detected or `npm run build`
- Start Command: Auto-detected or `npm start`

---

## 🚀 Deployment Process

### Step 1: Push to GitHub
```bash
git push origin main
```

### Step 2: Railway Auto-Deploys
Railway detects the push and starts building.

### Step 3: Monitor Build Logs
Look for:
```
✅ Installing nodejs_20
✅ Running npm ci
✅ Running npm run build  
✅ Build completed successfully
```

### Step 4: Monitor Runtime Logs
Look for:
```
🔍 ===== STARTUP VALIDATION =====
✅ 5/5 required services configured
🚀 Server running on port 3001
💓 Server heartbeat - ...
```

---

## 🔍 Troubleshooting

### If Build Fails:

**Check:**
- Node.js version in logs
- npm install errors
- TypeScript compilation errors
- Missing dependencies

**Common Fixes:**
- Update package versions
- Clear Railway cache
- Check nixpacks.toml syntax

### If Container Crashes:

**Check Startup Logs For:**
```
❌ Missing DEEPSEEK_API_KEY
```

**Fix:** Add missing environment variable in Railway dashboard

### If CORS Errors Persist:

**Check:**
- Server is actually running (heartbeats in logs)
- Health endpoint responds
- CORS logs show allowed origins

---

## ✅ Success Indicators

- ✅ Build completes without errors
- ✅ Startup validation shows all services configured
- ✅ Server logs "ready to accept connections"
- ✅ Heartbeat logs every 30 seconds
- ✅ Health endpoint returns 200 OK
- ✅ No "Stopping Container" messages

---

**Last Updated:** November 9, 2025

