import { Router } from 'express';
import { supabase } from '../config/supabase';
import { createCheckoutSession, getProductIdForCredits, processPaymentWebhook, verifyWebhookSignature } from '../services/dodoPayments';

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
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, first_name')
      .eq('id', userId)
      .single();

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Determine frontend URL based on environment
    const frontendUrl = process.env.FRONTEND_URL || 'https://howmuchshouldiprice.com';

    // Create checkout session with product ID
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
 * Handle Dodo Payments webhooks
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-dodo-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Verify webhook signature (if Dodo Payments provides this)
    // const isValid = verifyWebhookSignature(payload, signature, process.env.DODO_WEBHOOK_SECRET!);
    // if (!isValid) {
    //   return res.status(401).json({ error: 'Invalid webhook signature' });
    // }

    // Process webhook
    const result = await processPaymentWebhook(req.body);

    if (result) {
      // Update user credits in database
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', result.userId)
        .single();

      if (profile) {
        const newCredits = (profile.credits || 0) + result.credits;

        // Update credits
        await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('id', result.userId);

        // Record purchase
        await supabase
          .from('credit_purchases')
          .insert({
            user_id: result.userId,
            credits_purchased: result.credits,
            amount_paid: result.amount,
            payment_id: result.paymentId,
            purchase_date: new Date().toISOString(),
          });

        console.log(`✅ Credits added: ${result.credits} credits to user ${result.userId}`);
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
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
    const { data: purchase } = await supabase
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

