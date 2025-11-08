# 🗄️ Supabase Database Setup Guide

Complete guide to set up your Supabase database for PriceWise.

## 📋 Prerequisites

- Supabase account
- Project created: https://vudjijwnllgxtjpeliff.supabase.co
- Access to SQL Editor in Supabase Dashboard

## 🚀 Step-by-Step Setup

### Step 1: Access SQL Editor

1. Go to: https://supabase.com/dashboard/project/vudjijwnllgxtjpeliff
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run Migration 1 - Create Core Tables

Copy and paste the entire contents of:
```
supabase/migrations/20251107172549_create_pricing_platform_schema.sql
```

This creates:
- ✅ **profiles** table (users + credits)
- ✅ **consultations** table (pricing requests + results)
- ✅ **credit_purchases** table (transaction history)
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance

Click **Run** to execute.

### Step 3: Run Migration 2 - Add Name Fields

Copy and paste the entire contents of:
```
supabase/migrations/20251108_add_name_to_profiles.sql
```

This adds:
- ✅ **first_name** field to profiles
- ✅ **last_name** field to profiles
- ✅ Index for name searches

Click **Run** to execute.

### Step 4: Run Migration 3 - Create Market Listings Table

Copy and paste the entire contents of:
```
supabase/migrations/20251108_create_market_listings_table.sql
```

This creates:
- ✅ **market_listings** table (scraped pricing data)
- ✅ Indexes for source, category, price
- ✅ RLS policies (public read, service role write)
- ✅ Helper functions for market statistics
- ✅ View for latest market data

Click **Run** to execute.

## 🔍 Verify Tables Created

In SQL Editor, run:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';
```

You should see:
- profiles
- consultations
- credit_purchases
- market_listings

## 🧪 Test Data (Optional)

### Create a Test User Profile

```sql
-- Insert test profile (replace with your user ID from auth.users)
INSERT INTO profiles (id, email, first_name, last_name, credits)
VALUES (
  'your-user-id-here',
  'test@example.com',
  'Test',
  'User',
  3
);
```

### Check User Credits

```sql
-- View all profiles
SELECT id, email, first_name, last_name, credits, created_at 
FROM profiles;
```

### Test Market Data

```sql
-- Insert sample market listing
INSERT INTO market_listings (source, title, price, currency, rating, reviews, category)
VALUES 
  ('Fiverr', 'UI/UX Design Service', 1200, 'USD', 4.9, 234, 'design'),
  ('Upwork', 'Web Development', 1500, 'USD', 4.7, 156, 'development');

-- Query market statistics
SELECT * FROM get_market_stats('design');
```

## 🔐 Row Level Security (RLS) Policies

### Profiles Table
- ✅ Users can view their own profile
- ✅ Users can update their own profile
- ✅ Users can insert their own profile (on sign-up)

### Consultations Table
- ✅ Users can view their own consultations
- ✅ Users can insert their own consultations

### Credit Purchases Table
- ✅ Users can view their own purchases
- ✅ Users can insert their own purchases

### Market Listings Table
- ✅ Anyone (authenticated or anonymous) can read
- ✅ Only service role can insert/update (scrapers)

## 📊 Database Schema Overview

### profiles
```sql
id              uuid PRIMARY KEY
email           text NOT NULL
first_name      text
last_name       text
credits         integer DEFAULT 3
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

### consultations
```sql
id                          uuid PRIMARY KEY
user_id                     uuid REFERENCES profiles
business_type               text
target_market               text
product_description         text
cost_to_deliver            text
competitor_pricing         text
value_proposition          text
pricing_recommendation     text
created_at                 timestamptz DEFAULT now()
```

### credit_purchases
```sql
id                  uuid PRIMARY KEY
user_id            uuid REFERENCES profiles
credits_purchased  integer
amount_paid        numeric(10,2)
purchase_date      timestamptz DEFAULT now()
```

### market_listings
```sql
id              uuid PRIMARY KEY
source          text NOT NULL
title           text NOT NULL
price           numeric NOT NULL
currency        text DEFAULT 'USD'
rating          numeric (0-5)
reviews         integer
delivery_time   integer (days)
seller_name     text
seller_level    text
description     text
category        text
url             text
scraped_at      timestamptz DEFAULT now()
created_at      timestamptz DEFAULT now()
```

## 🔧 Troubleshooting

### Issue: "relation 'profiles' does not exist"
**Solution:** Run migration 1 first

### Issue: "column 'first_name' does not exist"
**Solution:** Run migration 2 (add name fields)

### Issue: New users have 0 credits
**Solution:** 
1. Check if migration 1 ran successfully
2. Verify `credits integer DEFAULT 3` in profiles table
3. Check browser console for profile creation errors

### Issue: RLS policy blocks insert
**Solution:**
1. Verify user is authenticated
2. Check RLS policies are created
3. Ensure `auth.uid()` matches user ID

### Issue: Market listings not storing
**Solution:**
1. Run migration 3
2. Verify scrapers use service role key
3. Check RLS policy allows service role writes

## 🎯 Post-Setup Checklist

- [ ] All 3 migrations executed successfully
- [ ] Tables visible in Supabase Table Editor
- [ ] RLS enabled on all tables
- [ ] Test user can sign up and get 3 credits
- [ ] Test user can create consultation
- [ ] Test credit deduction works
- [ ] Market listings table ready for scrapers

## 🔗 Useful Supabase Queries

### Check User Credits
```sql
SELECT email, first_name, credits 
FROM profiles 
ORDER BY created_at DESC;
```

### View Recent Consultations
```sql
SELECT 
  p.email,
  p.first_name,
  c.business_type,
  c.created_at
FROM consultations c
JOIN profiles p ON c.user_id = p.id
ORDER BY c.created_at DESC
LIMIT 10;
```

### Check Credit Purchases
```sql
SELECT 
  p.email,
  cp.credits_purchased,
  cp.amount_paid,
  cp.purchase_date
FROM credit_purchases cp
JOIN profiles p ON cp.user_id = p.id
ORDER BY cp.purchase_date DESC;
```

### Market Data Statistics
```sql
SELECT 
  source,
  COUNT(*) as listings,
  AVG(price) as avg_price,
  MIN(price) as min_price,
  MAX(price) as max_price
FROM market_listings
WHERE scraped_at > NOW() - INTERVAL '7 days'
GROUP BY source;
```

## 🚀 Ready to Use!

After running all migrations:
1. ✅ Users can sign up and get 3 free credits
2. ✅ Users can purchase more credits
3. ✅ Users can create pricing analyses
4. ✅ Credits are deducted properly
5. ✅ Market data can be stored from scrapers
6. ✅ All data is secure with RLS

## 📞 Need Help?

If you encounter issues:
1. Check Supabase logs in Dashboard
2. Verify all migrations ran successfully
3. Test RLS policies with different users
4. Check browser console for errors

---

**Important:** Make sure to run migrations in order:
1. First: `20251107172549_create_pricing_platform_schema.sql`
2. Second: `20251108_add_name_to_profiles.sql`
3. Third: `20251108_create_market_listings_table.sql`

