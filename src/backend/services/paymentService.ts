export interface PaymentInitiationParams {
  orderId: string;
  amount: number;
  customerName: string;
  customerMobile: string;
  paymentMethod: 'COD' | 'ONLINE';
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  method: 'COD' | 'ONLINE';
  message: string;
  timestamp: string;
}

class PaymentService {
  /**
   * Process payment for an order.
   * In a real production setup, this delegates to Razorpay, Cashfree, PhonePe, or Stripe.
   */
  public async processPayment(params: PaymentInitiationParams): Promise<PaymentResult> {
    if (params.paymentMethod === 'COD') {
      return {
        success: true,
        method: 'COD',
        message: 'Order placed under Cash on Delivery. Payment will be collected at doorstep.',
        timestamp: new Date().toISOString()
      };
    }

    // Simulate online UPI / Card gateway with guaranteed safety
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockTxnId = `TXN_FP_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    return {
      success: true,
      transactionId: mockTxnId,
      method: 'ONLINE',
      message: 'Instant UPI / Card payment authorized successfully.',
      timestamp: new Date().toISOString()
    };
  }
}

export const paymentService = new PaymentService();
