# Dodo Payments Integration Guide

## Overview

HowMuchShouldIPrice.com uses **Dodo Payments** for secure credit purchases. This guide covers setup, testing, and production deployment.

---

## 🔑 API Key Setup

### Backend Environment Variables

Add to `backend/.env`:
```env
DODO_PAYMENTS_API_KEY=FYvOjH2t4INibzvy.wToYMiSrH4P3-zlOrYCz_aEzXxFCrHcXnndLEyqkKnbvVsYb
DODO_PAYMENTS_BASE_URL=https://api.dodopayments.com
DODO_WEBHOOK_SECRET=whsec_2+WDBN41Up36pUlQZg2SrMML7n9LCluM
DODO_DISCOUNT_CODE_ID=dsc_96AppoW3xINGY23GpHNTm
```

### Railway Environment Variables

Add in **Railway Dashboard** → **Variables**:
```
DODO_PAYMENTS_API_KEY=FYvOjH2t4INibzvy.wToYMiSrH4P3-zlOrYCz_aEzXxFCrHcXnndLEyqkKnbvVsYb
DODO_PAYMENTS_BASE_URL=https://api.dodopayments.com
DODO_WEBHOOK_SECRET=whsec_2+WDBN41Up36pUlQZg2SrMML7n9LCluM
DODO_DISCOUNT_CODE_ID=dsc_96AppoW3xINGY23GpHNTm
FRONTEND_URL=https://howmuchshouldiprice.com
```

**Webhook Configuration:**
- Webhook URL: `https://your-backend.railway.app/api/payments/webhook`
- Webhook Secret: `whsec_2+WDBN41Up36pUlQZg2SrMML7n9LCluM`
- Events: `payment.succeeded`, `payment.failed`

**Discount Code:**
- Discount Code ID: `dsc_96AppoW3xINGY23GpHNTm`
- Enabled at checkout: Users can enter discount codes
- Optional: Pre-apply discount code automatically

---

## 💳 Credit Packages & Product IDs

Fixed packages (no custom amounts):

| Credits | Price | Per Credit | Product ID | Name |
|---------|-------|------------|------------|------|
| 5 | $10 | $2.00 | `pdt_jAHaYI6bUNkXVdTd4tqJ6` | Starter |
| 10 | $15 | $1.50 | `pdt_c4yyDCsXQsI6GXhJwtfW6` | Professional ⭐ |
| 20 | $25 | $1.25 | `pdt_ViYh83fJgoA70GKJ76JXe` | Business |

**Note:** Only 3 packages available. These match the products configured in Dodo Payments dashboard.

---

## 🔄 Payment Flow

### 1. User Clicks "Buy Credits"
- Dashboard → "Buy Credits" button
- Opens `CreditPurchase` modal

### 2. User Selects Package
- Chooses from 4 fixed packages
- Clicks "Purchase" button

### 3. Frontend Creates Checkout
```typescript
POST /api/payments/create-checkout
Body: { credits: 10, userId: "user-uuid" }
```

### 4. Backend Creates Checkout Session
```typescript
// backend/src/routes/payments.ts
- Validates package (5, 10, 20, or 50 credits)
- Gets Dodo Payments product ID for selected package
- Gets user email from Supabase
- Calls Dodo Payments API with product_id
- Returns checkout URL
```

**Product ID Mapping:**
- 5 credits → `pdt_jAHaYI6bUNkXVdTd4tqJ6`
- 10 credits → `pdt_c4yyDCsXQsI6GXhJwtfW6`
- 20 credits → `pdt_ViYh83fJgoA70GKJ76JXe`
- 50 credits → `pdt_ViYh83fJgoA70GKJ76JXe`

### 5. User Redirected to Dodo Payments
```
window.location.href = checkoutUrl
```

### 6. User Completes Payment
- Enters card details on Dodo Payments page
- Dodo Payments processes payment

### 7. Webhook Triggers
```
POST /api/payments/webhook
- Dodo Payments sends webhook
- Backend verifies signature
- Updates user credits
- Records purchase
```

### 8. User Redirected Back
```
Success: /dashboard?payment=success
Cancel: /dashboard?payment=cancelled
```

---

## 🎯 API Endpoints

### Create Checkout Session
```http
POST /api/payments/create-checkout
Content-Type: application/json

{
  "credits": 10,
  "userId": "user-uuid"
}

Response:
{
  "checkoutUrl": "https://checkout.dodopayments.com/...",
  "paymentId": "pay_..."
}
```

### Webhook Handler
```http
POST /api/payments/webhook
webhook-id: evt_abc123xyz
webhook-timestamp: 1699564800
webhook-signature: v1,abc123def456...

{
  "type": "payment.succeeded",
  "data": {
    "id": "pay_...",
    "amount": 1500,
    "metadata": {
      "userId": "user-uuid",
      "credits": "10",
      "packageType": "professional"
    }
  }
}
```

**Webhook Verification Process:**
1. Extract headers: `webhook-id`, `webhook-timestamp`, `webhook-signature`
2. Get raw request body (exact bytes received)
3. Concatenate: `webhook-id.webhook-timestamp.raw_body`
4. Compute HMAC SHA256 with webhook secret
5. Compare with `webhook-signature` header
6. If match → Process webhook
7. If mismatch → Reject with 401

**Idempotency:**
- Each webhook has unique `webhook-id`
- Stored in `webhook_events` table
- Duplicate webhooks are ignored
- Prevents double credit additions

### Verify Payment
```http
GET /api/payments/verify/:paymentId?userId=user-uuid

Response:
{
  "status": "completed",
  "credits": 10,
  "amount": 15
}
```

---

## 🔐 Security

### API Key Storage
- ✅ **Backend only** - Never expose in frontend
- ✅ **Environment variables** - Not in code
- ✅ **Railway secrets** - Encrypted storage

### Webhook Verification
- Verify `X-Dodo-Signature` header
- Prevent replay attacks
- Log all webhook events

### User Validation
- Check user exists before creating payment
- Verify user owns the payment before adding credits
- Prevent duplicate credit additions

---

## 🧪 Testing

### Test Mode (Development)
```env
# Use Dodo Payments test API key
DODO_PAYMENTS_API_KEY=test_key_...
```

### Test Credit Purchase Flow
1. Sign in to dashboard
2. Click "Buy Credits"
3. Select package (e.g., 10 credits)
4. Click "Purchase"
5. Use test card: `4242 4242 4242 4242`
6. Complete checkout
7. Verify credits added to account

### Test Webhook Locally
```bash
# Use ngrok or similar to expose localhost
ngrok http 3001

# Update webhook URL in Dodo Payments dashboard:
https://your-ngrok-url.ngrok.io/api/payments/webhook
```

---

## 🚀 Production Setup

### 1. Dodo Payments Dashboard
- Set webhook URL: `https://your-backend.railway.app/api/payments/webhook`
- Enable webhook events: `payment.succeeded`, `payment.failed`
- Copy webhook secret (if provided)

### 2. Railway Environment Variables
```
DODO_PAYMENTS_API_KEY=FYvOjH2t4INibzvy.wToYMiSrH4P3-zlOrYCz_aEzXxFCrHcXnndLEyqkKnbvVsYb
DODO_PAYMENTS_BASE_URL=https://api.dodopayments.com
DODO_WEBHOOK_SECRET=whsec_... (if provided)
```

### 3. Frontend Environment Variables (Vercel)
```
# No Dodo Payments keys needed in frontend!
# All payment logic is backend-only
```

### 4. Database Migration
Run in Supabase:
```sql
-- Add payment_id column
-- File: supabase/migrations/20251108_add_payment_id_to_purchases.sql
```

---

## 📊 Database Schema

### credit_purchases Table
```sql
CREATE TABLE credit_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  credits_purchased integer NOT NULL,
  amount_paid numeric(10,2) NOT NULL,
  payment_id text UNIQUE,  -- Dodo Payments transaction ID
  purchase_date timestamptz DEFAULT now()
);
```

---

## 🐛 Troubleshooting

### Payment Link Creation Fails
- Check: API key is correct
- Check: Backend environment variables set
- Check: User exists in database
- Check: Package credits are valid (5, 10, 20, 50)

### Webhook Not Received
- Check: Webhook URL is correct in Dodo dashboard
- Check: Railway backend is running
- Check: Webhook endpoint is accessible (test with curl)
- Check: Webhook signature verification (if enabled)

### Credits Not Added After Payment
- Check: Webhook received (check backend logs)
- Check: User ID in metadata matches
- Check: No duplicate payment_id (unique constraint)
- Check: Supabase RLS policies allow updates

---

## 📝 Monitoring

### Backend Logs to Watch
```bash
# Railway logs will show:
✅ Credits added: 10 credits to user abc-123
❌ Payment link creation error: ...
❌ Webhook processing error: ...
```

### Supabase Queries
```sql
-- Recent purchases
SELECT * FROM credit_purchases 
ORDER BY purchase_date DESC 
LIMIT 10;

-- User credit balance
SELECT email, credits FROM profiles 
WHERE id = 'user-uuid';
```

---

## 🎯 Success Indicators

When working correctly:
1. ✅ User clicks "Purchase" → Redirected to Dodo Payments
2. ✅ User completes payment → Redirected back to dashboard
3. ✅ Credits appear in dashboard immediately
4. ✅ Purchase recorded in `credit_purchases` table
5. ✅ Backend logs show successful webhook processing

---

## 📞 Support

**Dodo Payments Issues:**
- Documentation: https://docs.dodopayments.com
- Support: Contact Dodo Payments support team

**Integration Issues:**
- Check backend logs in Railway
- Test webhook with Postman
- Verify API key is active
- Check Supabase permissions

---

## 🔄 Future Enhancements

Potential improvements:
- [ ] Add payment history page
- [ ] Email receipts after purchase
- [ ] Refund handling
- [ ] Multiple currency support
- [ ] Subscription plans (recurring payments)
- [ ] Discount codes/coupons
- [ ] Bulk purchase discounts

