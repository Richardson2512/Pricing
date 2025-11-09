# GitHub Secrets Setup Guide

## 🔐 **Adding RENDER_SCRAPER_URL Secret**

The GitHub Actions workflow needs the `RENDER_SCRAPER_URL` secret to keep your Render scraper service alive.

---

## 📝 **Step-by-Step Instructions:**

### **1. Go to Repository Settings**
Navigate to:
```
https://github.com/Richardson2512/Pricing/settings/secrets/actions
```

Or manually:
1. Go to your repository: `https://github.com/Richardson2512/Pricing`
2. Click **"Settings"** tab (top right)
3. In the left sidebar, click **"Secrets and variables"**
4. Click **"Actions"**

---

### **2. Create New Secret**
1. Click the green **"New repository secret"** button
2. Fill in the form:
   - **Name:** `RENDER_SCRAPER_URL`
   - **Secret:** `https://pricing-s1on.onrender.com`
3. Click **"Add secret"**

---

### **3. Verify Secret Added**
You should see:
```
RENDER_SCRAPER_URL
Updated X seconds ago
```

---

### **4. Test the Workflow**
1. Go to **"Actions"** tab in your repository
2. Click **"Keep Render Service Alive"** workflow
3. Click **"Run workflow"** dropdown (right side)
4. Click **"Run workflow"** button
5. Wait 10-20 seconds
6. Refresh the page
7. Click on the latest workflow run
8. You should see: ✅ **"Ping successful (HTTP 200)"**

---

## 🔍 **Troubleshooting:**

### **Workflow Still Failing?**

**Check the error message:**

1. **"RENDER_SCRAPER_URL secret not set"**
   - Secret not added yet
   - Follow steps 1-2 above

2. **"Ping failed (connection error)"**
   - Render service might be sleeping (normal for free tier)
   - Wait 10 minutes for next automatic ping
   - Or manually trigger workflow again

3. **"Ping returned HTTP 404"**
   - Wrong URL in secret
   - Update secret to: `https://pricing-s1on.onrender.com`

4. **"Ping returned HTTP 500"**
   - Render service has an error
   - Check Render dashboard logs

---

## ⏰ **How It Works:**

Once the secret is added:
1. GitHub Actions runs every 10 minutes (automatically)
2. Pings `https://pricing-s1on.onrender.com/health`
3. Keeps Render service awake (prevents free tier sleep)
4. Logs success/failure in Actions tab

---

## 🎯 **Expected Output (Success):**

```
🔄 Pinging Render service at Sun Nov  9 05:44:33 UTC 2025
📡 Target: https://pricing-s1on.onrender.com/health
✅ Ping successful (HTTP 200)
📊 Response: {"status":"ok","timestamp":"2025-11-09T05:44:33Z"}
✅ Render service is alive and responding
⏰ Next ping in 10 minutes
```

---

## 🎯 **Expected Output (Before Secret Added):**

```
🔄 Pinging Render service at Sun Nov  9 05:44:33 UTC 2025
⚠️ RENDER_SCRAPER_URL secret not set!
📝 To fix this:
   1. Go to: https://github.com/Richardson2512/Pricing/settings/secrets/actions
   2. Click: 'New repository secret'
   3. Name: RENDER_SCRAPER_URL
   4. Value: https://pricing-s1on.onrender.com
   5. Click: 'Add secret'

⏭️ Skipping ping until secret is configured
```

---

## ✅ **Done!**

Once the secret is added, the workflow will automatically keep your Render service alive every 10 minutes.

No more manual intervention needed! 🎉

---

**Last Updated:** November 9, 2025

