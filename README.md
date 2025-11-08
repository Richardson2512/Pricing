# HowMuchShouldIPrice.com

> AI-powered pricing intelligence platform that helps entrepreneurs, freelancers, and businesses determine optimal pricing for their products and services.

**Live Site:** [https://howmuchshouldiprice.com](https://howmuchshouldiprice.com)

---

## 🏗️ Project Structure

This is a monorepo containing three independent, self-contained services:

```
project/
├── frontend/          # React + TypeScript + Vite (Vercel)
├── backend/           # Express + TypeScript (Railway)
├── scrapers/          # Python + Scrapy (AWS Lambda)
├── supabase/          # Database migrations
├── docs/              # All documentation
└── README.md          # This file
```

### 📱 [Frontend](./frontend/)
- **Tech Stack**: React, TypeScript, Vite, Tailwind CSS
- **Deployment**: Vercel
- **URL**: https://howmuchshouldiprice.com
- **Features**: User interface, authentication, questionnaire, pricing display
- [Frontend README →](./frontend/README.md)

### 🔧 [Backend](./backend/)
- **Tech Stack**: Express, TypeScript, Node.js
- **Deployment**: Railway
- **URL**: https://your-backend.railway.app
- **Features**: API endpoints, DeepSeek AI integration, data processing
- [Backend README →](./backend/README.md)

### 🕷️ [Scrapers](./scrapers/)
- **Tech Stack**: Python, Scrapy, Playwright
- **Deployment**: AWS Lambda / Separate Service
- **Purpose**: Market data collection from multiple platforms
- [Scrapers README →](./scrapers/README.md)

### 🗄️ [Database](./supabase/)
- **Tech**: Supabase (PostgreSQL)
- **Migrations**: SQL files in `supabase/migrations/`
- **Features**: User data, consultations, credit tracking, market listings

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+ (for scrapers)
- Supabase account
- DeepSeek API key

### 1. Clone Repository
```bash
git clone https://github.com/Richardson2512/Pricing.git
cd project
```

### 2. Setup Frontend
```bash
cd frontend
npm install
cp env.example .env
# Edit .env with your Supabase credentials
npm run dev
# Opens at http://localhost:5173
```

### 3. Setup Backend
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your credentials
npm run dev
# Runs at http://localhost:3001
```

### 4. Setup Scrapers (Optional)
```bash
cd scrapers
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
```

### 5. Setup Database
```bash
# Run migrations in Supabase dashboard
# Copy SQL from supabase/migrations/00_master_schema.sql
# Or use Supabase CLI:
supabase db push
```

---

## 📚 Documentation

All documentation is organized in the [`docs/`](./docs/) folder:

### 🚀 Deployment Guides
- **[Vercel Deployment Guide](./docs/VERCEL_DEPLOYMENT.md)** - Complete Vercel setup
- **[Quick Deploy (10 min)](./docs/QUICK_DEPLOY.md)** - Fast deployment guide
- **[Domain Configuration](./docs/DOMAIN_CONFIGURATION.md)** - Custom domain setup

### 🏛️ Architecture & Design
- **[System Architecture](./docs/ARCHITECTURE.md)** - Overall system design
- **[Data Flow Verification](./docs/DATA_FLOW_VERIFICATION.md)** - Frontend to backend flow
- **[Dual Intake System](./docs/DUAL_INTAKE_SYSTEM.md)** - Questionnaire + document upload

### ✨ Features & Specifications
- **[Anthropological Questionnaire](./docs/ANTHROPOLOGICAL_QUESTIONNAIRE_SPEC.md)** - 70+ question spec
- **[Questionnaire Structure](./docs/QUESTIONNAIRE_STRUCTURE.md)** - Question flow logic
- **[Fallback Systems](./docs/FALLBACK_SYSTEMS.md)** - API fallback chains
- **[SEO Guide](./docs/SEO_GUIDE.md)** - SEO optimization strategy

### 🗄️ Database
- **[Supabase Setup](./docs/SUPABASE_SETUP.md)** - Database configuration
- **[Project Summary](./docs/PROJECT_SUMMARY.md)** - Complete project overview

---

## 🌐 Deployment

Each folder is self-contained and can be deployed independently:

### Frontend → Vercel
```bash
cd frontend
vercel --prod
```
**Configuration**: `frontend/vercel.json`

### Backend → Railway
```bash
cd backend
railway up
```
**Configuration**: Railway dashboard

### Scrapers → AWS Lambda (Optional)
```bash
cd scrapers
# Package and deploy to Lambda
# Or run as separate service
```

### Database → Supabase
Already hosted - just run migrations from `supabase/migrations/`

---

## 🔑 Environment Variables

### Frontend (`.env`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_BACKEND_URL=https://your-backend.railway.app
```

### Backend (`.env`)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DEEPSEEK_API_KEY=sk-your-deepseek-key
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://howmuchshouldiprice.com
```

See `env.example` files in each folder for complete lists.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React + TypeScript + Vite | User interface |
| **Styling** | Tailwind CSS | Responsive design |
| **Backend** | Express + TypeScript | REST API |
| **Database** | Supabase (PostgreSQL) | Data storage |
| **Auth** | Supabase Auth | User authentication |
| **AI** | DeepSeek V3 | Pricing recommendations |
| **Scraping** | Python + Scrapy + Playwright | Market data collection |
| **Hosting** | Vercel + Railway | Cloud deployment |

---

## 📦 Key Features

### ✅ Pricing Intelligence
- AI-powered pricing recommendations
- Market data analysis from 7+ platforms
- Tiered pricing for SaaS products
- Hourly/project rates for services
- Unit/wholesale pricing for products

### ✅ Dual Intake System
- **Manual Questionnaire**: 70+ questions across 4 stages
- **Document Upload**: AI parses SoW, contracts, invoices

### ✅ Advanced Features
- Travel cost calculations (geocoding + routing)
- Currency conversion (25+ currencies)
- Multi-tier fallback systems for APIs
- Progressive background analysis
- Credit-based usage system

### ✅ User Experience
- SEO optimized (target keywords integrated)
- Mobile responsive
- Fast loading (Vite optimization)
- Secure authentication
- Real-time pricing updates

---

## 🎯 Target Keywords

- "how much should i charge for my project"
- "how much should i price for my project"
- "pricing calculator"
- "freelance pricing tool"
- "AI pricing recommendations"

---

## 📊 Project Status

| Component | Status | Deployment |
|-----------|--------|------------|
| Frontend | ✅ Complete | Vercel |
| Backend | ✅ Complete | Railway |
| Database | ✅ Complete | Supabase |
| Scrapers | ✅ Complete | Pending |
| SEO | ✅ Optimized | Live |
| Documentation | ✅ Complete | This repo |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 Development Workflow

### Local Development
```bash
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - Backend
cd backend && npm run dev

# Terminal 3 - Scrapers (optional)
cd scrapers && scrapy crawl fiverr -a query="design"
```

### Testing
```bash
# Frontend
cd frontend && npm run typecheck

# Backend
cd backend && npm run build
```

### Deployment
```bash
# Commit and push to main branch
git add .
git commit -m "Your changes"
git push origin main

# Vercel auto-deploys frontend
# Railway auto-deploys backend
```

---

## 🐛 Troubleshooting

### Frontend Issues
- Check `frontend/README.md`
- Verify Supabase credentials in `.env`
- Clear browser cache and cookies

### Backend Issues
- Check `backend/README.md`
- Verify all environment variables
- Check Railway logs: `railway logs`

### Database Issues
- Verify migrations ran successfully
- Check Supabase dashboard for errors
- Ensure RLS policies are correct

### Deployment Issues
- See [Deployment Guide](./docs/DEPLOYMENT.md)
- Check [Vercel Deployment](./docs/VERCEL_DEPLOYMENT.md)
- Review [Quick Deploy](./docs/QUICK_DEPLOY.md)

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support & Contact

- **Website**: [https://howmuchshouldiprice.com](https://howmuchshouldiprice.com)
- **Email**: support@howmuchshouldiprice.com
- **Sales**: sales@howmuchshouldiprice.com
- **Partnerships**: partners@howmuchshouldiprice.com
- **GitHub**: [Richardson2512/Pricing](https://github.com/Richardson2512/Pricing)

---

## 🎉 Acknowledgments

Built with:
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [DeepSeek](https://www.deepseek.com/)
- [Scrapy](https://scrapy.org/)
- [Vercel](https://vercel.com/)
- [Railway](https://railway.app/)

---

**Built with ❤️ for entrepreneurs, freelancers, and businesses worldwide**

*Stop guessing. Start pricing with confidence.*
