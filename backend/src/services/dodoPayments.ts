/**
 * Dodo Payments Integration Service
 * Handles payment link creation and webhook processing
 */

interface CreatePaymentLinkParams {
  amount: number;
  currency: string;
  description: string;
  metadata: {
    userId: string;
    credits: number;
    packageType: string;
  };
  successUrl: string;
  cancelUrl: string;
}

interface PaymentLinkResponse {
  id: string;
  url: string;
  amount: number;
  currency: string;
  status: string;
}

const DODO_API_KEY = process.env.DODO_PAYMENTS_API_KEY;
const DODO_BASE_URL = process.env.DODO_PAYMENTS_BASE_URL || 'https://api.dodopayments.com';

/**
 * Create a payment link for credit purchase
 */
export async function createPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLinkResponse> {
  if (!DODO_API_KEY) {
    throw new Error('Dodo Payments API key not configured');
  }

  const response = await fetch(`${DODO_BASE_URL}/v1/payment-links`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DODO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: params.amount * 100, // Convert to cents
      currency: params.currency,
      description: params.description,
      metadata: params.metadata,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Dodo Payments API error: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  return data;
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

