# 🚀 Deployment Guide

This guide covers deploying both the frontend and backend of PriceWise.

## 📋 Prerequisites

- GitHub repository (already set up)
- Supabase account with project created
- Database migrations applied
- Environment variables ready

## 🎨 Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project**
   - Root Directory: `frontend`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables**
   ```
   VITE_SUPABASE_URL=https://vudjijwnllgxtjpeliff.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_API_URL=https://your-backend-url.railway.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at `https://your-app.vercel.app`

### Option 2: Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"

2. **Configure Build**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

3. **Environment Variables**
   - Add same variables as Vercel

4. **Deploy**

## ⚙️ Backend Deployment

### Option 1: Railway (Recommended)

1. **Create New Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"

2. **Configure Service**
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Environment Variables**
   ```
   SUPABASE_URL=https://vudjijwnllgxtjpeliff.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   ```

4. **Generate Domain**
   - Railway will provide a public URL
   - Use this URL in your frontend's `VITE_API_URL`

### Option 2: Render

1. **Create Web Service**
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure**
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Add Environment Variables**
   - Same as Railway

### Option 3: Heroku

1. **Create App**
   ```bash
   heroku create your-app-name
   ```

2. **Set Buildpack**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

3. **Configure**
   - Add `heroku.yml` or use Procfile
   - Set root directory to `backend`

4. **Environment Variables**
   ```bash
   heroku config:set SUPABASE_URL=your-url
   heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-key
   # ... etc
   ```

## 🗄️ Database Setup

Your Supabase database is already configured, but ensure:

1. **Migration Applied**
   - Run the SQL from `supabase/migrations/20251107172549_create_pricing_platform_schema.sql`
   - In Supabase Dashboard → SQL Editor

2. **RLS Policies Active**
   - Verify Row Level Security is enabled on all tables
   - Test with a user account

3. **API Keys**
   - Use **anon key** for frontend (public)
   - Use **service role key** for backend (private, server-only)

## 🔄 CI/CD (Optional)

### Automatic Deployments

Both Vercel and Railway support automatic deployments:

- **Push to `main`** → Deploys to production
- **Push to other branches** → Creates preview deployments

### GitHub Actions (Advanced)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        # Add Vercel deployment steps

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        # Add Railway deployment steps
```

## ✅ Post-Deployment Checklist

### Frontend
- [ ] App loads without errors
- [ ] Can sign up new user
- [ ] Can sign in existing user
- [ ] Dashboard displays correctly
- [ ] Can start new consultation
- [ ] Credit purchase modal works

### Backend
- [ ] Health check responds: `GET /health`
- [ ] API endpoints require authentication
- [ ] Consultations can be created
- [ ] Credits are deducted properly
- [ ] CORS allows frontend requests

### Database
- [ ] New users get 3 credits
- [ ] Consultations are saved
- [ ] Credit purchases are recorded
- [ ] RLS policies prevent unauthorized access

## 🐛 Troubleshooting

### Frontend Issues

**"Failed to fetch"**
- Check `VITE_API_URL` is correct
- Verify backend is running
- Check CORS settings in backend

**"Supabase client error"**
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check Supabase project is active

### Backend Issues

**"Cannot connect to database"**
- Verify Supabase credentials
- Check service role key is correct
- Ensure database is accessible

**"CORS error"**
- Update `FRONTEND_URL` in backend env
- Check CORS middleware configuration

**"Rate limit exceeded"**
- Adjust rate limiting in `server.ts`
- Consider IP whitelisting for testing

## 📊 Monitoring

### Frontend (Vercel)
- Analytics dashboard
- Error tracking
- Performance metrics

### Backend (Railway)
- Logs in Railway dashboard
- Resource usage
- Deployment history

### Database (Supabase)
- Query performance
- Table statistics
- API usage

## 🔐 Security Checklist

- [ ] Never commit `.env` files
- [ ] Service role key only in backend
- [ ] HTTPS enabled on all endpoints
- [ ] Rate limiting configured
- [ ] RLS policies tested
- [ ] Input validation active
- [ ] Helmet.js security headers set

## 📞 Support

- GitHub Issues: [Report a bug](https://github.com/Richardson2512/Pricing/issues)
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)

