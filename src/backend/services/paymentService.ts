import { apiClient } from '../../api/client';

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
  requiresGateway?: boolean;
  unconfigured?: boolean;
}

class PaymentService {
  /**
   * Check if online payment gateway (Razorpay) is configured on the backend
   */
  public async getGatewayConfig() {
    try {
      const res = await apiClient.payments.getConfig();
      return res.config;
    } catch {
      return { isConfigured: false, keyId: null, currency: 'INR' };
    }
  }

  /**
   * Process payment for an order.
   * Real backend verification - no fake success or fake TXN IDs.
   */
  public async processPayment(params: PaymentInitiationParams): Promise<PaymentResult> {
    if (params.paymentMethod === 'COD') {
      return {
        success: true,
        method: 'COD',
        message: 'Order verified under Cash on Delivery (COD). Payment will be collected upon delivery.',
        timestamp: new Date().toISOString()
      };
    }

    // Online Payment: Check backend gateway configuration
    const config = await this.getGatewayConfig();

    if (!config.isConfigured || !config.keyId) {
      return {
        success: false,
        method: 'ONLINE',
        unconfigured: true,
        message:
          'Online payment gateway is currently not configured on this deployment. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables, or select Cash on Delivery (COD) to place your order immediately.',
        timestamp: new Date().toISOString()
      };
    }

    // Real Razorpay flow:
    try {
      const gatewayOrder = await apiClient.payments.createOrder(params.orderId);
      if (!gatewayOrder.success) {
        return {
          success: false,
          method: 'ONLINE',
          message: 'Could not initialize order with Razorpay payment gateway.',
          timestamp: new Date().toISOString()
        };
      }

      // Check if Razorpay SDK is loaded on window
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        return new Promise((resolve) => {
          const options = {
            key: gatewayOrder.keyId,
            amount: gatewayOrder.amount,
            currency: gatewayOrder.currency,
            name: 'Fashion Point',
            description: `Order ${params.orderId}`,
            order_id: gatewayOrder.gatewayOrderId,
            prefill: {
              name: params.customerName,
              contact: params.customerMobile
            },
            theme: {
              color: '#0a0a0a'
            },
            handler: async (response: any) => {
              // Real cryptographic verification on the backend:
              try {
                const verifyRes = await apiClient.payments.verify({
                  orderId: params.orderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                });

                if (verifyRes.success) {
                  resolve({
                    success: true,
                    transactionId: response.razorpay_payment_id,
                    method: 'ONLINE',
                    message: 'Payment captured and cryptographically verified by server.',
                    timestamp: new Date().toISOString()
                  });
                } else {
                  resolve({
                    success: false,
                    method: 'ONLINE',
                    message: 'Payment verification failed on the server.',
                    timestamp: new Date().toISOString()
                  });
                }
              } catch (err: any) {
                resolve({
                  success: false,
                  method: 'ONLINE',
                  message: err.message || 'Payment verification failed.',
                  timestamp: new Date().toISOString()
                });
              }
            },
            modal: {
              ondismiss: () => {
                resolve({
                  success: false,
                  method: 'ONLINE',
                  message: 'Payment cancelled by user in checkout popup.',
                  timestamp: new Date().toISOString()
                });
              }
            }
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        });
      }

      return {
        success: false,
        method: 'ONLINE',
        message: 'Razorpay checkout script is loading. Please select Cash on Delivery or retry.',
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      return {
        success: false,
        method: 'ONLINE',
        message: err.message || 'Error communicating with payment gateway.',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const paymentService = new PaymentService();
