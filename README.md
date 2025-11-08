# PriceWise - Pricing Consultation Platform

A full-stack web application that provides AI-powered pricing recommendations for businesses. Users can answer a questionnaire about their business and receive personalized pricing strategies.

## 🎨 Features

- **User Authentication** - Secure email/password authentication via Supabase
- **Credit System** - Purchase credits to access pricing consultations
- **Pricing Consultations** - Answer 6 questions and get detailed pricing recommendations
- **Consultation History** - View all past consultations
- **Modern UI** - Clean, responsive design with olive green and beige color theme

## 🏗️ Project Structure

```
project/
├── frontend/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # Context providers
│   │   └── lib/          # Utilities and configs
│   ├── package.json
│   └── README.md
│
├── backend/              # Express + TypeScript API
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── middleware/  # Express middleware
│   │   └── routes/      # API routes
│   ├── package.json
│   └── README.md
│
├── supabase/            # Database migrations
│   └── migrations/
│
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Git

### 1. Clone Repository

```bash
git clone https://github.com/Richardson2512/Pricing.git
cd Pricing
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

Backend runs on `http://localhost:3001`

### 3. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Setup Database

Run the migration file in your Supabase SQL editor:
```sql
-- Located in: supabase/migrations/20251107172549_create_pricing_platform_schema.sql
```

## 🔧 Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase Client
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- TypeScript
- Supabase (PostgreSQL + Auth)
- Zod (validation)
- Helmet (security)

## 📦 Deployment

### Frontend Deployment

**Vercel (Recommended)**
1. Connect GitHub repository
2. Set root directory to `frontend`
3. Add environment variables
4. Deploy

**Netlify**
1. Build command: `npm run build`
2. Publish directory: `frontend/dist`
3. Add environment variables

### Backend Deployment

**Railway (Recommended)**
1. Connect GitHub repository
2. Set root directory to `backend`
3. Add environment variables
4. Deploy

**Heroku / Render**
1. Create new app
2. Set buildpack to Node.js
3. Add environment variables
4. Deploy from GitHub

## 🔐 Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001
```

### Backend (.env)
```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 📊 Database Schema

### Tables
- **profiles** - User profiles with credit balance
- **consultations** - Pricing consultation records
- **credit_purchases** - Transaction history

All tables have Row Level Security (RLS) enabled.

## 🛠️ Development

### Frontend
```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Lint code
npm run typecheck    # Type checking
```

### Backend
```bash
cd backend
npm run dev          # Start dev server with hot reload
npm run build        # Build TypeScript
npm start            # Run production build
npm run lint         # Lint code
```

## 📝 API Endpoints

### Consultations
- `GET /api/consultations` - Get all consultations
- `POST /api/consultations` - Create consultation (costs 1 credit)
- `GET /api/consultations/:id` - Get specific consultation

### Credits
- `GET /api/credits/profile` - Get user profile
- `POST /api/credits/purchase` - Purchase credits
- `GET /api/credits/purchases` - Get purchase history

All endpoints require Bearer token authentication.

## 🎨 Color Theme

The application uses an olive green and beige color palette:
- **Primary**: Olive Green (#5f6d42)
- **Secondary**: Beige (#f5f3ef)
- **Accents**: Various shades of olive and beige

## 📄 License

ISC

## 👤 Author

Richardson2512

## 🔗 Links

- [GitHub Repository](https://github.com/Richardson2512/Pricing)
- [Supabase](https://supabase.com)
