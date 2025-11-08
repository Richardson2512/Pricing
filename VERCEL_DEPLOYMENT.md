# Vercel Deployment Guide

This guide covers deploying the PriceWise platform to Vercel with separate frontend and backend deployments.

## 📋 Architecture

- **Frontend**: Vite + React + TypeScript (Static Site)
- **Backend**: Express + TypeScript (Serverless Functions)
- **Database**: Supabase (Hosted separately)

## 🚀 Deployment Strategy

We deploy **TWO separate Vercel projects**:
1. **Frontend** - Main web application
2. **Backend** - API serverless functions

### Why Separate Deployments?

- Better performance and scalability
- Independent deployment cycles
- Easier debugging and monitoring
- Backend can be deployed to Railway/Render if needed

---

## 📦 Part 1: Deploy Backend (API)

### Option A: Deploy Backend to Vercel

1. **Create New Vercel Project for Backend**
   ```bash
   # In Vercel Dashboard:
   # - Click "Add New Project"
   # - Import your GitHub repository
   # - Set Root Directory: backend
   # - Framework Preset: Other
   ```

2. **Configure Backend Environment Variables**
   
   In Vercel Dashboard → Settings → Environment Variables, add:
   
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   DEEPSEEK_API_KEY=your_deepseek_api_key
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

3. **Deploy Backend**
   - Vercel will auto-deploy on push to main
   - Backend URL will be: `https://pricewise-backend.vercel.app`

### Option B: Deploy Backend to Railway (Recommended for Long-Running Tasks)

Since you mentioned using Railway for backend:

1. **Create Railway Project**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login
   railway login
   
   # Link project
   cd backend
   railway init
   ```

2. **Configure Railway Environment Variables**
   Same as above, plus:
   ```env
   RAILWAY_STATIC_URL=your-backend-url.railway.app
   ```

3. **Deploy**
   ```bash
   railway up
   ```

4. **Get Backend URL**
   - Your backend will be at: `https://your-backend-url.railway.app`

---

## 🎨 Part 2: Deploy Frontend

1. **Create New Vercel Project for Frontend**
   ```bash
   # In Vercel Dashboard:
   # - Click "Add New Project"
   # - Import your GitHub repository
   # - Set Root Directory: frontend
   # - Framework Preset: Vite
   ```

2. **Configure Frontend Environment Variables**
   
   In Vercel Dashboard → Settings → Environment Variables:
   
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_BACKEND_URL=https://your-backend-url.railway.app
   ```
   
   **Important**: Replace `VITE_BACKEND_URL` with your actual backend URL from Step 1.

3. **Update Frontend API Calls**
   
   The frontend should use the environment variable for API calls:
   
   ```typescript
   const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
   ```

4. **Deploy Frontend**
   - Push to GitHub main branch
   - Vercel auto-deploys
   - Frontend URL: `https://your-app-name.vercel.app`

---

## 🔧 Build Configuration

### Frontend Build Settings (Vercel Dashboard)

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Root Directory: frontend
Node Version: 18.x
```

### Backend Build Settings (Vercel Dashboard)

```
Framework Preset: Other
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Root Directory: backend
Node Version: 18.x
```

---

## 🌍 Environment Variables Summary

### Frontend (.env.production)
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_BACKEND_URL=https://your-backend.railway.app
```

### Backend (.env.production)
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
DEEPSEEK_API_KEY=sk-xxx...
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 🔄 Continuous Deployment

Both projects are configured for automatic deployment:

1. **Push to GitHub** → Triggers deployment
2. **Vercel builds** → Runs tests and builds
3. **Auto-deploys** → Live in ~2 minutes

### Branch Deployments

- `main` branch → Production deployment
- Other branches → Preview deployments
- Pull requests → Automatic preview URLs

---

## 🐛 Troubleshooting

### Issue: CORS Errors

**Solution**: Update backend CORS configuration:

```typescript
// backend/src/server.ts
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend.vercel.app',
    'https://*.vercel.app' // Allow all Vercel preview deployments
  ],
  credentials: true
}));
```

### Issue: Environment Variables Not Loading

**Solution**: 
1. Check Vercel Dashboard → Settings → Environment Variables
2. Ensure variables are set for "Production" environment
3. Redeploy after adding variables

### Issue: Build Fails

**Solution**:
1. Check Vercel build logs
2. Ensure `package.json` scripts are correct
3. Verify Node version compatibility (use 18.x)

### Issue: API Calls Fail in Production

**Solution**:
1. Verify `VITE_BACKEND_URL` is set correctly
2. Check backend is deployed and accessible
3. Verify CORS configuration includes frontend URL

### Issue: Supabase Connection Fails

**Solution**:
1. Verify Supabase environment variables
2. Check Supabase project is active
3. Verify RLS policies allow access

---

## 📊 Monitoring

### Vercel Analytics

Enable in Vercel Dashboard:
- Speed Insights
- Web Vitals
- Function Logs

### Backend Monitoring

For Railway:
- View logs: `railway logs`
- Monitor metrics in Railway dashboard

---

## 🔐 Security Checklist

- [ ] All API keys stored in environment variables
- [ ] CORS configured with specific origins
- [ ] Supabase RLS policies enabled
- [ ] Rate limiting enabled on backend
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Environment variables not committed to Git

---

## 📝 Deployment Checklist

### Before First Deploy:

- [ ] Push all code to GitHub
- [ ] Set up Supabase project
- [ ] Run Supabase migrations
- [ ] Get DeepSeek API key
- [ ] Create Vercel account
- [ ] Create Railway account (if using)

### Backend Deployment:

- [ ] Create Railway/Vercel project
- [ ] Set all environment variables
- [ ] Deploy backend
- [ ] Test API endpoints
- [ ] Note backend URL

### Frontend Deployment:

- [ ] Create Vercel project
- [ ] Set environment variables (including backend URL)
- [ ] Deploy frontend
- [ ] Test all features
- [ ] Verify API calls work

### Post-Deployment:

- [ ] Test user registration
- [ ] Test user login
- [ ] Test questionnaire flow
- [ ] Test pricing recommendations
- [ ] Test credit system
- [ ] Check browser console for errors
- [ ] Verify Supabase data is being saved

---

## 🎯 Custom Domains (Optional)

### Add Custom Domain to Frontend

1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `pricewise.com`)
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

### Add Custom Domain to Backend

1. In Railway/Vercel, go to Settings → Domains
2. Add subdomain (e.g., `api.pricewise.com`)
3. Update frontend `VITE_BACKEND_URL`
4. Redeploy frontend

---

## 🚀 Quick Deploy Commands

### Deploy Everything:

```bash
# 1. Commit and push
git add .
git commit -m "Deploy to production"
git push origin main

# 2. Vercel auto-deploys both projects
# 3. Check deployment status in Vercel Dashboard
```

### Force Redeploy:

```bash
# Frontend
vercel --prod --cwd frontend

# Backend (if on Vercel)
vercel --prod --cwd backend

# Backend (if on Railway)
cd backend && railway up
```

---

## 📞 Support

If you encounter issues:

1. Check Vercel build logs
2. Check Railway logs: `railway logs`
3. Verify all environment variables
4. Test locally first: `npm run dev`
5. Check Supabase logs

---

## 🎉 Success!

Once deployed, your app will be live at:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app`

Users can:
- ✅ Sign up and log in
- ✅ Complete pricing questionnaires
- ✅ Get AI-powered pricing recommendations
- ✅ View their credit balance
- ✅ See pricing history

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

