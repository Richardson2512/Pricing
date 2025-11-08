# 🚀 Quick Deploy to Vercel

Follow these steps to deploy your PriceWise platform to Vercel in under 10 minutes.

## ✅ Prerequisites

- [ ] GitHub account with this repository
- [ ] Vercel account (free tier is fine)
- [ ] Supabase project set up
- [ ] DeepSeek API key

---

## 📝 Step-by-Step Deployment

### 1️⃣ Deploy Backend to Railway (5 minutes)

Since you're using Railway for backend:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Navigate to backend
cd backend

# Initialize Railway project
railway init

# Add environment variables
railway variables set SUPABASE_URL="your_supabase_url"
railway variables set SUPABASE_ANON_KEY="your_anon_key"
railway variables set SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
railway variables set DEEPSEEK_API_KEY="your_deepseek_key"
railway variables set NODE_ENV="production"
railway variables set FRONTEND_URL="https://your-app.vercel.app"

# Deploy
railway up

# Get your backend URL
railway domain
```

**Copy your Railway backend URL** (e.g., `https://pricewise-backend-production.up.railway.app`)

---

### 2️⃣ Deploy Frontend to Vercel (3 minutes)

#### Option A: Via Vercel Dashboard (Easiest)

1. **Go to [vercel.com](https://vercel.com) and login**

2. **Click "Add New Project"**

3. **Import your GitHub repository**

4. **Configure Project:**
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Add Environment Variables:**
   Click "Environment Variables" and add:
   ```
   VITE_SUPABASE_URL = your_supabase_url
   VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
   VITE_BACKEND_URL = your_railway_backend_url
   ```

6. **Click "Deploy"** 🚀

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Navigate to frontend
cd frontend

# Deploy
vercel --prod

# Follow prompts and add environment variables when asked
```

---

### 3️⃣ Update Backend with Frontend URL (1 minute)

Once frontend is deployed, update Railway backend:

```bash
# Update FRONTEND_URL with your actual Vercel URL
railway variables set FRONTEND_URL="https://your-actual-app.vercel.app"

# Redeploy backend
railway up
```

---

## 🎯 Verify Deployment

### Test Backend:
```bash
curl https://your-backend.railway.app/health
```

Should return:
```json
{"status":"ok","timestamp":"2024-..."}
```

### Test Frontend:
1. Visit your Vercel URL
2. Try signing up
3. Complete a questionnaire
4. Check if pricing recommendation works

---

## 🔧 Common Issues & Fixes

### ❌ CORS Error
**Problem**: Frontend can't reach backend

**Fix**:
```bash
# Make sure FRONTEND_URL is set correctly in Railway
railway variables set FRONTEND_URL="https://your-exact-vercel-url.vercel.app"
railway up
```

### ❌ Environment Variables Not Working
**Problem**: App shows errors about missing env vars

**Fix**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify all variables are set
3. Click "Redeploy" in Deployments tab

### ❌ Build Fails
**Problem**: Vercel build fails

**Fix**:
1. Check build logs in Vercel
2. Make sure `Root Directory` is set to `frontend`
3. Verify `package.json` has correct scripts

---

## 📊 Post-Deployment Checklist

- [ ] Frontend loads at Vercel URL
- [ ] Backend health check responds
- [ ] User can sign up
- [ ] User can log in
- [ ] Questionnaire loads
- [ ] Pricing recommendation works
- [ ] Credits are tracked
- [ ] No console errors
- [ ] Supabase data is being saved

---

## 🎉 You're Live!

Your app is now deployed:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app`

### Share Your App:
- Landing page: `https://your-app.vercel.app`
- Sign up: `https://your-app.vercel.app/signup`
- Pricing: `https://your-app.vercel.app/pricing`

---

## 🔄 Future Deployments

Every time you push to GitHub `main` branch:
- ✅ Vercel auto-deploys frontend
- ✅ Railway auto-deploys backend (if connected to GitHub)
- ✅ Takes ~2-3 minutes

### Manual Redeploy:
```bash
# Frontend
cd frontend && vercel --prod

# Backend
cd backend && railway up
```

---

## 🆘 Need Help?

1. Check Vercel build logs
2. Check Railway logs: `railway logs`
3. Verify environment variables
4. Test locally first: `npm run dev`

---

## 🎯 Next Steps

- [ ] Add custom domain
- [ ] Set up monitoring
- [ ] Enable Vercel Analytics
- [ ] Add error tracking (Sentry)
- [ ] Set up backup strategy
- [ ] Configure CDN caching

