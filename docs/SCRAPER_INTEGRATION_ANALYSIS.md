# Scraper Service Integration Analysis

## 🔍 Current State

### **Architecture:**
```
Frontend → Backend (Railway) → Scraper Service (Render)
                              ↓
                         Supabase (market_listings table)
```

### **Problem:** Backend is NOT calling the scraper service!

---

## ❌ **Issues Found:**

### **Issue 1: Backend Doesn't Call Scraper API**
**Location:** `backend/src/services/marketScraper.ts:43-93`

**Current Code:**
```typescript
export async function scrapeMarketData(config: ScrapingConfig) {
  // In production, trigger Python scraping workflow:
  // Option 1: Call Python API connector  ← COMMENTED OUT!
  // Option 2: Use child_process to run scrapy spiders
  // Option 3: Use message queue (Redis/RabbitMQ)
  
  // For now, fetch from Supabase (assuming scrapers have run)
  const { data } = await supabase
    .from('market_listings')
    .select('*')
    ...
  
  // No data found, use mock data
  return generateMockData(config);  ← ALWAYS RETURNS MOCK DATA!
}
```

**Problem:**
- Backend never calls Render scraper service
- Just checks Supabase for existing data
- Falls back to mock data if nothing found
- Scraper service is deployed but unused!

---

### **Issue 2: No RENDER_SCRAPER_URL in Backend**
**Backend doesn't have:**
```typescript
const SCRAPER_URL = process.env.RENDER_SCRAPER_URL;
```

**Result:** Can't call scraper service even if we wanted to

---

### **Issue 3: Keep-Alive Script Not Running**
**Files exist:**
- ✅ `scrapers/keep-alive.js`
- ✅ `scrapers/cron-keep-alive.js`
- ✅ `.github/workflows/keep-render-alive.yml`

**Problem:**
- GitHub Actions workflow needs `RENDER_SCRAPER_URL` secret
- Local scripts need to be run manually
- No automatic keep-alive currently active

---

## ✅ **What's Working:**

1. ✅ Scraper service code exists (Python/FastAPI)
2. ✅ Scraper has health endpoint
3. ✅ Scraper has `/scrape` API endpoint
4. ✅ Scraper can store data in Supabase
5. ✅ Backend can read from Supabase

---

## 🎯 **Integration Flow (How It SHOULD Work):**

```
1. User submits questionnaire
   ↓
2. Backend receives request
   ↓
3. Backend calls Render scraper service:
   POST https://your-scrapers.onrender.com/scrape
   {
     "business_type": "digital",
     "offering_type": "service",
     "query": "ui design"
   }
   ↓
4. Scraper service:
   - Runs Scrapy spiders
   - Scrapes Fiverr, Upwork, etc.
   - Stores in Supabase market_listings table
   ↓
5. Backend fetches from Supabase
   ↓
6. Backend sends to DeepSeek for analysis
   ↓
7. User gets pricing recommendation
```

---

## 🔧 **Fixes Needed:**

### **Fix 1: Update Backend to Call Scraper Service**

Add to `backend/env.example`:
```env
RENDER_SCRAPER_URL=https://your-scrapers.onrender.com
```

Update `backend/src/services/marketScraper.ts`:
```typescript
const SCRAPER_URL = process.env.RENDER_SCRAPER_URL;

export async function scrapeMarketData(config: ScrapingConfig) {
  try {
    // Try calling scraper service if configured
    if (SCRAPER_URL) {
      const response = await fetch(`${SCRAPER_URL}/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_type: config.businessType,
          offering_type: config.offeringType,
          query: config.query,
          region: config.region,
        }),
        signal: AbortSignal.timeout(30000), // 30s timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data; // Return scraped listings
      }
    }
    
    // Fallback: Check Supabase for cached data
    // ...existing code...
    
  } catch (error) {
    console.warn('Scraper service unavailable, using cached/mock data');
    // ...fallback logic...
  }
}
```

### **Fix 2: Activate Keep-Alive**

**Option A: GitHub Actions (Recommended)**
1. Go to GitHub repo → Settings → Secrets → Actions
2. Add secret:
   - Name: `RENDER_SCRAPER_URL`
   - Value: `https://your-scrapers.onrender.com`
3. Workflow runs automatically every 10 minutes

**Option B: Local Script**
```bash
export RENDER_SCRAPER_URL="https://your-scrapers.onrender.com"
node scrapers/keep-alive.js
```

---

## 📊 **Current vs. Desired State:**

| Component | Current | Desired |
|-----------|---------|---------|
| **Scraper Service** | Deployed but unused | Called by backend |
| **Backend Integration** | Mock data only | Calls scraper API |
| **Keep-Alive** | Not running | GitHub Actions active |
| **Data Flow** | Mock → DeepSeek | Real data → DeepSeek |

---

## 🎯 **Decision Point:**

### **Option 1: Enable Real Scraping (Production)**
**Pros:**
- Real market data
- Accurate pricing
- Professional results

**Cons:**
- Scraper service must stay awake (costs or keep-alive needed)
- Slower (scraping takes time)
- More complex

**Implementation:**
- Update `marketScraper.ts` to call Render API
- Add `RENDER_SCRAPER_URL` to Railway
- Enable GitHub Actions keep-alive

---

### **Option 2: Keep Mock Data (MVP)**
**Pros:**
- Fast responses
- No external dependencies
- Free (no Render costs)
- Simple

**Cons:**
- Fake data
- Not production-ready
- Users get generic recommendations

**Current State:** This is what we're doing now

---

## ✅ **Recommendation:**

**For MVP/Testing:** Keep mock data (current state is fine)

**For Production:** Enable real scraping:
1. Add `RENDER_SCRAPER_URL` to backend env vars
2. Update `marketScraper.ts` to call scraper API
3. Enable GitHub Actions keep-alive
4. Test end-to-end flow

---

## 📝 **Action Items:**

- [ ] Decide: Real scraping or mock data?
- [ ] If real: Update `marketScraper.ts` to call Render API
- [ ] If real: Add `RENDER_SCRAPER_URL` to Railway
- [ ] If real: Enable GitHub Actions keep-alive
- [ ] Test scraper service health endpoint
- [ ] Verify Supabase `market_listings` table exists

---

**Current Status:** Scraper service is deployed but not integrated. Backend uses mock data.

**This is OK for MVP but needs integration for production!**

---

**Last Updated:** November 9, 2025

