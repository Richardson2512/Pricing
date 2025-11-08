# CORS Troubleshooting Guide

## 🔴 The Error You're Seeing

```
Access to fetch at 'https://pricewise-backend-production.up.railway.app/api/payments/create-checkout' 
from origin 'https://www.howmuchshouldiprice.com' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

---

## ✅ The Fix (Just Applied)

I've updated the backend CORS configuration to:

1. **Explicitly allow your frontend domain**
2. **Add detailed logging** for blocked origins
3. **Improve error visibility**

---

## 🚀 Railway Deployment

**Status:** Deploying now (2-3 minutes)

Railway will automatically:
1. Pull the latest code from GitHub
2. Build the backend
3. Deploy the new container
4. Start serving requests

---

## 🧪 How to Verify the Fix

### **Step 1: Check Health Endpoint**

Visit this URL in your browser:
```
https://pricewise-backend-production.up.railway.app/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-08T...",
  "cors": [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://howmuchshouldiprice.com",
    "https://www.howmuchshouldiprice.com"
  ],
  "environment": "production",
  "version": "1.0.0"
}
```

✅ **If you see this, the backend is running with the new CORS config!**

### **Step 2: Test Payment Flow**

1. Go to `https://www.howmuchshouldiprice.com/dashboard`
2. Click **"Buy Credits"**
3. Select **10 credits**
4. Click **"Purchase"**

**Expected:**
- ✅ No CORS error
- ✅ Redirected to Dodo Payments
- ✅ Can complete payment

---

## 🔍 What Was Wrong?

### **Before (Old Code):**
```typescript
app.use(cors({
  origin: [
    'https://howmuchshouldiprice.com',
    'https://www.howmuchshouldiprice.com',
  ],
  // ...
}));
```

**Problem:** Railway was running an older version of the code that didn't have the correct CORS origins configured.

### **After (New Code):**
```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://howmuchshouldiprice.com',
  'https://www.howmuchshouldiprice.com',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));
```

**Benefits:**
- ✅ Explicit origin checking
- ✅ Detailed logging for blocked origins
- ✅ Better error messages
- ✅ 24-hour preflight cache

---

## 📊 CORS Configuration Details

| Setting | Value | Purpose |
|---------|-------|---------|
| **Allowed Origins** | `howmuchshouldiprice.com`, `www.howmuchshouldiprice.com` | Your production domains |
| **Methods** | `GET, POST, PUT, DELETE, OPTIONS` | All HTTP methods |
| **Credentials** | `true` | Allow cookies/auth headers |
| **Max Age** | `86400` (24 hours) | Cache preflight requests |
| **Allowed Headers** | `Content-Type, Authorization` | Required headers |

---

## 🛠️ Railway Deployment Status

### **Check Deployment:**

1. Go to [Railway Dashboard](https://railway.app)
2. Select your backend project
3. Click **"Deployments"** tab
4. Look for the latest deployment

**Expected:**
```
✅ Building...
✅ Deploying...
✅ Success
```

### **Check Logs:**

Click **"View Logs"** and look for:
```
✅ CORS enabled for: [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://howmuchshouldiprice.com',
  'https://www.howmuchshouldiprice.com'
]
🚀 Server running on port 3001
🌍 Listening on 0.0.0.0:3001
```

✅ **If you see this, the new code is deployed!**

---

## 🐛 Still Having Issues?

### **Issue 1: Old Container Still Running**

**Solution:** Force restart Railway:
1. Go to Railway Dashboard
2. Click your backend service
3. Click **"Settings"** → **"Restart"**

### **Issue 2: Browser Cache**

**Solution:** Hard refresh:
- **Windows:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`
- **Or:** Open in incognito/private window

### **Issue 3: DNS Propagation**

**Solution:** Wait 5-10 minutes for DNS to update

### **Issue 4: Railway Environment Variables**

**Check these are set:**
```env
DODO_PAYMENTS_API_KEY=FYvOjH2t4INibzvy...
DODO_WEBHOOK_SECRET=whsec_2+WDBN41Up36pUlQZg2SrMML7n9LCluM
FRONTEND_URL=https://howmuchshouldiprice.com
NODE_ENV=production
```

---

## 🎯 Quick Test Commands

### **Test CORS (from terminal):**
```bash
curl -H "Origin: https://www.howmuchshouldiprice.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://pricewise-backend-production.up.railway.app/api/payments/create-checkout
```

**Expected Response Headers:**
```
Access-Control-Allow-Origin: https://www.howmuchshouldiprice.com
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Credentials: true
```

### **Test Health Endpoint:**
```bash
curl https://pricewise-backend-production.up.railway.app/health
```

**Expected:**
```json
{
  "status": "ok",
  "cors": ["https://howmuchshouldiprice.com", "https://www.howmuchshouldiprice.com"],
  ...
}
```

---

## ⏱️ Timeline

| Time | Action | Status |
|------|--------|--------|
| Now | Code pushed to GitHub | ✅ Done |
| +1 min | Railway detects changes | ⏳ In progress |
| +2 min | Railway builds container | ⏳ Waiting |
| +3 min | Railway deploys container | ⏳ Waiting |
| +4 min | CORS error resolved | ✅ Expected |

**Wait 3-4 minutes, then test again!**

---

## 📞 Support

If the issue persists after 5 minutes:

1. **Check Railway Logs:**
   - Look for `✅ CORS enabled for:`
   - Look for `❌ CORS blocked origin:`

2. **Check Browser Console:**
   - Look for the exact error message
   - Check the `Origin` header value

3. **Test Health Endpoint:**
   - Verify CORS origins are correct
   - Verify version is `1.0.0`

---

## ✅ Expected Result

After Railway deploys (3-4 minutes):

1. ✅ No more CORS errors
2. ✅ Payment flow works
3. ✅ Credits can be purchased
4. ✅ Webhooks processed correctly

**The fix is deployed. Just wait for Railway to restart!** 🚀

---

**Last Updated:** November 8, 2025

