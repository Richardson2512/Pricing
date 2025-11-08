# Dodo Payments Integration Guide

## Overview

This application uses **Dodo Payments** for secure credit card processing. The integration includes:

- ✅ Official Dodo Payments SDK (`dodopayments`)
- ✅ Standard Webhooks library for signature verification
- ✅ Secure webhook handling with idempotency
- ✅ Automatic credit addition via webhooks
- ✅ Retry logic with exponential backoff
- ✅ Payment status polling on frontend
- ✅ Discount code support

---

## Architecture

```
User → Frontend → Backend → Dodo Payments
                     ↑
                     |
              Webhook (payment.succeeded)
                     ↓
              Add Credits to Profile
```

---

## Setup

### 1. Environment Variables

#### Backend (`backend/.env`):
```env
DODO_PAYMENTS_API_KEY=FYvOjH2t4INibzvy.wToYMiSrH4P3-zlOrYCz_aEzXxFCrHcXnndLEyqkKnbvVsYb
DODO_PAYMENTS_BASE_URL=https://api.dodopayments.com
DODO_WEBHOOK_SECRET=whsec_2+WDBN41Up36pUlQZg2SrMML7n9LCluM
DODO_DISCOUNT_CODE_ID=dsc_96AppoW3xINGY23GpHNTm
```

#### Frontend (`frontend/.env`):
```env
VITE_BACKEND_URL=https://pricewise-backend-production.up.railway.app
```

### 2. Product Configuration

Products are configured in `backend/src/services/dodoPayments.ts`:

```typescript
const PRODUCT_IDS: { [key: number]: string } = {
  5: 'pdt_jAHaYI6bUNkXVdTd4tqJ6',   // Starter: 5 credits ($10)
  10: 'pdt_c4yyDCsXQsI6GXhJwtfW6',  // Professional: 10 credits ($15)
  20: 'pdt_ViYh83fJgoA70GKJ76JXe',  // Business: 20 credits ($25)
};
```

### 3. Webhook Configuration

**Dodo Payments Dashboard:**
- Webhook URL: `https://pricewise-backend-production.up.railway.app/api/payments/webhook`
- Events to subscribe: `payment.succeeded`, `payment.failed`, `payment.cancelled`
- Signing Secret: `whsec_2+WDBN41Up36pUlQZg2SrMML7n9LCluM`

---

## Payment Flow

### Step 1: User Clicks "Purchase"
```typescript
// frontend/src/components/CreditPurchase.tsx
const handlePurchase = async (credits: number) => {
  const response = await fetch(`${backendUrl}/api/payments/create-checkout`, {
    method: 'POST',
    body: JSON.stringify({ credits, userId: user.id }),
  });
  
  const { checkoutUrl } = await response.json();
  window.location.href = checkoutUrl; // Redirect to Dodo Payments
};
```

### Step 2: Backend Creates Checkout Session
```typescript
// backend/src/routes/payments.ts
router.post('/create-checkout', async (req, res) => {
  const { credits, userId } = req.body;
  
  const checkout = await createCheckoutSession({
    productId: getProductIdForCredits(credits),
    quantity: 1,
    metadata: { userId, credits: credits.toString() },
    successUrl: `${frontendUrl}/dashboard?payment=success`,
    cancelUrl: `${frontendUrl}/dashboard?payment=cancelled`,
  });
  
  res.json({ checkoutUrl: checkout.url });
});
```

### Step 3: User Completes Payment on Dodo Payments
- User enters card details on Dodo Payments hosted page
- Dodo Payments processes payment
- User redirected back to `successUrl` or `cancelUrl`

### Step 4: Webhook Adds Credits
```typescript
// backend/src/routes/payments.ts
router.post('/webhook', async (req, res) => {
  // 1. Verify signature
  const isValid = await verifyWebhookSignature(rawBody, headers);
  
  // 2. Check for duplicate (idempotency)
  const existing = await supabase
    .from('webhook_events')
    .select('id')
    .eq('webhook_id', webhookId)
    .single();
  
  if (existing) return res.json({ status: 'duplicate' });
  
  // 3. Process payment
  const result = await processPaymentWebhook(payload);
  
  // 4. Add credits
  await supabase
    .from('profiles')
    .update({ credits: oldCredits + result.credits })
    .eq('id', result.userId);
  
  res.json({ received: true });
});
```

### Step 5: Frontend Polls for Credit Update
```typescript
// frontend/src/components/CreditPurchase.tsx
useEffect(() => {
  if (payment === 'success') {
    const pollInterval = setInterval(async () => {
      await refreshProfile(); // Fetch updated credits
      setPaymentStatus('success');
      clearInterval(pollInterval);
    }, 2000);
  }
}, []);
```

---

## Webhook Events

### `payment.succeeded`
```json
{
  "type": "payment.succeeded",
  "data": {
    "payload_type": "Payment",
    "payment_id": "pay_xxx",
    "status": "succeeded",
    "total_amount": 1500,
    "currency": "USD",
    "customer": { "email": "user@example.com" },
    "metadata": { "userId": "abc-123", "credits": "10" }
  }
}
```
**Action:** Add credits to user profile

### `payment.failed`
```json
{
  "type": "payment.failed",
  "data": {
    "payment_id": "pay_xxx",
    "status": "failed",
    "error_code": "PROCESSING_ERROR",
    "error_message": "Card declined"
  }
}
```
**Action:** Log error, no credits added

### `payment.cancelled`
```json
{
  "type": "payment.cancelled",
  "data": {
    "payment_id": "pay_xxx"
  }
}
```
**Action:** Log cancellation, no credits added

---

## Security Features

### 1. Webhook Signature Verification
```typescript
import { Webhook } from 'standardwebhooks';

const webhookVerifier = new Webhook(cleanSecret);
await webhookVerifier.verify(rawBody, webhookHeaders);
```

### 2. Idempotency
```typescript
// Store webhook ID to prevent duplicate processing
await supabase.from('webhook_events').insert({
  webhook_id: webhookId,
  event_type: payload.type,
  payload: payload,
});
```

### 3. Metadata Validation
```typescript
const userId = metadata.userId || metadata.user_id;
const credits = parseInt(metadata.credits);

if (!userId || !credits || credits <= 0) {
  return null; // Invalid webhook
}
```

---

## Error Handling

### Retry Logic (Backend)
```typescript
export async function createCheckoutSession(params, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await dodoClient.checkoutSessions.create(payload);
    } catch (error) {
      if (error.status >= 400 && error.status < 500) break; // Don't retry 4xx
      
      const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}
```

### Payment Status Polling (Frontend)
```typescript
// Poll for 30 seconds after redirect
const pollInterval = setInterval(async () => {
  await refreshProfile();
  if (creditsUpdated) {
    clearInterval(pollInterval);
    setPaymentStatus('success');
  }
}, 2000);

setTimeout(() => clearInterval(pollInterval), 30000);
```

---

## Database Schema

### `profiles` table
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 3;
```

### `credit_purchases` table
```sql
CREATE TABLE credit_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  credits_purchased INTEGER NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_id TEXT UNIQUE NOT NULL,
  purchase_date TIMESTAMPTZ DEFAULT NOW()
);
```

### `webhook_events` table
```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Testing

### Test Cards (Dodo Payments)

**Success:**
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```

**Failure:**
```
Card: 4000 0000 0000 0119
Expiry: Any future date
CVC: Any 3 digits
```

### Test Flow

1. **Local Testing:**
   ```bash
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

2. **Purchase Credits:**
   - Navigate to `/dashboard`
   - Click "Buy Credits"
   - Select package
   - Use test card

3. **Check Logs:**
   - Railway logs: `railway logs`
   - Look for: `✅ SUCCESS: Added X credits`

4. **Verify Database:**
   ```sql
   SELECT * FROM profiles WHERE id = 'user-uuid';
   SELECT * FROM credit_purchases WHERE user_id = 'user-uuid';
   SELECT * FROM webhook_events ORDER BY processed_at DESC LIMIT 10;
   ```

---

## Troubleshooting

### Issue: Webhook not received
**Solution:**
- Check webhook URL in Dodo dashboard
- Verify Railway backend is running
- Check Railway logs for incoming requests

### Issue: Credits not added
**Solution:**
- Check Railway logs for webhook processing
- Verify `metadata.userId` is correct
- Check `webhook_events` table for duplicates

### Issue: Payment fails immediately
**Solution:**
- Verify product IDs in `dodoPayments.ts`
- Check Dodo Payments API key
- Review backend logs for errors

### Issue: Signature verification fails
**Solution:**
- Verify `DODO_WEBHOOK_SECRET` starts with `whsec_`
- Check webhook headers are present
- Ensure raw body is used for verification

---

## Production Checklist

- [ ] Environment variables set in Railway
- [ ] Webhook URL configured in Dodo dashboard
- [ ] Product IDs match Dodo dashboard
- [ ] SSL certificate active (Railway provides)
- [ ] Database migrations run
- [ ] Test payment flow end-to-end
- [ ] Monitor Railway logs for errors
- [ ] Set up error alerting (optional)

---

## Support

- **Dodo Payments Docs:** https://docs.dodopayments.com
- **Dodo Payments Support:** support@dodopayments.com
- **Railway Docs:** https://docs.railway.app

---

**Last Updated:** November 8, 2025
