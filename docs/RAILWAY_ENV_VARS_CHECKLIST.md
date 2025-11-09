# Railway Environment Variables Checklist

## ✅ Required Variables (Server Won't Start Without These)

Copy these to Railway Dashboard → Your Service → Variables:

```env
# Supabase (Database & Auth)
SUPABASE_URL=https://vudjijwnllgxtjpeliff.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# DeepSeek AI (Pricing Recommendations)
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here

# Dodo Payments (Credit Purchases)
DODO_PAYMENTS_API_KEY=FYvOjH2t4INibzvy.wToYMiSrH4P3-zlOrYCz_aEzXxFCrHcXnndLEyqkKnbvVsYb
DODO_WEBHOOK_SECRET=whsec_2+WDBN41Up36pUlQZg2SrMML7n9LCluM

# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://howmuchshouldiprice.com
```

## ℹ️ Optional Variables (Enhanced Features)

```env
# Geocoding Services (for travel cost calculation)
LOCATIONIQ_API_KEY=your-locationiq-key
OPENCAGE_API_KEY=your-opencage-key

# Routing Services (for travel distance)
OPENROUTESERVICE_API_KEY=your-ors-key
GRAPHHOPPER_API_KEY=your-graphhopper-key

# Currency Exchange (for premium rates)
FIXER_API_KEY=your-fixer-key

# Dodo Payments (Optional)
DODO_DISCOUNT_CODE_ID=dsc_96AppoW3xINGY23GpHNTm
```

## 🔍 How to Verify

### Step 1: Check Railway Dashboard
1. Go to [Railway Dashboard](https://railway.app)
2. Select your backend service
3. Click "Variables" tab
4. Verify ALL required variables are set

### Step 2: Check Startup Logs
After deployment, Railway logs should show:

```
🔍 ===== STARTUP VALIDATION =====

📋 Required Services:
   ✅ Configured Supabase URL
   ✅ Configured Supabase Service Role Key
   ✅ Configured DeepSeek API
   ✅ Configured Dodo Payments API
   ✅ Configured Dodo Webhook Secret

📋 Optional Services:
   ℹ️ Optional - using free tier fallbacks LocationIQ API
   ℹ️ Optional - using free tier fallbacks OpenCage API
   ...

✅ 5/5 required services configured
ℹ️  0/5 optional services configured
🚀 All required services available - server can start!
```

### Step 3: If Missing Variables
Logs will show:

```
📋 Required Services:
   ✅ Configured Supabase URL
   ❌ Missing DEEPSEEK_API_KEY  ← Problem!
   ...

❌ CRITICAL: Missing required services!
   - DeepSeek API

🛑 Server cannot start without required services.
   Please set the missing environment variables and restart.
```

**Server will exit immediately with clear error message.**

---

## 🎯 Quick Copy-Paste (Replace Values)

```env
SUPABASE_URL=https://vudjijwnllgxtjpeliff.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
DEEPSEEK_API_KEY=YOUR_DEEPSEEK_KEY
DODO_PAYMENTS_API_KEY=FYvOjH2t4INibzvy.wToYMiSrH4P3-zlOrYCz_aEzXxFCrHcXnndLEyqkKnbvVsYb
DODO_WEBHOOK_SECRET=whsec_2+WDBN41Up36pUlQZg2SrMML7n9LCluM
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://howmuchshouldiprice.com
```

---

## 📊 Variable Sources

| Variable | Where to Get It |
|----------|----------------|
| `SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → service_role (secret!) |
| `DEEPSEEK_API_KEY` | DeepSeek Dashboard → API Keys |
| `DODO_PAYMENTS_API_KEY` | Dodo Payments Dashboard → Developer → API |
| `DODO_WEBHOOK_SECRET` | Dodo Payments Dashboard → Developer → Webhooks |

---

**Last Updated:** November 9, 2025

