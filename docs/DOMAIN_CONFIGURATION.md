# 🌐 Domain Configuration Guide
## howmuchshouldiprice.com

This document tracks all places where the custom domain needs to be configured.

---

## ✅ Configuration Checklist

### 1. **Vercel Frontend** ✓ (Action Required)

**Steps:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your frontend project
3. Navigate to **Settings** → **Domains**
4. Click **"Add Domain"**
5. Add both:
   - `howmuchshouldiprice.com`
   - `www.howmuchshouldiprice.com`

**DNS Records to Add (at your domain registrar):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Wait Time:** 5-60 minutes for DNS propagation

---

### 2. **Railway Backend Environment** ✓ (Action Required)

**Update Environment Variable:**
```bash
# Via Railway Dashboard
FRONTEND_URL=https://howmuchshouldiprice.com

# Or via CLI
railway variables set FRONTEND_URL="https://howmuchshouldiprice.com"
```

**Then redeploy:**
```bash
railway up
```

---

### 3. **Supabase Configuration** ✓ (Action Required)

**A. Update Site URL:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Update **Site URL**: `https://howmuchshouldiprice.com`

**B. Add Redirect URLs:**
Add these to **Redirect URLs** section:
```
https://howmuchshouldiprice.com
https://howmuchshouldiprice.com/*
https://howmuchshouldiprice.com/signin
https://howmuchshouldiprice.com/signup
https://howmuchshouldiprice.com/dashboard
https://www.howmuchshouldiprice.com
https://www.howmuchshouldiprice.com/*
```

**C. Update Email Templates (Optional):**
- Go to **Authentication** → **Email Templates**
- Update confirmation and reset password emails
- Replace any Vercel URLs with `https://howmuchshouldiprice.com`

---

### 4. **Code Updates** ✅ (Completed)

All email addresses and URLs in code have been updated:

**Files Updated:**
- ✅ `frontend/src/components/Footer.tsx`
  - Email: `support@howmuchshouldiprice.com`
  
- ✅ `frontend/src/components/CreditPurchase.tsx`
  - Email: `support@howmuchshouldiprice.com`
  
- ✅ `frontend/src/components/PricingAnalysisResult.tsx`
  - URL: `https://howmuchshouldiprice.com`
  - Brand: "HowMuchShouldIPrice"
  
- ✅ `frontend/src/pages/Terms.tsx`
  - Email: `support@howmuchshouldiprice.com`
  
- ✅ `frontend/src/pages/Contact.tsx`
  - Email: `support@howmuchshouldiprice.com`
  - Email: `sales@howmuchshouldiprice.com`
  - Email: `partners@howmuchshouldiprice.com`

---

### 5. **Email Setup** ✓ (Action Required)

**Set up email forwarding for your domain:**

You'll need to create these email addresses:
- `support@howmuchshouldiprice.com` (Primary support)
- `sales@howmuchshouldiprice.com` (Sales inquiries)
- `partners@howmuchshouldiprice.com` (Partnership requests)

**Options:**

**A. Domain Registrar Email Forwarding:**
Most registrars (GoDaddy, Namecheap, etc.) offer free email forwarding:
1. Log into your domain registrar
2. Find "Email Forwarding" settings
3. Forward all emails to your personal email

**B. Google Workspace (Paid - $6/month):**
- Professional email hosting
- Gmail interface
- 30GB storage per user

**C. Zoho Mail (Free for 5 users):**
- Free professional email
- 5GB storage per user
- Web interface

**D. Cloudflare Email Routing (Free):**
1. Transfer domain to Cloudflare (free)
2. Enable Email Routing
3. Forward to any email address

---

### 6. **Analytics & SEO** ✓ (Optional)

**Google Analytics:**
- Update property URL to `howmuchshouldiprice.com`

**Google Search Console:**
1. Add new property: `https://howmuchshouldiprice.com`
2. Verify ownership
3. Submit sitemap

**Social Media:**
- Update website links on Twitter, LinkedIn, etc.
- Update Open Graph meta tags (if needed)

---

### 7. **SSL Certificate** ✅ (Automatic)

Vercel automatically provisions SSL certificates via Let's Encrypt.
- No action required
- HTTPS enforced automatically
- Auto-renewal every 90 days

---

## 🔄 Deployment Steps

### Step 1: Update Code (Already Done ✅)
```bash
git add .
git commit -m "Update domain to howmuchshouldiprice.com"
git push origin main
```

### Step 2: Configure Vercel Domain
1. Add domain in Vercel Dashboard
2. Update DNS records at registrar
3. Wait for DNS propagation (check: `dig howmuchshouldiprice.com`)

### Step 3: Update Backend Environment
```bash
railway variables set FRONTEND_URL="https://howmuchshouldiprice.com"
railway up
```

### Step 4: Update Supabase URLs
- Update Site URL
- Add all redirect URLs
- Test authentication flow

### Step 5: Set Up Email Forwarding
- Choose email provider
- Configure forwarding rules
- Test by sending to support@howmuchshouldiprice.com

### Step 6: Test Everything
- [ ] Visit https://howmuchshouldiprice.com
- [ ] Test user registration
- [ ] Test user login
- [ ] Test questionnaire
- [ ] Test email links in footer
- [ ] Test contact form
- [ ] Check SSL certificate (padlock icon)
- [ ] Test www redirect

---

## 🧪 Testing Commands

**Check DNS Propagation:**
```bash
# Check A record
nslookup howmuchshouldiprice.com

# Check CNAME
nslookup www.howmuchshouldiprice.com

# Detailed DNS info
dig howmuchshouldiprice.com
```

**Test SSL Certificate:**
```bash
curl -I https://howmuchshouldiprice.com
```

**Test Backend CORS:**
```bash
curl -H "Origin: https://howmuchshouldiprice.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://your-backend.railway.app/health
```

---

## 🐛 Troubleshooting

### Issue: Domain not resolving
**Solution:**
- Wait 24-48 hours for full DNS propagation
- Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
- Check DNS records at registrar

### Issue: CORS errors after domain change
**Solution:**
```bash
# Update Railway backend
railway variables set FRONTEND_URL="https://howmuchshouldiprice.com"
railway up

# Verify in backend logs
railway logs
```

### Issue: Supabase auth not working
**Solution:**
1. Verify Site URL in Supabase dashboard
2. Check all redirect URLs are added
3. Test with incognito/private browsing
4. Clear browser cookies

### Issue: Email not working
**Solution:**
- Verify email forwarding is set up at registrar
- Check spam folder
- Test with: `echo "Test" | mail -s "Test" support@howmuchshouldiprice.com`

---

## 📊 Post-Configuration Checklist

- [ ] Domain resolves to Vercel
- [ ] www redirects to main domain
- [ ] SSL certificate is active (https://)
- [ ] Backend CORS allows new domain
- [ ] Supabase authentication works
- [ ] Email forwarding is set up
- [ ] All email links work
- [ ] Contact form works
- [ ] Social media links updated
- [ ] Google Analytics updated
- [ ] Search Console verified

---

## 🎉 Success Indicators

Your domain is fully configured when:

✅ `https://howmuchshouldiprice.com` loads your app  
✅ `https://www.howmuchshouldiprice.com` redirects to main domain  
✅ SSL padlock shows in browser  
✅ User can sign up and log in  
✅ Questionnaire works  
✅ Pricing recommendations load  
✅ Emails to support@howmuchshouldiprice.com are received  
✅ No CORS errors in browser console  

---

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Railway backend logs: `railway logs`
3. Verify all environment variables
4. Test locally first
5. Check browser console for errors

---

## 🔗 Important URLs

- **Production Site:** https://howmuchshouldiprice.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Railway Dashboard:** https://railway.app/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Domain Registrar:** (Where you bought the domain)

---

## 📝 Notes

- DNS changes can take up to 48 hours to fully propagate worldwide
- Always test in incognito mode after making changes
- Keep old Vercel URL active during transition period
- Monitor analytics for traffic to old vs new domain
- Set up 301 redirects from old domain if needed

---

**Last Updated:** November 8, 2025  
**Domain:** howmuchshouldiprice.com  
**Status:** Code updated ✅ | Infrastructure pending ⏳

