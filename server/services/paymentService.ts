import crypto from 'crypto';

export interface RazorpayOrderParams {
  amount: number; // in INR rupees
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentVerificationParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

class BackendPaymentService {
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  }

  public isConfigured(): boolean {
    return Boolean(this.keyId && this.keySecret);
  }

  public getPublicConfig() {
    return {
      isConfigured: this.isConfigured(),
      keyId: this.keyId ? this.keyId : null,
      currency: 'INR'
    };
  }

  /**
   * Creates a real order with Razorpay Orders API
   */
  public async createGatewayOrder(params: RazorpayOrderParams): Promise<{
    success: boolean;
    gatewayOrderId?: string;
    amountInPaise?: number;
    currency?: string;
    error?: string;
  }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error:
          'Razorpay payment gateway credentials (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) are not configured on the server. Please configure your environment variables to accept live online UPI/Card payments, or use Cash on Delivery (COD).'
      };
    }

    try {
      const amountInPaise = Math.round(params.amount * 100);
      const authHeader = 'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');

      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: params.currency || 'INR',
          receipt: params.receipt,
          notes: params.notes || {}
        })
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data.error?.description || 'Failed to initiate order with Razorpay gateway.'
        };
      }

      return {
        success: true,
        gatewayOrderId: data.id,
        amountInPaise: data.amount,
        currency: data.currency
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error communicating with payment gateway.'
      };
    }
  }

  /**
   * Cryptographically verifies Razorpay signature via HMAC SHA256:
   * hmac = HMAC_SHA256(order_id + "|" + payment_id, secret)
   */
  public verifySignature(params: PaymentVerificationParams): boolean {
    if (!this.isConfigured()) return false;

    const payload = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(params.razorpaySignature, 'hex')
    );
  }

  /**
   * Verifies Razorpay Webhook signature
   */
  public verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!this.webhookSecret) return false;
    const expected = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');
    return expected === signature;
  }
}

export const paymentService = new BackendPaymentService();
