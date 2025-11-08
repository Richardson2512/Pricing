# PriceWise Backend API

Backend API server for the PriceWise pricing consultation platform.

## Tech Stack

- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **Supabase** for database and authentication
- **DeepSeek V3 AI** for intelligent pricing recommendations
- **Zod** for request validation
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Rate Limiting** for API protection

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.ts          # Supabase client configuration
│   ├── middleware/
│   │   └── auth.ts               # Authentication middleware
│   ├── routes/
│   │   ├── consultations.ts      # Consultation endpoints
│   │   └── credits.ts            # Credit management endpoints
│   └── server.ts                 # Main server file
├── .env.example                  # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DEEPSEEK_API_KEY=your-deepseek-api-key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

### 4. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Consultations
- `GET /api/consultations` - Get all user consultations (requires auth)
- `POST /api/consultations` - Create new consultation (requires auth, costs 1 credit)
- `GET /api/consultations/:id` - Get specific consultation (requires auth)

### Credits
- `GET /api/credits/profile` - Get user profile with credit balance (requires auth)
- `POST /api/credits/purchase` - Purchase credits (requires auth)
- `GET /api/credits/purchases` - Get purchase history (requires auth)

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <supabase-jwt-token>
```

The token is obtained from Supabase Auth on the frontend.

## Deployment

### Railway

1. Create new project on Railway
2. Add PostgreSQL database (or use existing Supabase)
3. Set environment variables
4. Deploy from GitHub

### Other Platforms

Compatible with:
- Heroku
- Render
- AWS Elastic Beanstalk
- Google Cloud Run
- Azure App Service

## Security Features

- **Helmet.js** - Security headers
- **CORS** - Configured for frontend origin only
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **JWT Authentication** - Via Supabase
- **Input Validation** - Using Zod schemas
- **Service Role Key** - Server-side only, never exposed to client

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Lint code
npm run lint

# Build TypeScript
npm run build
```

