# PriceWise - Complete System Architecture

## 🏗️ System Overview

PriceWise is an AI-powered pricing platform that helps businesses determine optimal pricing through:
1. Multi-step questionnaire
2. Document parsing (SoW/contracts)
3. Real-time market data scraping
4. DeepSeek V3 AI analysis
5. Comprehensive pricing recommendations

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  (React + TypeScript + Vite + Tailwind)                     │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  Landing Page    │  │  Multi-Step      │               │
│  │  Pricing Page    │  │  Questionnaire   │               │
│  │  Contact/Terms   │  │  (5 Steps)       │               │
│  └──────────────────┘  └──────────────────┘               │
│            │                     │                          │
│            └─────────┬───────────┘                          │
│                      │ HTTP/REST                            │
└──────────────────────┼──────────────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────────────┐
│                      ▼          BACKEND                      │
│  (Node.js + Express + TypeScript)                           │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Routes                                          │   │
│  │  • POST /api/consultations (create pricing request) │   │
│  │  • GET  /api/consultations (fetch history)          │   │
│  │  • POST /api/credits/purchase                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                      │                                       │
│                      ▼                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Processing Pipeline                                 │   │
│  │  1. Validate input (Zod)                            │   │
│  │  2. Check credits                                    │   │
│  │  3. Parse documents → DeepSeek                      │   │
│  │  4. Trigger scraping → Python layer                 │   │
│  │  5. Fetch market data → Supabase                    │   │
│  │  6. Generate analysis → DeepSeek V3                 │   │
│  │  7. Store results → Supabase                        │   │
│  │  8. Deduct credit                                    │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬───────────────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────────────┐
│                      ▼      SCRAPING LAYER                   │
│  (Python + Scrapy + Playwright + Prefect)                   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Scrapy Spiders (pricing_scrapers/)                 │   │
│  │  • fiverr_spider.py                                  │   │
│  │  • upwork_spider.py                                  │   │
│  │  • freelancer_spider.py                              │   │
│  │  • etsy_spider.py                                    │   │
│  │  • appsumo_spider.py                                 │   │
│  │  • producthunt_spider.py                             │   │
│  │  • indiamart_spider.py                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                      │                                       │
│                      ▼                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Data Pipeline                                       │   │
│  │  1. DataCleaningPipeline (normalize)                │   │
│  │  2. SupabasePipeline (store)                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                      │                                       │
│                      ▼                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Prefect Orchestration                               │   │
│  │  • scrape_market_data_flow()                        │   │
│  │  • scheduled_market_refresh() (daily)               │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬───────────────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────────────┐
│                      ▼         AI LAYER                      │
│  (DeepSeek V3 API)                                          │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Document Parser (documentParser.ts)                │   │
│  │  • Extract deliverables, timeline, tools            │   │
│  │  • Assess complexity                                 │   │
│  │  • Identify dependencies                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                      │                                       │
│                      ▼                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Pricing Analyzer (deepseek.ts)                     │   │
│  │  • Market benchmarking                               │   │
│  │  • Operational costing                               │   │
│  │  • Experience multiplier                             │   │
│  │  • Regional adjustment                               │   │
│  │  • Generate price range (low/avg/high)              │   │
│  │  • Provide rationale                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬───────────────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────────────┐
│                      ▼        DATABASE                       │
│  (Supabase - PostgreSQL)                                    │
│                                                              │
│  Tables:                                                     │
│  • profiles (users + credits)                               │
│  • consultations (pricing requests + results)               │
│  • credit_purchases (transactions)                          │
│  • market_listings (scraped data)                           │
└──────────────────────────────────────────────────────────────┘
```

## 🔄 Complete User Flow

### 1. User Fills Questionnaire

**Frontend: MultiStepQuestionnaire.tsx**

```
Step 1: Business Type
├─ Digital (💻) or Physical (📦)
└─ Product (🎁) or Service (⚙️)

Step 2: Experience & Market
├─ Experience: Beginner / Intermediate / Expert
├─ Region: India, USA, Europe, etc.
├─ Niche: SaaS, E-commerce, etc. (optional)
└─ Pricing Goal: Cost Plus / Market Rate / Premium

Step 3: Product Details
├─ Detailed description
└─ Cost structure

Step 4: Market & Competition
├─ Competitor pricing research
└─ Unique value proposition

Step 5: File Upload (optional for digital services)
└─ SoW, contracts, project briefs (PDF, DOC, DOCX)
```

**POST to Backend:**
```json
{
  "businessType": "digital",
  "offeringType": "service",
  "experienceLevel": "intermediate",
  "region": "India",
  "niche": "UI/UX Design",
  "pricingGoal": "market_rate",
  "productDescription": "...",
  "costToDeliver": "...",
  "competitorPricing": "...",
  "valueProposition": "...",
  "files": [...]
}
```

### 2. Backend Processing Pipeline

**Backend: consultations.ts**

```typescript
1. Validate input (Zod schema)
2. Check user credits
3. Parse documents (if uploaded)
   └─ DeepSeek extracts: deliverables, timeline, tools, complexity
4. Trigger market scraping
   └─ Python Scrapy spiders collect data
5. Fetch market data from Supabase
6. Clean and enrich data
7. Generate AI analysis with DeepSeek V3
8. Store consultation in database
9. Deduct 1 credit
10. Return results to frontend
```

### 3. Scraping Layer (Python)

**Scrapers: pricing_scrapers/spiders/**

Platform mapping:
- `digital_service` → Fiverr, Upwork, Freelancer.com
- `digital_product` → Etsy, AppSumo, ProductHunt
- `physical_product` → IndiaMART, eBay, Amazon
- `physical_service` → Justdial, IndiaMART, UrbanClap

Each spider:
1. Searches platform with query
2. Extracts: title, price, rating, reviews, delivery
3. Cleans data (DataCleaningPipeline)
4. Stores in Supabase (SupabasePipeline)

### 4. DeepSeek V3 Analysis

**AI Service: deepseek.ts**

Input to DeepSeek:
- Business context (type, experience, region)
- Offering details
- Cost structure
- Parsed documents (deliverables, tools, timeline)
- Market data (min, max, median, average, top 10%)
- Competition analysis
- Value proposition

Output from DeepSeek:
```
1. RECOMMENDED PRICE RANGE
   - Low: $X (entry/competitive)
   - Average: $Y (market-aligned)
   - High: $Z (premium)

2. COST BREAKDOWN & JUSTIFICATION
   - Operational costs
   - Time/labor costs
   - Tool/material costs
   - Profit margin

3. MARKET POSITIONING
   - Competitive landscape analysis
   - Strategy recommendation
   - Regional adjustments

4. EXPERIENCE MULTIPLIER
   - How expertise affects pricing
   - Recommended adjustments

5. ACTIONABLE NEXT STEPS
   - Specific starting price
   - A/B testing suggestions
   - When to adjust
```

### 5. Result Display

**Frontend: PricingAnalysisResult.tsx**

- Beautiful gradient header with "AI-Powered" badge
- Comprehensive pricing recommendation
- Cost breakdown and rationale
- Market positioning insights
- Input summary cards
- Download report button (TXT format)

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons

### Backend
- **Node.js + Express** - API server
- **TypeScript** - Type safety
- **Supabase Client** - Database & auth
- **Zod** - Input validation
- **Helmet** - Security
- **CORS** - Cross-origin
- **Rate Limiting** - API protection

### Scraping Layer
- **Scrapy** - Web scraping framework
- **Playwright** - JavaScript rendering
- **BeautifulSoup4** - HTML parsing
- **Requests/httpx** - HTTP client
- **Pandas** - Data processing
- **Pydantic** - Data validation
- **Prefect** - Workflow orchestration

### AI & Analysis
- **DeepSeek V3** - Pricing analysis
- **DeepSeek V3** - Document parsing

### Database
- **Supabase (PostgreSQL)** - Data storage
- **Row Level Security** - Access control

## 📁 Complete Project Structure

```
project/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Auth.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MultiStepQuestionnaire.tsx    # 5-step form
│   │   │   ├── PricingAnalysisResult.tsx     # Enhanced results
│   │   │   └── CreditPurchase.tsx
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── Contact.tsx
│   │   │   └── Terms.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   └── lib/
│   │       └── supabase.ts
│   └── package.json
│
├── backend/                     # Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── routes/
│   │   │   ├── consultations.ts             # Main processing
│   │   │   └── credits.ts
│   │   └── services/
│   │       ├── deepseek.ts                  # AI analysis
│   │       ├── documentParser.ts            # Document extraction
│   │       └── marketScraper.ts             # Market data fetching
│   └── package.json
│
├── scrapers/                    # Python scraping layer
│   ├── pricing_scrapers/
│   │   ├── spiders/
│   │   │   ├── fiverr_spider.py
│   │   │   ├── upwork_spider.py
│   │   │   ├── freelancer_spider.py
│   │   │   ├── etsy_spider.py
│   │   │   ├── appsumo_spider.py
│   │   │   ├── producthunt_spider.py
│   │   │   └── indiamart_spider.py
│   │   ├── items.py                         # Data models
│   │   ├── pipelines.py                     # Cleaning & storage
│   │   ├── settings.py                      # Scrapy config
│   │   └── middlewares.py
│   ├── workflows/
│   │   └── scraping_flow.py                 # Prefect orchestration
│   ├── api_connector.py                     # Backend integration
│   ├── requirements.txt
│   └── README.md
│
├── supabase/
│   └── migrations/
│       ├── 20251107_create_pricing_platform_schema.sql
│       └── 20251108_create_market_listings_table.sql
│
├── README.md
├── DEPLOYMENT.md
├── ARCHITECTURE.md
└── PROJECT_SUMMARY.md
```

## 🔄 Data Flow

### Complete Request Lifecycle

```
1. USER SUBMITS FORM
   ↓
2. FRONTEND validates & sends to backend
   POST /api/consultations
   ↓
3. BACKEND validates with Zod
   ↓
4. CHECK CREDITS (must have ≥1)
   ↓
5. PARSE DOCUMENTS (if uploaded)
   • Extract text from PDF/DOC
   • Send to DeepSeek for parsing
   • Get: deliverables, tools, timeline, complexity
   ↓
6. TRIGGER MARKET SCRAPING
   • Determine platforms (Fiverr, Upwork, etc.)
   • Run Scrapy spiders via Python
   • Collect 20-50 comparable listings
   ↓
7. CLEAN & NORMALIZE DATA
   • Remove invalid prices
   • Normalize currencies
   • Calculate quality scores
   • Deduplicate entries
   ↓
8. STORE IN SUPABASE
   • market_listings table
   • Indexed by source, category, price
   ↓
9. FETCH MARKET DATA
   • Query recent listings (< 7 days old)
   • Calculate statistics (min, max, median, avg, top 10%)
   ↓
10. DEEPSEEK V3 ANALYSIS
    • Comprehensive prompt with ALL context
    • Market benchmarking
    • Cost breakdown
    • Experience multiplier
    • Regional adjustments
    • Generate price range + rationale
    ↓
11. STORE CONSULTATION
    • Save to consultations table
    • Include AI recommendation
    ↓
12. DEDUCT CREDIT
    • Update user profile
    • Decrease credit count by 1
    ↓
13. RETURN TO FRONTEND
    • Send consultation object
    • Display results
    • Enable download
```

## 🎯 Key Features

### Multi-Step Questionnaire
- ✅ 5-step progressive form
- ✅ Visual card selection
- ✅ Progress bar
- ✅ Validation at each step
- ✅ File upload with drag-and-drop
- ✅ Conditional steps (file upload for freelancers)

### Document Parsing
- ✅ Upload SoW, contracts, briefs
- ✅ DeepSeek extracts structured data
- ✅ Identifies deliverables, tools, timeline
- ✅ Assesses complexity
- ✅ Feeds into pricing analysis

### Market Data Collection
- ✅ Platform-specific spiders
- ✅ Playwright for JavaScript sites
- ✅ Data cleaning pipeline
- ✅ Supabase storage
- ✅ Statistical analysis
- ✅ 7-day caching

### AI Analysis
- ✅ DeepSeek V3 integration
- ✅ Comprehensive pricing breakdown
- ✅ Market positioning
- ✅ Experience adjustments
- ✅ Regional considerations
- ✅ Actionable recommendations

### Credit System
- ✅ 1 credit per analysis
- ✅ 3 free credits for new users
- ✅ Purchase additional credits
- ✅ Credits never expire
- ✅ Balance in navbar

## 🔐 Security

- **Authentication**: Supabase JWT tokens
- **Authorization**: Row Level Security (RLS)
- **API Protection**: Rate limiting, Helmet
- **Input Validation**: Zod schemas
- **Service Role Key**: Backend only (never exposed)
- **CORS**: Configured for frontend origin only

## 📊 Database Schema

### profiles
- id, email, credits, created_at, updated_at

### consultations
- id, user_id, business_type, target_market, product_description
- cost_to_deliver, competitor_pricing, value_proposition
- pricing_recommendation, created_at

### credit_purchases
- id, user_id, credits_purchased, amount_paid, purchase_date

### market_listings (NEW)
- id, source, title, price, currency
- rating, reviews, delivery_time
- seller_name, seller_level, description
- category, url, scraped_at, created_at

## 🚀 Deployment

### Frontend
- **Platform**: Vercel / Netlify
- **Build**: `npm run build`
- **Env**: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL

### Backend
- **Platform**: Railway / Render / Heroku
- **Build**: `npm run build && npm start`
- **Env**: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DEEPSEEK_API_KEY

### Scrapers
- **Platform**: Dedicated server / AWS Lambda
- **Runtime**: Python 3.10+
- **Scheduler**: Prefect Cloud / Cron
- **Env**: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

## 📈 Scalability

### Current Capacity
- Frontend: Static hosting (infinite scale)
- Backend: 100 req/15min per IP
- Scrapers: 20-50 listings per request
- Database: Supabase free tier

### Scaling Options
1. **Backend**: Add more instances, load balancer
2. **Scrapers**: Distributed Scrapy cluster
3. **Database**: Upgrade Supabase plan
4. **Cache**: Add Redis for market data
5. **Queue**: RabbitMQ for async scraping

## 🎨 Design System

**Colors:**
- Primary: Olive Green (#5f6d42)
- Secondary: Beige (#f5f3ef)
- Text: Slate shades
- Accents: Olive variations

**Components:**
- Consistent header/footer
- Card-based layouts
- Smooth transitions
- Responsive grid system

## 📝 API Endpoints

### Consultations
- `GET /api/consultations` - Get user's pricing history
- `POST /api/consultations` - Create new pricing analysis
- `GET /api/consultations/:id` - Get specific analysis

### Credits
- `GET /api/credits/profile` - Get user profile
- `POST /api/credits/purchase` - Buy credits
- `GET /api/credits/purchases` - Purchase history

### Health
- `GET /health` - Server status

## 🧪 Testing

### Frontend
```bash
cd frontend
npm run dev
```

### Backend
```bash
cd backend
npm run dev
```

### Scrapers
```bash
cd scrapers
scrapy crawl fiverr -a query="web design"
python workflows/scraping_flow.py
```

## 📚 Documentation

- `README.md` - Project overview
- `DEPLOYMENT.md` - Deployment guide
- `ARCHITECTURE.md` - This file
- `frontend/README.md` - Frontend docs
- `backend/README.md` - Backend API docs
- `scrapers/README.md` - Scraping docs

## 🎯 Future Enhancements

1. **Real-time scraping** - Trigger on demand
2. **More platforms** - eBay, Amazon, Justdial, etc.
3. **PDF reports** - Professional downloadable reports
4. **Price tracking** - Monitor pricing over time
5. **Competitor alerts** - Notify of price changes
6. **Team features** - Collaborate on pricing
7. **API access** - Programmatic pricing checks
8. **Webhooks** - Integration with other tools

## 🔗 Integration Points

### Frontend ↔ Backend
- REST API over HTTP
- JWT authentication
- JSON payloads

### Backend ↔ Scrapers
- Subprocess execution
- Supabase as data bridge
- Prefect for orchestration

### Backend ↔ DeepSeek
- REST API over HTTPS
- API key authentication
- JSON request/response

### All ↔ Supabase
- PostgreSQL database
- Real-time subscriptions
- File storage (future)
- Row Level Security

## ✅ Implementation Status

- [x] Frontend multi-page site
- [x] Multi-step questionnaire
- [x] File upload capability
- [x] Backend API with Express
- [x] DeepSeek V3 integration
- [x] Document parsing service
- [x] Market scraper service
- [x] Scrapy spiders (7 platforms)
- [x] Data cleaning pipeline
- [x] Supabase storage
- [x] Prefect orchestration
- [x] Enhanced result display
- [x] Download reports
- [x] Credit system
- [x] Authentication & authorization

## 🎊 Result

A complete, production-ready pricing platform with:
- Professional UI/UX
- Real AI analysis
- Market data integration
- Comprehensive documentation
- Scalable architecture
- Security best practices

