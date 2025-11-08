# 📁 Project Folder Structure

Complete guide to the organized, deployment-ready folder structure.

---

## 🏗️ Overview

This project uses a **monorepo structure** where each service is **self-contained** and can be deployed independently.

```
project/
├── frontend/          # React app (deploy to Vercel)
├── backend/           # Express API (deploy to Railway)
├── scrapers/          # Python scrapers (deploy to Lambda)
├── supabase/          # Database migrations
├── docs/              # All documentation
└── README.md          # Main project overview
```

---

## 📱 Frontend Folder

**Path**: `frontend/`  
**Purpose**: User-facing web application  
**Deploy**: Vercel  
**URL**: https://howmuchshouldiprice.com

### Structure:
```
frontend/
├── public/
│   ├── robots.txt           # SEO: Search engine directives
│   └── sitemap.xml          # SEO: Site structure
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Dashboard.tsx
│   │   ├── SEO.tsx
│   │   └── ...
│   ├── pages/               # Route pages
│   │   ├── Landing.tsx
│   │   ├── Pricing.tsx
│   │   ├── SignIn.tsx
│   │   └── ...
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/                 # Utilities
│   │   └── supabase.ts
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── .vercelignore            # Files to ignore in deployment
├── env.example              # Environment variables template
├── index.html               # HTML entry point
├── package.json             # Dependencies & scripts
├── tailwind.config.js       # Tailwind CSS config
├── tsconfig.json            # TypeScript config
├── vercel.json              # Vercel deployment config
├── vite.config.ts           # Vite build config
└── README.md                # Frontend documentation
```

### Key Files:
- **`vercel.json`**: Vercel deployment configuration
- **`env.example`**: Template for environment variables
- **`vite.config.ts`**: Build optimization settings
- **`tailwind.config.js`**: Olive green & beige theme

### Deployment:
```bash
cd frontend
vercel --prod
```

**Vercel Settings:**
- Root Directory: `frontend`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

---

## 🔧 Backend Folder

**Path**: `backend/`  
**Purpose**: REST API & business logic  
**Deploy**: Railway  
**URL**: https://your-backend.railway.app

### Structure:
```
backend/
├── src/
│   ├── config/              # Configuration
│   │   └── supabase.ts
│   ├── middleware/          # Express middleware
│   │   └── auth.ts
│   ├── routes/              # API routes
│   │   ├── consultations.ts
│   │   └── credits.ts
│   ├── services/            # Business logic
│   │   ├── deepseek.ts      # AI integration
│   │   ├── marketScraper.ts # Scraping trigger
│   │   ├── documentParser.ts
│   │   ├── travelCostCalculator.ts
│   │   ├── currencyConverter.ts
│   │   ├── fuelPriceService.ts
│   │   └── rateLimitTracker.ts
│   └── server.ts            # Express app entry
├── env.example              # Environment variables template
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript config
├── vercel.json              # Vercel config (optional)
└── README.md                # Backend documentation
```

### Key Files:
- **`server.ts`**: Express server with CORS, routes, middleware
- **`services/deepseek.ts`**: DeepSeek V3 AI integration
- **`services/marketScraper.ts`**: Triggers Python scrapers
- **`env.example`**: Required environment variables

### Deployment:
```bash
cd backend
railway up
```

**Railway Settings:**
- Root Directory: `backend`
- Build Command: `npm run build`
- Start Command: `npm start`

---

## 🕷️ Scrapers Folder

**Path**: `scrapers/`  
**Purpose**: Market data collection  
**Deploy**: AWS Lambda / Separate Service  

### Structure:
```
scrapers/
├── pricing_scrapers/
│   ├── spiders/             # Scrapy spiders
│   │   ├── fiverr_spider.py
│   │   ├── upwork_spider.py
│   │   ├── etsy_spider.py
│   │   ├── appsumo_spider.py
│   │   ├── producthunt_spider.py
│   │   ├── freelancer_spider.py
│   │   └── indiamart_spider.py
│   ├── items.py             # Data models
│   ├── pipelines.py         # Data processing
│   ├── middlewares.py       # Request/response handling
│   └── settings.py          # Scrapy configuration
├── workflows/
│   └── scraping_flow.py     # Prefect orchestration
├── api_connector.py         # Backend integration
├── requirements.txt         # Python dependencies
├── scrapy.cfg               # Scrapy project config
└── README.md                # Scrapers documentation
```

### Key Files:
- **`spiders/`**: Individual platform scrapers
- **`workflows/scraping_flow.py`**: Orchestration logic
- **`requirements.txt`**: Python packages

### Usage:
```bash
cd scrapers
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
scrapy crawl fiverr -a query="design"
```

---

## 🗄️ Supabase Folder

**Path**: `supabase/`  
**Purpose**: Database schema & migrations  
**Deploy**: Supabase Dashboard  

### Structure:
```
supabase/
└── migrations/
    ├── 00_master_schema.sql                      # Complete schema
    ├── 20251107172549_create_pricing_platform_schema.sql
    ├── 20251108_add_name_to_profiles.sql
    └── 20251108_create_market_listings_table.sql
```

### Key Files:
- **`00_master_schema.sql`**: Complete database schema with all tables, indexes, RLS policies

### Deployment:
1. Copy SQL from migration files
2. Run in Supabase SQL Editor
3. Or use Supabase CLI: `supabase db push`

---

## 📚 Docs Folder

**Path**: `docs/`  
**Purpose**: All project documentation  

### Structure:
```
docs/
├── ARCHITECTURE.md                              # System design
├── ANTHROPOLOGICAL_QUESTIONNAIRE_SPEC.md        # 70+ questions spec
├── DATA_FLOW_VERIFICATION.md                    # Frontend to backend flow
├── DEPLOYMENT.md                                # General deployment
├── DOMAIN_CONFIGURATION.md                      # Custom domain setup
├── DUAL_INTAKE_SYSTEM.md                        # Questionnaire + upload
├── FALLBACK_SYSTEMS.md                          # API fallback chains
├── FOLDER_STRUCTURE.md                          # This file
├── PROJECT_SUMMARY.md                           # Complete overview
├── QUESTIONNAIRE_STRUCTURE.md                   # Question flow
├── QUICK_DEPLOY.md                              # 10-minute guide
├── SEO_GUIDE.md                                 # SEO strategy
├── SUPABASE_SETUP.md                            # Database setup
└── VERCEL_DEPLOYMENT.md                         # Vercel guide
```

---

## 🎯 Self-Contained Design

Each folder is **completely independent**:

### ✅ Frontend
- Has its own `package.json`
- Has its own `vercel.json`
- Can be cloned and deployed alone
- No dependencies on root

### ✅ Backend
- Has its own `package.json`
- Has its own `vercel.json` (optional)
- Can be cloned and deployed alone
- No dependencies on root

### ✅ Scrapers
- Has its own `requirements.txt`
- Has its own `scrapy.cfg`
- Can be cloned and deployed alone
- No dependencies on root

---

## 🚀 Deployment Workflow

### 1. Deploy Frontend to Vercel

**Option A: Via Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repo
3. **Set Root Directory**: `frontend`
4. Framework: Vite (auto-detected)
5. Deploy

**Option B: Via CLI**
```bash
cd frontend
vercel --prod
```

---

### 2. Deploy Backend to Railway

**Option A: Via Dashboard**
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. **Set Root Directory**: `backend`
4. Add environment variables
5. Deploy

**Option B: Via CLI**
```bash
cd backend
railway init
railway up
```

---

### 3. Deploy Scrapers (Optional)

**Option A: AWS Lambda**
```bash
cd scrapers
# Package and deploy
```

**Option B: Separate Server**
```bash
cd scrapers
python workflows/scraping_flow.py
```

---

## 📦 Benefits of This Structure

### ✅ **Independent Deployment**
Each service deploys separately without affecting others.

### ✅ **Clean Separation**
Frontend, backend, and scrapers are completely isolated.

### ✅ **Easy Scaling**
Scale each service independently based on load.

### ✅ **Simple Onboarding**
New developers can focus on one folder at a time.

### ✅ **Version Control**
Each service can have its own versioning if needed.

### ✅ **Deployment Flexibility**
- Frontend: Vercel, Netlify, or any static host
- Backend: Railway, Render, Heroku, or any Node.js host
- Scrapers: Lambda, separate server, or Docker

---

## 🔄 Migration from Old Structure

**Old Structure (Mixed):**
```
project/
├── vercel.json          # Root config
├── .vercelignore        # Root ignore
├── ARCHITECTURE.md      # Mixed with code
├── frontend/
├── backend/
└── scrapers/
```

**New Structure (Clean):**
```
project/
├── frontend/
│   ├── vercel.json      # Frontend config
│   └── .vercelignore    # Frontend ignore
├── backend/
│   └── vercel.json      # Backend config (optional)
├── scrapers/
├── docs/
│   └── ARCHITECTURE.md  # All docs here
└── README.md            # Main overview
```

---

## 📝 Best Practices

### ✅ **Keep Folders Self-Contained**
- Each folder should have its own `README.md`
- Each folder should have its own `env.example`
- Each folder should have its own deployment config

### ✅ **Use Relative Paths**
- Frontend references backend via environment variable
- Backend references Supabase via environment variable
- No hardcoded absolute paths

### ✅ **Document Everything**
- Each folder has a README
- All guides in `docs/`
- Clear deployment instructions

### ✅ **Version Control**
- `.gitignore` in each folder
- Ignore `node_modules`, `.env`, `dist`
- Commit `env.example` files

---

## 🎉 Summary

This structure provides:
- ✅ Clean separation of concerns
- ✅ Independent deployment
- ✅ Easy maintenance
- ✅ Professional organization
- ✅ Scalable architecture

**Each folder is production-ready and can be deployed independently!** 🚀

