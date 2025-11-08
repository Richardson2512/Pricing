/**
 * Dodo Payments Integration Service
 * Handles product-based checkout and webhook processing
 */

// Product IDs from Dodo Payments Dashboard
const PRODUCT_IDS: { [key: number]: string } = {
  5: 'pdt_jAHaYI6bUNkXVdTd4tqJ6',   // Starter: 5 credits
  10: 'pdt_c4yyDCsXQsI6GXhJwtfW6',  // Professional: 10 credits
  20: 'pdt_ViYh83fJgoA70GKJ76JXe',  // Business: 20 credits
  50: 'pdt_ViYh83fJgoA70GKJ76JXe',  // Using Business ID for 50 credits (update if you create separate product)
};

interface CreateCheckoutParams {
  productId: string;
  quantity: number;
  metadata: {
    userId: string;
    credits: number;
    packageType: string;
  };
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

interface CheckoutResponse {
  id: string;
  url: string;
  productId: string;
  status: string;
}

const DODO_API_KEY = process.env.DODO_PAYMENTS_API_KEY;
const DODO_BASE_URL = process.env.DODO_PAYMENTS_BASE_URL || 'https://api.dodopayments.com';

/**
 * Create a checkout session for credit purchase using product ID
 */
export async function createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutResponse> {
  if (!DODO_API_KEY) {
    throw new Error('Dodo Payments API key not configured');
  }

  const response = await fetch(`${DODO_BASE_URL}/v1/checkout-sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DODO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: params.productId,
      quantity: params.quantity,
      metadata: params.metadata,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.customerEmail,
    }),
  });

  if (!response.ok) {
    const error: any = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Dodo Payments API error: ${error.message || response.statusText}`);
  }

  const data: any = await response.json();
  return data;
}

/**
 * Get product ID for credit amount
 */
export function getProductIdForCredits(credits: number): string | null {
  return PRODUCT_IDS[credits] || null;
}

/**
 * Verify payment webhook signature
 */
export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  // Implement webhook signature verification based on Dodo Payments documentation
  // This is a placeholder - update based on actual Dodo Payments webhook verification method
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}

/**
 * Process payment webhook
 */
export async function processPaymentWebhook(event: any) {
  const { type, data } = event;

  switch (type) {
    case 'payment.succeeded':
      return {
        userId: data.metadata.userId,
        credits: parseInt(data.metadata.credits),
        amount: data.amount / 100, // Convert from cents
        paymentId: data.id,
      };
    
    case 'payment.failed':
      console.error('Payment failed:', data);
      return null;
    
    default:
      console.log('Unhandled webhook event:', type);
      return null;
  }
}

/**
 * Get payment status
 */
export async function getPaymentStatus(paymentId: string) {
  if (!DODO_API_KEY) {
    throw new Error('Dodo Payments API key not configured');
  }

  const response = await fetch(`${DODO_BASE_URL}/v1/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${DODO_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get payment status: ${response.statusText}`);
  }

  return await response.json();
}

