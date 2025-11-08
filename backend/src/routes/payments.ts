import express, { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { createCheckoutSession, getProductIdForCredits, processPaymentWebhook, verifyWebhookSignature } from '../services/dodoPayments.js';

const router = Router();

// Credit packages (must match Dodo Payments products)
const CREDIT_PACKAGES = [
  { credits: 5, price: 10, name: 'Starter' },
  { credits: 10, price: 15, name: 'Professional' },
  { credits: 20, price: 25, name: 'Business' },
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
 * Handle Dodo Payments webhooks with Standard Webhooks verification
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Get raw body for verification
    const rawBody = req.body.toString('utf8');
    
    console.log('📨 Webhook received:', {
      headers: {
        'webhook-id': req.headers['webhook-id'],
        'webhook-timestamp': req.headers['webhook-timestamp'],
        'webhook-signature': req.headers['webhook-signature'] ? 'present' : 'missing',
      },
      bodyLength: rawBody.length,
    });

    // Verify webhook signature using Standard Webhooks library
    const { verifyWebhookSignature } = await import('../services/dodoPayments.js');
    const isValid = await verifyWebhookSignature(rawBody, req.headers);

    if (!isValid) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    // Parse the verified payload
    const payload = JSON.parse(rawBody);
    const webhookId = req.headers['webhook-id'] as string;

    // Check for duplicate webhook (idempotency)
    const { data: existingWebhook } = await supabaseAdmin
      .from('webhook_events')
      .select('id')
      .eq('webhook_id', webhookId)
      .single();

    if (existingWebhook) {
      console.log(`⚠️ Duplicate webhook ignored: ${webhookId}`);
      return res.status(200).json({ received: true, status: 'duplicate' });
    }

    // Log webhook event for tracking
    await supabaseAdmin
      .from('webhook_events')
      .insert({
        webhook_id: webhookId,
        event_type: payload.type,
        payload: payload,
        processed_at: new Date().toISOString(),
      });

    // Process webhook based on event type
    const result = await processPaymentWebhook(payload);

    if (result && result.credits) {
      console.log('💳 Processing credit addition for user:', result.userId);
      
      // Update user credits in database
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('credits, email')
        .eq('id', result.userId)
        .single();

      if (profileError) {
        console.error('❌ Error fetching profile:', profileError);
        return res.status(200).json({ received: true, error: 'Profile not found' });
      }

      if (profile) {
        const oldCredits = profile.credits || 0;
        const newCredits = oldCredits + result.credits;

        console.log(`💰 Updating credits: ${oldCredits} → ${newCredits} (+${result.credits})`);

        // Update credits
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            credits: newCredits,
            updated_at: new Date().toISOString(),
          })
          .eq('id', result.userId);

        if (updateError) {
          console.error('❌ Error updating credits:', updateError);
          return res.status(200).json({ received: true, error: 'Failed to update credits' });
        }

        // Record purchase
        const { error: purchaseError } = await supabaseAdmin
          .from('credit_purchases')
          .insert({
            user_id: result.userId,
            credits_purchased: result.credits,
            amount_paid: result.amount,
            payment_id: result.paymentId,
            purchase_date: new Date().toISOString(),
          });

        if (purchaseError) {
          console.error('❌ Error recording purchase:', purchaseError);
          // Don't return error - credits were added successfully
        }

        console.log(`✅ SUCCESS: Added ${result.credits} credits to user ${result.userId}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Old balance: ${oldCredits} credits`);
        console.log(`   New balance: ${newCredits} credits`);
        console.log(`   Payment ID: ${result.paymentId}`);
        console.log(`   Amount paid: $${result.amount} ${result.currency || 'USD'}`);
      } else {
        console.warn('⚠️ User profile not found:', result.userId);
      }
    } else if (result && result.type === 'payment_failed') {
      // Log payment failure for debugging
      console.error('💳 Payment failed - no credits added');
      console.error(`   User: ${result.userId || 'unknown'}`);
      console.error(`   Email: ${result.customerEmail || 'unknown'}`);
      console.error(`   Payment ID: ${result.paymentId}`);
      console.error(`   Error Code: ${result.errorCode}`);
      console.error(`   Error Message: ${result.errorMessage}`);
      
      // TODO: Optionally notify user via email about failed payment
    } else if (result && result.type === 'payment_cancelled') {
      // Log payment cancellation
      console.warn('💳 Payment cancelled by user');
      console.warn(`   User: ${result.userId || 'unknown'}`);
      console.warn(`   Email: ${result.customerEmail || 'unknown'}`);
      console.warn(`   Payment ID: ${result.paymentId}`);
    } else {
      console.log('ℹ️ Webhook processed but no action needed (event type not handled)');
    }

    // Always respond with 200 OK to acknowledge receipt
    res.status(200).json({ received: true, success: true });
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

