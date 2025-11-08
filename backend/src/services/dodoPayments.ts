/**
 * Dodo Payments Integration Service
 * Using official Dodo Payments SDK and Standard Webhooks
 */

import DodoPayments from 'dodopayments';
import { Webhook } from 'standardwebhooks';

// Product IDs from Dodo Payments Dashboard
const PRODUCT_IDS: { [key: number]: string } = {
  5: 'pdt_jAHaYI6bUNkXVdTd4tqJ6',   // Starter: 5 credits
  10: 'pdt_c4yyDCsXQsI6GXhJwtfW6',  // Professional: 10 credits
  20: 'pdt_ViYh83fJgoA70GKJ76JXe',  // Business: 20 credits
};

// Initialize Dodo Payments client
const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
});

// Initialize Webhook verifier
const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
let webhookVerifier: Webhook | null = null;

if (webhookSecret && webhookSecret.startsWith('whsec_')) {
  try {
    // Remove whsec_ prefix for standardwebhooks library
    const cleanSecret = webhookSecret.substring(6);
    webhookVerifier = new Webhook(cleanSecret);
    console.log('✅ Webhook verifier initialized successfully');
  } catch (error: any) {
    console.warn('⚠️ Invalid webhook secret format:', error.message);
  }
} else {
  console.warn('⚠️ No valid webhook secret configured (must start with whsec_)');
}

interface CreateCheckoutParams {
  productId: string;
  quantity: number;
  metadata: {
    userId: string;
    credits: string;
    packageType: string;
  };
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  allowDiscountCodes?: boolean;
}

/**
 * Create a checkout session using Dodo Payments SDK
 */
export async function createCheckoutSession(params: CreateCheckoutParams) {
  try {
    // Build checkout payload
    const checkoutPayload: any = {
      product_cart: [
        {
          product_id: params.productId,
          quantity: params.quantity,
        }
      ],
      feature_flags: {
        allow_discount_code: params.allowDiscountCodes || true, // Enable discount codes
      },
      return_url: params.successUrl,
      customer: {
        email: params.customerEmail || '',
        name: params.customerEmail?.split('@')[0] || 'Customer',
      },
      metadata: params.metadata, // Must be string key-value pairs
    };

    console.log('📤 Creating checkout session:', {
      productId: params.productId,
      credits: params.metadata.credits,
      email: params.customerEmail,
    });

    // Create checkout using SDK
    const checkoutResponse = await dodoClient.checkoutSessions.create(checkoutPayload);

    console.log('✅ Checkout session created:', {
      sessionId: checkoutResponse.session_id,
      checkoutUrl: checkoutResponse.checkout_url,
    });

    return {
      id: checkoutResponse.session_id,
      url: checkoutResponse.checkout_url,
      productId: params.productId,
      status: 'created',
    };
  } catch (error: any) {
    console.error('❌ Dodo Payments checkout error:', error);
    throw new Error(`Failed to create checkout: ${error.message}`);
  }
}

/**
 * Get product ID for credit amount
 */
export function getProductIdForCredits(credits: number): string | null {
  return PRODUCT_IDS[credits] || null;
}

/**
 * Verify webhook signature using Standard Webhooks library
 */
export async function verifyWebhookSignature(
  rawBody: string,
  headers: any
): Promise<boolean> {
  if (!webhookVerifier) {
    console.warn('⚠️ Webhook verification skipped - no verifier configured');
    return true; // Allow webhook if no secret configured (for testing)
  }

  try {
    // Construct webhook headers for Standard Webhooks library
    const webhookHeaders = {
      'webhook-id': headers['webhook-id'] as string,
      'webhook-timestamp': headers['webhook-timestamp'] as string,
      'webhook-signature': headers['webhook-signature'] as string,
    };
    
    // Standard Webhooks library handles the verification
    await webhookVerifier.verify(rawBody, webhookHeaders);
    console.log('✅ Webhook signature verified');
    return true;
  } catch (error: any) {
    console.error('❌ Webhook verification failed:', error.message);
    return false;
  }
}

/**
 * Process payment webhook event
 */
export async function processPaymentWebhook(payload: any) {
  const eventType = payload.type;
  const payloadType = payload.data?.payload_type; // 'Payment' or 'Subscription'

  console.log('📨 Processing webhook:', {
    eventType,
    payloadType,
    paymentId: payload.data?.payment_id,
  });

  // Handle one-time payments
  if (payloadType === 'Payment' && eventType === 'payment.succeeded') {
    const metadata = payload.data?.metadata || {};
    const paymentId = payload.data?.payment_id;
    const amount = payload.data?.amount || 0;

    return {
      userId: metadata.userId || metadata.user_id,
      credits: parseInt(metadata.credits || '0'),
      amount: amount / 100, // Convert from cents to dollars
      paymentId,
    };
  }

  // Handle payment failures
  if (eventType === 'payment.failed' || eventType === 'payment.cancelled') {
    console.warn('⚠️ Payment failed or cancelled:', payload.data?.payment_id);
    return null;
  }

  console.log('❓ Unhandled webhook event:', eventType);
  return null;
}

/**
 * Get payment status using SDK
 */
export async function getPaymentStatus(paymentId: string) {
  try {
    const payment: any = await dodoClient.payments.retrieve(paymentId);
    return {
      status: payment.status,
      amount: payment.total_amount || payment.amount || 0,
      metadata: payment.metadata,
    };
  } catch (error: any) {
    console.error('Failed to get payment status:', error);
    throw new Error(`Failed to get payment status: ${error.message}`);
  }
}
