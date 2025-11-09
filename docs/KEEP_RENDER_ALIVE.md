# Keep Render Service Alive Guide

## 🎯 Problem

Render free tier services go to **sleep after 15 minutes of inactivity**. This causes:
- ❌ First request takes 30-60 seconds (cold start)
- ❌ Poor user experience
- ❌ Timeouts on initial requests

## ✅ Solution

Keep the service alive by pinging it regularly (every 10 minutes).

---

## 🚀 Option 1: GitHub Actions (Recommended - FREE!)

**Pros:**
- ✅ Completely free
- ✅ Runs automatically in the cloud
- ✅ No local setup needed
- ✅ Reliable and maintenance-free

**Setup:**

1. **Add GitHub Secret:**
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `RENDER_SCRAPER_URL`
   - Value: `https://your-scraper-service.onrender.com`

2. **Enable GitHub Actions:**
   - The workflow file is already created: `.github/workflows/keep-render-alive.yml`
   - Push to GitHub
   - Go to Actions tab → Enable workflows

3. **Verify:**
   - Go to Actions tab
   - You should see "Keep Render Service Alive" workflow
   - It runs every 10 minutes automatically

**Manual Trigger:**
- Go to Actions → Keep Render Service Alive → Run workflow

---

## 🖥️ Option 2: Local Script (Simple)

**Pros:**
- ✅ Simple to understand
- ✅ No dependencies

**Cons:**
- ❌ Must run on your computer 24/7
- ❌ Stops when computer sleeps

**Setup:**

1. **Set environment variable:**
   ```bash
   # Windows PowerShell
   $env:RENDER_SCRAPER_URL="https://your-scraper-service.onrender.com"
   
   # Mac/Linux
   export RENDER_SCRAPER_URL="https://your-scraper-service.onrender.com"
   ```

2. **Run the script:**
   ```bash
   node scrapers/keep-alive.js
   ```

3. **Run in background (Mac/Linux):**
   ```bash
   nohup node scrapers/keep-alive.js > logs/render-pinger.log 2>&1 &
   ```

4. **Run in background (Windows):**
   ```powershell
   Start-Process node -ArgumentList "scrapers/keep-alive.js" -WindowStyle Hidden
   ```

**Stop the script:**
- Press `Ctrl + C` (if running in foreground)
- Or kill the process (if running in background)

---

## ⏰ Option 3: Cron Script (Advanced)

**Pros:**
- ✅ More reliable than setInterval
- ✅ Better for long-running processes

**Cons:**
- ❌ Requires node-cron package
- ❌ Must run on your computer 24/7

**Setup:**

1. **Install dependency:**
   ```bash
   npm install node-cron
   ```

2. **Set environment variable:**
   ```bash
   export RENDER_SCRAPER_URL="https://your-scraper-service.onrender.com"
   ```

3. **Run the script:**
   ```bash
   node scrapers/cron-keep-alive.js
   ```

---

## 🔧 Option 4: External Services

### **UptimeRobot (Free)**

1. Go to [UptimeRobot.com](https://uptimerobot.com)
2. Create free account
3. Add New Monitor:
   - Monitor Type: HTTP(s)
   - Friendly Name: Render Scraper
   - URL: `https://your-scraper-service.onrender.com/health`
   - Monitoring Interval: 5 minutes (free tier)
4. Save

**Pros:**
- ✅ Free tier available
- ✅ Runs in cloud
- ✅ Email alerts on downtime
- ✅ Status page

### **Cron-Job.org (Free)**

1. Go to [Cron-Job.org](https://cron-job.org)
2. Create free account
3. Create New Cronjob:
   - Title: Keep Render Alive
   - URL: `https://your-scraper-service.onrender.com/health`
   - Execution: Every 10 minutes
4. Save

**Pros:**
- ✅ Free
- ✅ Simple setup
- ✅ Reliable

---

## 📊 Comparison

| Method | Cost | Reliability | Setup | Maintenance |
|--------|------|-------------|-------|-------------|
| **GitHub Actions** | Free | ⭐⭐⭐⭐⭐ | Easy | None |
| **UptimeRobot** | Free | ⭐⭐⭐⭐⭐ | Easy | None |
| **Cron-Job.org** | Free | ⭐⭐⭐⭐ | Easy | None |
| **Local Script** | Free | ⭐⭐ | Easy | High |
| **Cron Script** | Free | ⭐⭐⭐ | Medium | High |

**Recommendation:** Use **GitHub Actions** (free, reliable, no maintenance)

---

## 🧪 Testing

### **Test GitHub Actions:**
1. Go to GitHub → Actions
2. Click "Keep Render Service Alive"
3. Click "Run workflow"
4. Wait 30 seconds
5. Check logs for ✅ success

### **Test Local Script:**
```bash
node scrapers/keep-alive.js
```

Expected output:
```
🚀 Starting Render Keep-Alive Service
📡 Target: https://your-scraper-service.onrender.com/health
⏱️  Interval: 10 minutes
🕐 Started at: 2025-11-08T...

[2025-11-08T...] 🔄 Ping #1: Checking Render service...
[2025-11-08T...] ✅ Ping #1: SUCCESS (234ms)
   Status: ok
   Stats: 1 success, 0 failures
   Next ping in 10 minutes
```

---

## 🔍 Monitoring

### **Check if Render is Sleeping:**

Visit your Render service URL:
```
https://your-scraper-service.onrender.com/health
```

**If sleeping:**
- ⏱️ Takes 30-60 seconds to respond
- 🔄 Shows "Starting..." message

**If awake:**
- ⚡ Responds in < 1 second
- ✅ Shows health status

### **Check GitHub Actions Logs:**

1. Go to GitHub → Actions
2. Click latest "Keep Render Service Alive" run
3. Check logs for:
   - ✅ Success messages
   - ⏱️ Response times
   - ❌ Any failures

---

## 🚨 Troubleshooting

### **Issue: GitHub Actions not running**

**Solution:**
1. Check if workflows are enabled (Actions tab)
2. Verify cron schedule is valid
3. Check GitHub Actions quotas (2000 min/month free)

### **Issue: Pings failing**

**Solution:**
1. Verify Render URL is correct
2. Check Render service is deployed
3. Verify `/health` endpoint exists
4. Check Render logs for errors

### **Issue: Service still sleeping**

**Solution:**
1. Reduce ping interval (e.g., 5 minutes)
2. Use multiple ping services
3. Check Render free tier limits

---

## 📝 Environment Variables

### **Required:**
```env
RENDER_SCRAPER_URL=https://your-scraper-service.onrender.com
```

### **Optional:**
```env
PING_INTERVAL=600000  # 10 minutes in milliseconds
HEALTH_ENDPOINT=/health
```

---

## 🎯 Best Practices

1. **Use GitHub Actions** for automatic, free pinging
2. **Set interval to 10 minutes** (Render sleeps after 15 min)
3. **Monitor success rate** to ensure reliability
4. **Set up alerts** for failures (UptimeRobot)
5. **Log all pings** for debugging

---

## 📚 Additional Resources

- [Render Free Tier Limits](https://render.com/docs/free)
- [GitHub Actions Cron Syntax](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [UptimeRobot Documentation](https://uptimerobot.com/help/)

---

## ✅ Quick Start (Recommended)

**Use GitHub Actions (2 minutes setup):**

1. Add secret to GitHub:
   ```
   Name: RENDER_SCRAPER_URL
   Value: https://your-scraper-service.onrender.com
   ```

2. Push code to GitHub

3. Enable workflows in Actions tab

4. Done! Service stays awake 24/7 for free! 🎉

---

**Last Updated:** November 8, 2025

