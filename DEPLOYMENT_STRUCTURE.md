# 🚀 Deployment Structure Guide

This project is configured for **separate deployments** of each service.

---

## 📁 Project Structure

```
project/
├── frontend/          ← Deploy to Vercel
├── backend/           ← Deploy to Railway  
├── scrapers/          ← Deploy to Render
├── supabase/          ← Migrations only
└── docs/              ← Documentation
```

---

## 🎯 Deployment Configuration

### **1. Frontend → Vercel**

**Repository**: Main repo (Richardson2512/Pricing)  
**Root Directory**: `frontend`  
**Configuration**: `frontend/vercel.json`

**Vercel Settings:**
```
Framework: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Root Directory: frontend
```

**Environment Variables:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_BACKEND_URL=https://your-backend.railway.app
```

**Deploy:**
```bash
# Via Vercel Dashboard
1. Import GitHub repo: Richardson2512/Pricing
2. Set Root Directory: frontend
3. Add environment variables
4. Deploy
```

---

### **2. Backend → Railway**

**Repository**: Separate repo (Richardson2512/Pricewise-backend) ✅  
**Configuration**: `backend/package.json`

**Railway Settings:**
```
Build Command: npm run build
Start Command: npm start
```

**Environment Variables:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DEEPSEEK_API_KEY=sk-your-key
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://howmuchshouldiprice.com
SCRAPER_SERVICE_URL=https://your-scrapers.onrender.com
```

**Deploy:**
```bash
# Via Railway Dashboard
1. New Project → Deploy from GitHub
2. Select: Richardson2512/Pricewise-backend
3. Add environment variables
4. Deploy
```

---

### **3. Scrapers → Render**

**Repository**: Main repo (Richardson2512/Pricing)  
**Root Directory**: `scrapers`  
**Configuration**: `scrapers/render.yaml` + `scrapers/runtime.txt`

**Render Settings:**
```
Runtime: Python 3.11.9 (from runtime.txt)
Build Command: pip install -r requirements.txt && playwright install chromium
Start Command: python server.py
Root Directory: scrapers
```

**Environment Variables:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=8000
ENVIRONMENT=production
BACKEND_URL=https://your-backend.railway.app
FRONTEND_URL=https://howmuchshouldiprice.com
```

**Deploy:**
```bash
# Via Render Dashboard
1. New Web Service → Connect GitHub
2. Select: Richardson2512/Pricing
3. Set Root Directory: scrapers
4. Add environment variables
5. Deploy
```

---

## ✅ Current Configuration Status

### **Frontend Folder** ✅
```
frontend/
├── vercel.json           ✅ Configured for Vercel
├── .vercelignore         ✅ Optimized build
├── package.json          ✅ Build scripts ready
├── vite.config.ts        ✅ Vite configuration
├── env.example           ✅ Environment template
└── src/                  ✅ All source files
```

### **Backend Folder** ✅
```
backend/
├── vercel.json           ✅ Optional (for Vercel deployment)
├── package.json          ✅ Build scripts ready
├── tsconfig.json         ✅ TypeScript config
├── env.example           ✅ Environment template
└── src/                  ✅ All source files
    ├── server.ts         ✅ Express server
    ├── routes/           ✅ API routes
    └── services/         ✅ Business logic
```

### **Scrapers Folder** ✅
```
scrapers/
├── render.yaml           ✅ Render configuration
├── runtime.txt           ✅ Python 3.11.9
├── server.py             ✅ FastAPI server
├── requirements.txt      ✅ Python dependencies
├── env.example           ✅ Environment template
└── pricing_scrapers/     ✅ Scrapy spiders
```

---

## 🔗 Service URLs After Deployment

| Service | Platform | URL |
|---------|----------|-----|
| **Frontend** | Vercel | `https://howmuchshouldiprice.com` |
| **Backend** | Railway | `https://your-backend.railway.app` |
| **Scrapers** | Render | `https://your-scrapers.onrender.com` |
| **Database** | Supabase | `https://your-project.supabase.co` |

---

## 🔄 How They Connect

```
User Browser
    ↓
Frontend (Vercel)
    ↓ API calls to VITE_BACKEND_URL
Backend (Railway)
    ↓ Scraping requests to SCRAPER_SERVICE_URL
Scrapers (Render)
    ↓ Store data
Supabase (Database)
```

---

## 📋 Deployment Checklist

### **Before Deploying:**
- [ ] All environment variables documented
- [ ] Each folder has proper config files
- [ ] Dependencies are up to date
- [ ] Supabase migrations run

### **Deploy Order:**
1. ✅ **Supabase** - Run migrations first
2. ✅ **Backend** - Deploy to Railway
3. ✅ **Scrapers** - Deploy to Render
4. ✅ **Frontend** - Deploy to Vercel (last, so it has backend URLs)

### **After Deploying:**
- [ ] Update frontend `VITE_BACKEND_URL` with Railway URL
- [ ] Update backend `SCRAPER_SERVICE_URL` with Render URL
- [ ] Update backend `FRONTEND_URL` with Vercel URL
- [ ] Test all services
- [ ] Verify CORS is working

---

## 🎯 Quick Deploy Commands

### **Frontend (Vercel):**
```bash
# Via Dashboard - Import repo, set root to "frontend"
# Or via CLI:
cd frontend
vercel --prod
```

### **Backend (Railway):**
```bash
# Via Dashboard - Import Pricewise-backend repo
# Or via CLI:
cd backend
railway init
railway up
```

### **Scrapers (Render):**
```bash
# Via Dashboard - Import repo, set root to "scrapers"
# Manual deploy only (no CLI needed)
```

---

## 📚 Documentation

- **Frontend**: `frontend/README.md`
- **Backend**: `backend/README.md`
- **Scrapers**: `scrapers/README.md`
- **Deployment Guides**: `docs/` folder
  - `VERCEL_DEPLOYMENT.md`
  - `RENDER_DEPLOYMENT.md`
  - `QUICK_DEPLOY.md`

---

## ✅ Everything is Configured!

Each folder is **self-contained** and **deployment-ready**:
- ✅ Frontend has `vercel.json`
- ✅ Backend has Railway-compatible setup
- ✅ Scrapers has `render.yaml` + `runtime.txt`
- ✅ All have `env.example` files
- ✅ All have proper `.gitignore` files

**Just deploy each folder to its respective platform!** 🚀

