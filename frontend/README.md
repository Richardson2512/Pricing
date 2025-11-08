# PriceWise Frontend

React + TypeScript frontend for the PriceWise pricing consultation platform.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Supabase** - Authentication
- **Lucide React** - Icon library

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Auth.tsx                  # Authentication form
│   │   ├── Dashboard.tsx             # Main dashboard
│   │   ├── QuestionnaireForm.tsx     # Consultation form
│   │   ├── CreditPurchase.tsx        # Credit purchase modal
│   │   └── ConsultationResult.tsx    # Results display
│   ├── contexts/
│   │   └── AuthContext.tsx           # Auth state management
│   ├── lib/
│   │   └── supabase.ts               # Supabase client
│   ├── App.tsx                       # Main app component
│   ├── main.tsx                      # Entry point
│   └── index.css                     # Global styles
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Color Theme

The app uses an **olive green and beige** color palette:

- **Olive Green** - Primary actions, buttons, accents
- **Beige** - Backgrounds, secondary elements
- **Slate** - Text and neutral elements

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001
```

### 3. Run Development Server

```bash
npm run dev
```

The app will start on `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

## Features

### Authentication
- Email/password sign-up and sign-in
- New users get 3 free credits
- Session management via Supabase

### Pricing Consultations
- 6-question form to gather business information
- AI-generated pricing recommendations
- Costs 1 credit per consultation
- View consultation history

### Credit System
- Purchase credits via packages or custom amounts
- Credit balance displayed in navbar
- Credits never expire

## Development

```bash
# Run dev server
npm run dev

# Type check
npm run typecheck

# Lint code
npm run lint

# Build for production
npm run build
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Set environment variables

### Other Platforms

Compatible with any static hosting:
- AWS S3 + CloudFront
- Azure Static Web Apps
- Google Cloud Storage
- GitHub Pages

## Environment Variables

Required for production:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_API_URL` - Backend API URL (optional if using direct Supabase)

