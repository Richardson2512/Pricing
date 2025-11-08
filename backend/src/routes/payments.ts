import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { createCheckoutSession, getProductIdForCredits, processPaymentWebhook, verifyDodoWebhookSignature } from '../services/dodoPayments';

const router = Router();

// Credit packages (must match Dodo Payments products)
const CREDIT_PACKAGES = [
  { credits: 5, price: 10, name: 'Starter' },
  { credits: 10, price: 15, name: 'Professional' },
  { credits: 20, price: 25, name: 'Business' },
  { credits: 50, price: 50, name: 'Enterprise' },
];

/**
 * POST /api/payments/create-checkout
 * Create a checkout session using Dodo Payments product ID
 */
router.post('/create-checkout', async (req, res) => {
  try {
    const { credits, userId } = req.body;

    // Validate package
    const selectedPackage = CREDIT_PACKAGES.find(pkg => pkg.credits === credits);
    if (!selectedPackage) {
      return res.status(400).json({ error: 'Invalid credit package' });
    }

    // Get product ID for this credit amount
    const productId = getProductIdForCredits(credits);
    if (!productId) {
      return res.status(400).json({ error: 'Product not configured for this credit amount' });
    }

    // Get user email for receipt
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, first_name')
      .eq('id', userId)
      .single();

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Determine frontend URL based on environment
    const frontendUrl = process.env.FRONTEND_URL || 'https://howmuchshouldiprice.com';

    // Create checkout session with product ID and discount code support
    const checkout = await createCheckoutSession({
      productId,
      quantity: 1,
      metadata: {
        userId,
        credits: credits.toString(),
        packageType: selectedPackage.name.toLowerCase(),
      },
      successUrl: `${frontendUrl}/dashboard?payment=success&credits=${credits}`,
      cancelUrl: `${frontendUrl}/dashboard?payment=cancelled`,
      customerEmail: profile.email,
      allowDiscountCodes: true, // Enable discount code input at checkout
      discountCodeId: process.env.DODO_DISCOUNT_CODE_ID, // Optional: Pre-apply discount code
    });

    console.log(`✅ Checkout created for ${credits} credits (${selectedPackage.name}) - User: ${userId}`);

    res.json({
      checkoutUrl: checkout.url,
      sessionId: checkout.id,
    });
  } catch (error: any) {
    console.error('❌ Checkout creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
});

/**
 * POST /api/payments/webhook
 * Handle Dodo Payments webhooks with signature verification
 */
router.post('/webhook', async (req, res) => {
  try {
    // Extract webhook headers
    const webhookId = req.headers['webhook-id'] as string;
    const webhookTimestamp = req.headers['webhook-timestamp'] as string;
    const webhookSignature = req.headers['webhook-signature'] as string;
    
    // Get raw payload (important: must be exact string sent by Dodo)
    const rawPayload = (req as any).rawBody || JSON.stringify(req.body);

    // Verify webhook signature
    const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
    if (webhookSecret && webhookSignature) {
      const { verifyDodoWebhookSignature } = await import('../services/dodoPayments.js');
      const isValid = verifyDodoWebhookSignature(
        webhookId,
        webhookTimestamp,
        rawPayload,
        webhookSignature,
        webhookSecret
      );

      if (!isValid) {
        console.error('❌ Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
      
      console.log('✅ Webhook signature verified');
    } else {
      console.warn('⚠️ Webhook signature verification skipped (no secret configured)');
    }

    // Check for duplicate webhook (idempotency)
    const { data: existingWebhook } = await supabaseAdmin
      .from('webhook_events')
      .select('id')
      .eq('webhook_id', webhookId)
      .single();

    if (existingWebhook) {
      console.log(`⚠️ Duplicate webhook ignored: ${webhookId}`);
      return res.json({ received: true, status: 'duplicate' });
    }

    // Log webhook event for tracking
    await supabaseAdmin
      .from('webhook_events')
      .insert({
        webhook_id: webhookId,
        event_type: req.body.type,
        payload: req.body,
        processed_at: new Date().toISOString(),
      });

    // Process webhook based on event type
    const result = await processPaymentWebhook(req.body);

    if (result) {
      // Update user credits in database
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('credits')
        .eq('id', result.userId)
        .single();

      if (profile) {
        const newCredits = (profile.credits || 0) + result.credits;

        // Update credits
        await supabaseAdmin
          .from('profiles')
          .update({ credits: newCredits })
          .eq('id', result.userId);

        // Record purchase
        await supabaseAdmin
          .from('credit_purchases')
          .insert({
            user_id: result.userId,
            credits_purchased: result.credits,
            amount_paid: result.amount,
            payment_id: result.paymentId,
            purchase_date: new Date().toISOString(),
          });

        console.log(`✅ Credits added: ${result.credits} credits to user ${result.userId} (Payment: ${result.paymentId})`);
      }
    }

    // Always respond with 200 OK to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('❌ Webhook processing error:', error);
    // Still return 200 to prevent retries for unrecoverable errors
    res.status(200).json({ received: true, error: error.message });
  }
});

/**
 * GET /api/payments/verify/:paymentId
 * Verify payment status (for client-side confirmation)
 */
router.get('/verify/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { userId } = req.query;

    // Check if payment was already processed
    const { data: purchase } = await supabaseAdmin
      .from('credit_purchases')
      .select('*')
      .eq('payment_id', paymentId)
      .single();

    if (purchase) {
      return res.json({
        status: 'completed',
        credits: purchase.credits_purchased,
        amount: purchase.amount_paid,
      });
    }

    res.json({
      status: 'pending',
      message: 'Payment is being processed',
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

export default router;

