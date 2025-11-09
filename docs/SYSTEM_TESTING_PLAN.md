# Complete System Testing Plan

## 🎯 Objective

Test each component systematically to identify the root cause of Railway failures and ensure the entire application works end-to-end.

---

## 📋 Testing Checklist

### ✅ Phase 1: Dependencies & Versions

- [x] Remove incorrect dependencies (react-helmet-async from backend)
- [x] Specify Node.js 20+ in package.json
- [ ] Verify all package versions are compatible
- [ ] Check for security vulnerabilities
- [ ] Ensure no conflicting dependencies

### ✅ Phase 2: Local Backend Testing

- [ ] Start backend locally
- [ ] Test health endpoint (GET /health)
- [ ] Test consultations endpoint (POST /api/consultations)
- [ ] Test payments endpoint (POST /api/payments/create-checkout)
- [ ] Verify CORS headers in responses
- [ ] Check memory usage locally

### ✅ Phase 3: Railway Deployment

- [ ] Verify Railway environment variables
- [ ] Check Railway Node.js version
- [ ] Monitor build logs for errors
- [ ] Monitor runtime logs for crashes
- [ ] Check health check configuration
- [ ] Verify PORT binding (0.0.0.0)

### ✅ Phase 4: Frontend Integration

- [ ] Test frontend connects to Railway backend
- [ ] Test questionnaire submission
- [ ] Test background analysis
- [ ] Test payment flow
- [ ] Verify no localhost references

### ✅ Phase 5: Supabase Integration

- [ ] Test database connections
- [ ] Test auth flow
- [ ] Test profile creation
- [ ] Test credit updates
- [ ] Test webhook storage

### ✅ Phase 6: External Services

- [ ] Test DeepSeek API
- [ ] Test Dodo Payments API
- [ ] Test webhook verification
- [ ] Test scraper service (Render)

---

## 🔍 Root Cause Analysis

### Current Issues:

1. **Railway Container Crashes**
   - Symptom: SIGTERM immediately after start
   - Evidence: "Stopping Container" in logs
   - Possible causes:
     - Health check failing
     - Memory limit exceeded
     - Port binding issue
     - Missing environment variables

2. **CORS Errors**
   - Symptom: No 'Access-Control-Allow-Origin' header
   - Evidence: Browser console errors
   - Possible causes:
     - Backend not responding (crashed)
     - CORS middleware not working
     - Preflight requests failing

---

## 🧪 Systematic Testing

### Test 1: Backend Dependencies

**Command:**
```bash
cd backend
npm install
npm run build
```

**Expected:**
- ✅ No errors
- ✅ dist/ folder created
- ✅ All TypeScript compiled

**Status:** ✅ PASSED

---

### Test 2: Local Backend Start

**Command:**
```bash
cd backend
npm start
```

**Expected:**
```
✅ Webhook verifier initialized successfully
✅ CORS enabled for ALL ORIGINS (debug mode)
🚀 Server running on port 3001
🌍 Listening on 0.0.0.0:3001
✅ Server is ready to accept connections
💓 Server heartbeat - ...
```

**Status:** ⏳ TESTING NEEDED

**If Fails:**
- Check error message
- Check missing environment variables
- Check port 3001 is available

---

### Test 3: Health Endpoint

**Command:**
```bash
curl http://localhost:3001/health
```

**Expected:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-09T...",
  "cors": [...],
  "version": "1.0.0",
  "uptime": 123
}
```

**Status:** ⏳ TESTING NEEDED

---

### Test 4: CORS Preflight

**Command:**
```bash
curl -X OPTIONS http://localhost:3001/api/consultations \
  -H "Origin: https://www.howmuchshouldiprice.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

**Expected Headers:**
```
Access-Control-Allow-Origin: https://www.howmuchshouldiprice.com
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Credentials: true
```

**Status:** ⏳ TESTING NEEDED

---

### Test 5: Railway Environment Variables

**Required Variables:**
```env
SUPABASE_URL=https://vudjijwnllgxtjpeliff.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DEEPSEEK_API_KEY=...
DODO_PAYMENTS_API_KEY=FYvOjH2t4INibzvy...
DODO_WEBHOOK_SECRET=whsec_2+WDBN41Up36pUlQZg2SrMML7n9LCluM
FRONTEND_URL=https://howmuchshouldiprice.com
NODE_ENV=production
PORT=3001
```

**Check:**
- [ ] All variables set in Railway
- [ ] No typos in variable names
- [ ] Values are correct

---

### Test 6: Railway Health Check

**Railway Settings:**
- Health Check Path: `/health`
- Health Check Timeout: 300 seconds
- Restart Policy: ON_FAILURE
- Max Retries: 10

**Verify:**
- [ ] Settings match railway.json
- [ ] Health check enabled
- [ ] Timeout is reasonable

---

### Test 7: Memory Usage

**Check Locally:**
```bash
# Start server
npm start

# In another terminal
curl http://localhost:3001/health
# Check the response includes memory info
```

**Expected:**
- Memory < 200MB (well under Railway's 512MB limit)

**If High:**
- Optimize imports
- Remove unused dependencies
- Use lazy loading

---

### Test 8: Frontend to Backend

**Test:**
1. Start backend locally
2. Update frontend VITE_BACKEND_URL to http://localhost:3001
3. Test questionnaire submission
4. Test payment flow

**Expected:**
- ✅ No CORS errors
- ✅ Requests succeed
- ✅ Data flows correctly

---

## 🎯 Action Plan

### Step 1: Verify Local Backend Works
```bash
cd backend
npm install
npm run build
npm start
```

**Wait for:**
```
✅ Server is ready to accept connections
💓 Server heartbeat - ...
```

**Test:**
```bash
curl http://localhost:3001/health
```

### Step 2: Deploy to Railway
```bash
git push origin main
```

**Monitor Railway logs for:**
- Build success
- Container start
- Heartbeat messages
- NO "Stopping Container"

### Step 3: Test Production
```
https://pricewise-backend-production.up.railway.app/health
```

**Expected:**
- ✅ Returns JSON
- ✅ Status 200
- ✅ No errors

### Step 4: Test Frontend Integration
```
https://www.howmuchshouldiprice.com/dashboard
```

**Test:**
- Buy credits flow
- Questionnaire submission
- Background analysis

---

## 📊 Current Status

| Component | Status | Issues |
|-----------|--------|--------|
| **Backend Code** | ✅ Compiles | None |
| **Backend Local** | ⏳ Testing | Need to verify |
| **Railway Deploy** | ❌ Crashes | SIGTERM immediately |
| **CORS Config** | ✅ Simplified | Allow all origins |
| **Dependencies** | ✅ Cleaned | Removed react-helmet-async |
| **Node Version** | ✅ Specified | Node 20+ required |

---

## 🚨 Known Issues

1. **Railway Container Crashes**
   - Happens immediately after start
   - SIGTERM signal sent
   - Logs show < 5 seconds uptime

2. **CORS Errors**
   - Caused by crashed backend
   - Not a CORS configuration issue
   - Will resolve when backend stays up

---

## ✅ Next Steps

1. **Wait for Railway deployment** (commit dce6e2f)
2. **Check Railway logs** for uptime value
3. **If uptime < 10 seconds:** Health check issue
4. **If memory > 500MB:** Memory issue
5. **If neither:** Railway configuration issue

---

**Railway is deploying the cleaned dependencies now. Let's see if Node 20+ and removed dependencies help!** 🚀

---

**Last Updated:** November 9, 2025

