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
 * Create a checkout session using Dodo Payments SDK with retry logic
 */
export async function createCheckoutSession(params: CreateCheckoutParams, retries = 3) {
  let lastError: any;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
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

      console.log(`📤 Creating checkout session (attempt ${attempt}/${retries}):`, {
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
      lastError = error;
      console.error(`❌ Dodo Payments checkout error (attempt ${attempt}/${retries}):`, {
        message: error.message,
        status: error.status,
        code: error.code,
      });

      // Don't retry on client errors (4xx)
      if (error.status && error.status >= 400 && error.status < 500) {
        break;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < retries) {
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`⏳ Retrying in ${waitTime / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw new Error(`Failed to create checkout after ${retries} attempts: ${lastError?.message || 'Unknown error'}`);
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
 * Handles Dodo Payments webhook structure
 */
export async function processPaymentWebhook(payload: any) {
  const eventType = payload.type;
  const data = payload.data;
  const payloadType = data?.payload_type; // 'Payment' or 'Subscription'

  console.log('📨 Processing webhook:', {
    eventType,
    payloadType,
    paymentId: data?.payment_id,
    checkoutSessionId: data?.checkout_session_id,
    status: data?.status,
    totalAmount: data?.total_amount,
    currency: data?.currency,
  });

  // Handle successful payments
  if (payloadType === 'Payment' && eventType === 'payment.succeeded' && data?.status === 'succeeded') {
    const metadata = data.metadata || {};
    const paymentId = data.payment_id;
    const totalAmount = data.total_amount || data.settlement_amount || 0; // Amount in cents
    const currency = data.currency || 'USD';
    const customerEmail = data.customer?.email;
    const productCart = data.product_cart || [];

    console.log('💰 Payment succeeded:', {
      paymentId,
      totalAmount,
      currency,
      customerEmail,
      metadata,
      productCart,
    });

    // Extract userId and credits from metadata
    const userId = metadata.userId || metadata.user_id;
    const credits = metadata.credits ? parseInt(metadata.credits) : 0;

    if (!userId) {
      console.error('❌ No userId found in metadata:', metadata);
      return null;
    }

    if (!credits || credits <= 0) {
      console.error('❌ Invalid credits amount:', credits);
      return null;
    }

    return {
      userId,
      credits,
      amount: totalAmount / 100, // Convert from cents to dollars
      paymentId,
      currency,
      customerEmail,
      checkoutSessionId: data.checkout_session_id,
      productCart,
    };
  }

  // Handle payment failures
  if (eventType === 'payment.failed') {
    const metadata = data.metadata || {};
    const userId = metadata.userId || metadata.user_id;
    const customerEmail = data.customer?.email;
    
    console.error('❌ PAYMENT FAILED:', {
      paymentId: data?.payment_id,
      checkoutSessionId: data?.checkout_session_id,
      userId,
      customerEmail,
      errorCode: data?.error_code,
      errorMessage: data?.error_message,
      cardLastFour: data?.card_last_four,
      cardNetwork: data?.card_network,
      totalAmount: data?.total_amount,
      currency: data?.currency,
      status: data?.status,
    });
    
    // Log to webhook_events for tracking
    return {
      type: 'payment_failed',
      paymentId: data?.payment_id,
      userId,
      customerEmail,
      errorCode: data?.error_code,
      errorMessage: data?.error_message,
    };
  }

  // Handle payment cancellations
  if (eventType === 'payment.cancelled') {
    const metadata = data.metadata || {};
    const userId = metadata.userId || metadata.user_id;
    const customerEmail = data.customer?.email;
    
    console.warn('⚠️ PAYMENT CANCELLED:', {
      paymentId: data?.payment_id,
      checkoutSessionId: data?.checkout_session_id,
      userId,
      customerEmail,
    });
    
    return {
      type: 'payment_cancelled',
      paymentId: data?.payment_id,
      userId,
      customerEmail,
    };
  }

  console.log('❓ Unhandled webhook event:', eventType, 'payload_type:', payloadType);
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
