# Railway CORS Error - Definitive Fix

## 🔴 The Error

```
Access to fetch at 'https://pricewise-backend-production.up.railway.app/api/consultations' 
from origin 'https://www.howmuchshouldiprice.com' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

---

## 🎯 Root Cause

The error persists because **Railway container keeps crashing** before it can serve requests properly.

**Evidence from logs:**
```
✅ CORS enabled for: [domains]
🚀 Server running on port 3001
🌍 Listening on 0.0.0.0:3001
Stopping Container  ← Container crashes!
npm error signal SIGTERM
```

---

## ✅ Fixes Applied (Latest Commit)

### **1. Simplified CORS (Debug Mode)**
```typescript
// Temporarily allow ALL origins to isolate the issue
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));
```

**Why:** If CORS errors persist, we know the issue is NOT the CORS configuration.

### **2. Added Procfile**
```
web: node dist/server.js
```

**Why:** Railway recognizes Procfiles explicitly. This ensures the correct start command.

### **3. Kept All Previous Fixes**
- ✅ Server binds to `0.0.0.0`
- ✅ Graceful shutdown handlers
- ✅ Heartbeat logging every 30s
- ✅ Health check endpoint
- ✅ Error handlers

---

## 🚀 Railway Deployment

**Status:** Deploying now (commit `7f3cbd8`)

**What to watch for in Railway logs:**

### **Success Indicators:**
```
✅ CORS enabled for ALL ORIGINS (debug mode)
🚀 Server running on port 3001
🌍 Listening on 0.0.0.0:3001
✅ Server is ready to accept connections
💓 Server heartbeat - 2025-11-08T...
💓 Server heartbeat - 2025-11-08T...
💓 Server heartbeat - 2025-11-08T...
```

✅ **If you see heartbeats continuing, the container is stable!**

### **Failure Indicators:**
```
Stopping Container  ← Still crashing
npm error signal SIGTERM
```

❌ **If you see this, the issue is deeper than CORS**

---

## 🧪 Test After Deployment (3-4 minutes)

### **Step 1: Check Health Endpoint**
```
https://pricewise-backend-production.up.railway.app/health
```

**Expected:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-08T...",
  "cors": [...],
  "version": "1.0.0"
}
```

✅ **If this works, backend is alive!**

### **Step 2: Test CORS**
```bash
curl -H "Origin: https://www.howmuchshouldiprice.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://pricewise-backend-production.up.railway.app/api/consultations
```

**Expected Response Headers:**
```
Access-Control-Allow-Origin: https://www.howmuchshouldiprice.com
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Credentials: true
```

✅ **If you see these headers, CORS is working!**

### **Step 3: Test Payment Flow**
1. Go to `https://www.howmuchshouldiprice.com/dashboard`
2. Click "Buy Credits"
3. Select 10 credits
4. Click "Purchase"

**Expected:**
- ✅ No CORS error
- ✅ Redirected to Dodo Payments

---

## 🔍 Debugging Steps

### **If CORS Errors Continue:**

1. **Check Railway Logs:**
   ```
   Railway Dashboard → Backend Service → Deployments → View Logs
   ```
   
   Look for:
   - ✅ "Server is ready to accept connections"
   - ✅ Heartbeat messages every 30s
   - ❌ "Stopping Container" (means crash)

2. **Check Railway Environment Variables:**
   ```
   DODO_PAYMENTS_API_KEY=FYvOjH2t4INibzvy...
   DODO_WEBHOOK_SECRET=whsec_2+WDBN41Up36pUlQZg2SrMML7n9LCluM
   FRONTEND_URL=https://howmuchshouldiprice.com
   NODE_ENV=production
   PORT=3001
   ```

3. **Check Railway Service Settings:**
   - Root Directory: Should be empty or `/`
   - Start Command: Should be `npm start` or auto-detected
   - Health Check: Should use `/health` endpoint

---

## 🚨 If Container Still Crashes

### **Possible Causes:**

1. **Memory Limit:** Railway free tier has 512MB limit
2. **Build Failure:** TypeScript compilation errors
3. **Missing Dependencies:** npm packages not installed
4. **Port Binding:** Not binding to correct port
5. **Health Check Failure:** Railway can't reach /health

### **Solutions:**

**Check Build Logs:**
```
Railway Dashboard → Deployments → Build Logs
```

Look for:
- ❌ TypeScript errors
- ❌ npm install failures
- ❌ Build command failures

**Check Runtime Logs:**
```
Railway Dashboard → Deployments → Runtime Logs
```

Look for:
- ❌ Uncaught exceptions
- ❌ Module not found errors
- ❌ Port binding errors

---

## 📊 Timeline

| Time | Action | Status |
|------|--------|--------|
| **Now** | Code pushed (7f3cbd8) | ✅ Done |
| **+1 min** | Railway building | ⏳ In progress |
| **+2 min** | Railway deploying | ⏳ Waiting |
| **+3 min** | Container starts | ✅ Expected |
| **+4 min** | Heartbeats logging | ✅ Expected |
| **+5 min** | CORS working | ✅ Expected |

---

## ✅ Expected Result

After Railway deploys:

1. ✅ Container stays running (no SIGTERM)
2. ✅ Health endpoint responds
3. ✅ Heartbeat logs every 30s
4. ✅ CORS allows all origins
5. ✅ Payment flow works
6. ✅ Questionnaire submission works

---

## 🔒 After Debugging

Once CORS is confirmed working, we'll restrict origins back to:
```typescript
origin: function (origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
}
```

---

## 📞 Next Steps

**Right Now:**
1. ⏳ Wait 3-4 minutes for Railway deployment
2. 🔍 Check Railway logs for heartbeats
3. 🧪 Test health endpoint
4. 🧪 Test payment flow
5. ✅ CORS should be fixed!

**If Still Failing:**
- Share Railway logs (full deployment + runtime)
- Check Railway service settings
- Verify environment variables
- Consider Railway support

---

**The fix is deployed. Railway is building now!** 🚀

---

**Last Updated:** November 8, 2025

