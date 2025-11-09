# Complete Setup Guide - 3 Simple Steps

## 🎯 **Your Current Setup:**

- ✅ Frontend: Deployed on Vercel
- ✅ Backend: Deployed on Railway  
- ✅ Scrapers: Deployed on Render at `https://pricing-s1on.onrender.com`
- ✅ Database: Supabase

**Now we need to connect everything!**

---

## 📋 **Step 1: Add Scraper URL to Railway (2 minutes)**

### **What:** Connect your backend to your scraper service

### **How:**
1. Go to [Railway Dashboard](https://railway.app)
2. Select your **backend** service
3. Click **"Variables"** tab
4. Click **"New Variable"**
5. Add:
   ```
   Name: RENDER_SCRAPER_URL
   Value: https://pricing-s1on.onrender.com
   ```
6. Click **"Add"**
7. Railway will auto-redeploy

### **Why:** Backend needs to know where your scraper service is

### **Result:**
- Backend will call scraper for real market data
- No more mock data!
- Real pricing from Fiverr, Upwork, etc.

---

## 📋 **Step 2: Activate Keep-Alive (2 minutes)**

### **What:** Keep Render scraper awake (prevents 15-min sleep)

### **How:**
1. Go to: `https://github.com/Richardson2512/Pricing/settings/secrets/actions`
2. Click **"New repository secret"**
3. Add:
   ```
   Name: RENDER_SCRAPER_URL
   Value: https://pricing-s1on.onrender.com
   ```
4. Click **"Add secret"**

### **Why:** Render free tier sleeps after 15 minutes. GitHub Actions will ping it every 10 minutes.

### **Result:**
- Scraper stays awake 24/7
- No cold starts
- Fast responses

### **Verify:**
- Go to: `https://github.com/Richardson2512/Pricing/actions`
- You should see "Keep Render Service Alive" workflow
- It runs every 10 minutes automatically

---

## 📋 **Step 3: Test Everything (5 minutes)**

### **Test 1: Check Scraper Health**
```
https://pricing-s1on.onrender.com/health
```

**Expected:**
```json
{
  "status": "healthy",
  "supabase_connected": true,
  "environment": "production"
}
```

### **Test 2: Check Backend Health**
```
https://pricewise-backend-production.up.railway.app/health
```

**Expected:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 123
}
```

### **Test 3: Check Backend Logs**
Railway Dashboard → Deployments → View Logs

**Look for:**
```
🔍 ===== STARTUP VALIDATION =====
📋 Required Services:
   ✅ Configured (all 5)
📋 Optional Services:
   ✅ Configured: https://pricing-s1on.onrender.com  ← Should see this!
✅ 5/5 required services configured
ℹ️  1/6 optional services configured
🚀 All required services available - server can start!
```

### **Test 4: Submit Questionnaire**
1. Go to: `https://www.howmuchshouldiprice.com/dashboard`
2. Click "Check Your Product Pricing"
3. Fill out questionnaire
4. Submit

**Check Railway Logs for:**
```
🔄 Calling scraper service: https://pricing-s1on.onrender.com
✅ Scraper returned 25 listings  ← Real data!
```

**If you see this, real scraping is working!** ✅

---

## 🔍 **Troubleshooting:**

### **If Backend Still Uses Mock Data:**

**Check Railway Logs:**
```
ℹ️ RENDER_SCRAPER_URL not configured, using cached/mock data
```

**Fix:** Add `RENDER_SCRAPER_URL` to Railway variables (Step 1)

### **If Scraper Service is Sleeping:**

**Check:**
```
https://pricing-s1on.onrender.com/health
```

**If slow (30-60s):** Service is waking up from sleep

**Fix:** Activate GitHub Actions keep-alive (Step 2)

### **If GitHub Actions Not Running:**

**Check:**
1. Go to: `https://github.com/Richardson2512/Pricing/actions`
2. Click "Keep Render Service Alive"
3. If disabled → Click "Enable workflow"

---

## 📊 **Data Flow After Setup:**

```
User submits questionnaire
  ↓
Backend → Render Scraper Service
  POST https://pricing-s1on.onrender.com/scrape
  ↓
Scraper runs Scrapy spiders
  - Fiverr (digital services)
  - Upwork (digital services)
  - Etsy (digital products)
  - etc.
  ↓
Scraper stores in Supabase
  ↓
Backend fetches from Supabase
  ↓
Backend → DeepSeek AI
  (Real market data + user input)
  ↓
User gets accurate pricing recommendation! ✅
```

---

## ✅ **Quick Checklist:**

- [ ] Add `RENDER_SCRAPER_URL` to Railway
- [ ] Add `RENDER_SCRAPER_URL` to GitHub Secrets
- [ ] Wait for Railway redeploy (3-4 min)
- [ ] Test scraper health endpoint
- [ ] Test backend health endpoint
- [ ] Submit test questionnaire
- [ ] Check Railway logs for real scraping
- [ ] Verify GitHub Actions workflow runs

---

## 🎉 **After Setup:**

**You'll have:**
- ✅ Real market data from Fiverr, Upwork, Etsy, etc.
- ✅ Accurate pricing recommendations
- ✅ Scraper service stays awake 24/7
- ✅ Complete end-to-end integration
- ✅ Production-ready system

**Total setup time: 5-10 minutes!**

---

**Last Updated:** November 9, 2025

