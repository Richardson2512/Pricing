# 🚀 Render Deployment Guide - Scrapers

Complete guide to deploying the Python scrapers service to Render.

---

## 📋 Overview

**Service**: Pricing Scrapers API  
**Tech**: Python + FastAPI + Scrapy + Playwright  
**Platform**: Render  
**URL**: `https://your-scrapers.onrender.com`

---

## 🎯 What Gets Deployed

The scrapers service provides a REST API for:
- Triggering market data scraping on-demand
- Fetching cached market data
- Background scraping jobs
- Health checks

---

## 🚀 Quick Deploy (5 Minutes)

### 1. **Go to Render Dashboard**
Visit [https://render.com](https://render.com) and sign in

### 2. **Create New Web Service**
- Click **"New +"** → **"Web Service"**
- Connect your GitHub repository
- Select: `Richardson2512/Pricing`

### 3. **Configure Service**

**Basic Settings:**
```
Name: pricing-scrapers
Region: Oregon (US West)
Branch: main
Root Directory: scrapers
```

**Build & Deploy:**
```
Runtime: Python 3.11.9 (specified in runtime.txt)
Build Command: pip install -r requirements.txt && playwright install chromium
Start Command: python server.py
```

**⚠️ Important**: Python 3.11 is required! The `runtime.txt` file specifies this.

**Instance Type:**
```
Free (for testing)
Starter ($7/month - recommended)
```

### 4. **Add Environment Variables**

Click **"Environment"** tab and add:

| Key | Value | Required |
|-----|-------|----------|
| `SUPABASE_URL` | `https://your-project.supabase.co` | ✅ Yes |
| `SUPABASE_ANON_KEY` | `your_supabase_anon_key` | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | `your_supabase_service_role_key` | ✅ Yes |
| `PORT` | `8000` | ✅ Yes |
| `ENVIRONMENT` | `production` | ✅ Yes |
| `BACKEND_URL` | `https://your-backend.railway.app` | ⚠️ Optional |
| `FRONTEND_URL` | `https://howmuchshouldiprice.com` | ⚠️ Optional |
| `PYTHON_VERSION` | `3.11.0` | ⚠️ Optional |

### 5. **Deploy**
- Click **"Create Web Service"**
- Render will build and deploy automatically
- Wait 5-10 minutes for first deployment

---

## 🔑 Environment Variables Explained

### **Required Variables:**

#### `SUPABASE_URL`
- **What**: Your Supabase project URL
- **Where to find**: Supabase Dashboard → Settings → API
- **Example**: `https://abcdefghijklmnop.supabase.co`
- **Why needed**: To store scraped market data

#### `SUPABASE_ANON_KEY`
- **What**: Supabase anonymous/public key
- **Where to find**: Supabase Dashboard → Settings → API
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Why needed**: For basic Supabase access

#### `SUPABASE_SERVICE_ROLE_KEY`
- **What**: Supabase service role key (admin access)
- **Where to find**: Supabase Dashboard → Settings → API → Service Role Key
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Why needed**: To write scraped data to database
- **⚠️ Important**: Keep this secret! Never commit to Git

#### `PORT`
- **What**: Port number for the API server
- **Value**: `8000`
- **Why needed**: Render uses this to route traffic

#### `ENVIRONMENT`
- **What**: Deployment environment
- **Value**: `production`
- **Why needed**: Disables debug mode, optimizes performance

---

### **Optional Variables:**

#### `BACKEND_URL`
- **What**: Your Railway backend URL
- **Example**: `https://your-backend.railway.app`
- **Why needed**: For CORS configuration

#### `FRONTEND_URL`
- **What**: Your Vercel frontend URL
- **Example**: `https://howmuchshouldiprice.com`
- **Why needed**: For CORS configuration

#### `PYTHON_VERSION`
- **What**: Python version to use
- **Value**: `3.11.0`
- **Why needed**: Ensures consistent Python version

#### `DOWNLOAD_DELAY`
- **What**: Delay between scraping requests (seconds)
- **Value**: `2` (default)
- **Why needed**: Prevents rate limiting

#### `CONCURRENT_REQUESTS`
- **What**: Number of simultaneous scraping requests
- **Value**: `8` (default)
- **Why needed**: Controls scraping speed

---

## 📡 API Endpoints

Once deployed, your scraper service will have these endpoints:

### **Health Check**
```bash
GET https://your-scrapers.onrender.com/health
```

**Response:**
```json
{
  "status": "healthy",
  "supabase_connected": true,
  "environment": "production"
}
```

---

### **Scrape Market Data**
```bash
POST https://your-scrapers.onrender.com/scrape
Content-Type: application/json

{
  "business_type": "digital",
  "offering_type": "service",
  "query": "ui design",
  "region": "global",
  "use_cache": true,
  "max_age_hours": 24
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Found 47 market listings",
  "count": 47,
  "data": [
    {
      "source": "Fiverr",
      "title": "Professional UI/UX Design",
      "price": 1200.0,
      "currency": "USD",
      "rating": 4.9,
      "reviews": 234
    }
  ]
}
```

---

### **Background Scraping**
```bash
POST https://your-scrapers.onrender.com/scrape/async
Content-Type: application/json

{
  "business_type": "digital",
  "offering_type": "service",
  "query": "web development"
}
```

**Response:**
```json
{
  "status": "accepted",
  "message": "Scraping job queued in background",
  "query": "web development"
}
```

---

### **Get Cached Data**
```bash
GET https://your-scrapers.onrender.com/cache/ui%20design?business_type=digital&offering_type=service
```

---

## 🔗 Connect Backend to Scrapers

Update your Railway backend to call the Render scraper service:

### **Add Environment Variable to Backend:**
```env
SCRAPER_SERVICE_URL=https://your-scrapers.onrender.com
```

### **Update Backend Code:**

```typescript
// backend/src/services/marketScraper.ts
import axios from 'axios';

const SCRAPER_URL = process.env.SCRAPER_SERVICE_URL || 'http://localhost:8000';

export async function scrapeMarketData(config: {
  businessType: string;
  offeringType: string;
  query: string;
  useCache?: boolean;
}) {
  try {
    const response = await axios.post(`${SCRAPER_URL}/scrape`, {
      business_type: config.businessType,
      offering_type: config.offeringType,
      query: config.query,
      use_cache: config.useCache ?? true,
      max_age_hours: 24
    });
    
    return response.data.data; // Array of market listings
  } catch (error) {
    console.error('Scraping failed:', error);
    return [];
  }
}
```

---

## 🐛 Troubleshooting

### **Issue: Build Fails**

**Error**: `playwright install chromium failed`

**Solution**:
1. Check build logs in Render dashboard
2. Ensure build command includes: `playwright install chromium`
3. Try: `playwright install --with-deps chromium`

---

### **Issue: Service Crashes on Start**

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
1. Verify `requirements.txt` includes `fastapi` and `uvicorn`
2. Check build logs to ensure all packages installed
3. Redeploy service

---

### **Issue: Supabase Connection Failed**

**Error**: `supabase_connected: false`

**Solution**:
1. Verify `SUPABASE_URL` is correct
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Check Supabase project is active
4. Test connection: `curl https://your-scrapers.onrender.com/health`

---

### **Issue: CORS Errors**

**Error**: `Access-Control-Allow-Origin`

**Solution**:
1. Add `BACKEND_URL` environment variable
2. Add `FRONTEND_URL` environment variable
3. Restart service

---

### **Issue: Scraping Times Out**

**Error**: `Request timeout`

**Solution**:
1. Use `/scrape/async` endpoint for background jobs
2. Increase Render instance size (Starter plan)
3. Reduce `CONCURRENT_REQUESTS`
4. Increase `DOWNLOAD_DELAY`

---

## 💰 Pricing

### **Render Plans:**

| Plan | Price | RAM | CPU | Best For |
|------|-------|-----|-----|----------|
| **Free** | $0/month | 512 MB | 0.1 CPU | Testing only |
| **Starter** | $7/month | 512 MB | 0.5 CPU | Production (recommended) |
| **Standard** | $25/month | 2 GB | 1 CPU | High traffic |
| **Pro** | $85/month | 4 GB | 2 CPU | Enterprise |

**Recommendation**: Start with **Starter ($7/month)** for production

---

## 📊 Monitoring

### **View Logs:**
1. Go to Render Dashboard
2. Select your service
3. Click **"Logs"** tab
4. View real-time logs

### **Check Metrics:**
1. Click **"Metrics"** tab
2. View CPU, Memory, Request rate
3. Set up alerts for high usage

### **Health Checks:**
Render automatically pings `/health` endpoint every 30 seconds

---

## 🔄 Auto-Deploy

Render automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update scrapers"
git push origin main
# Render auto-deploys in ~5 minutes
```

---

## 🎯 Post-Deployment Checklist

- [ ] Service is running (green status)
- [ ] Health check returns `{"status": "healthy"}`
- [ ] Supabase connection works
- [ ] Test scraping endpoint with Postman/curl
- [ ] Backend can connect to scraper service
- [ ] Environment variables are set
- [ ] Logs show no errors
- [ ] Update backend `SCRAPER_SERVICE_URL`

---

## 🧪 Testing Your Deployment

### **1. Test Health Check:**
```bash
curl https://your-scrapers.onrender.com/health
```

Expected: `{"status": "healthy", "supabase_connected": true}`

### **2. Test Scraping:**
```bash
curl -X POST https://your-scrapers.onrender.com/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "business_type": "digital",
    "offering_type": "service",
    "query": "logo design",
    "use_cache": false
  }'
```

Expected: JSON with market listings

### **3. Test from Backend:**
```typescript
const response = await fetch('https://your-scrapers.onrender.com/scrape', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    business_type: 'digital',
    offering_type: 'service',
    query: 'web development'
  })
});
const data = await response.json();
console.log(data.count, 'listings found');
```

---

## 📝 Files Created

For Render deployment, these files were created:

```
scrapers/
├── server.py              # FastAPI server (NEW)
├── render.yaml            # Render configuration (NEW)
├── env.example            # Environment variables template (NEW)
├── requirements.txt       # Updated with FastAPI
└── api_connector.py       # Existing scraper logic
```

---

## 🎉 Success!

Once deployed, your scraper service will be live at:
```
https://your-scrapers.onrender.com
```

Test it:
```bash
curl https://your-scrapers.onrender.com/health
```

---

## 📞 Support

If you encounter issues:
1. Check Render logs
2. Verify environment variables
3. Test locally first: `cd scrapers && python server.py`
4. Check Supabase connection
5. Review [Render Docs](https://render.com/docs)

---

**Your scrapers are now deployed and ready to collect market data!** 🚀

