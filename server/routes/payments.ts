import { Router, Request, Response } from 'express';
import { paymentService } from '../services/paymentService';
import { db } from '../db';

const router = Router();

/**
 * Get Public Payment Gateway Configuration
 * GET /api/payments/config
 */
router.get('/config', (_req: Request, res: Response) => {
  res.json({
    success: true,
    config: paymentService.getPublicConfig()
  });
});

/**
 * Initiate Razorpay Gateway Order
 * POST /api/payments/create-order
 */
router.post('/create-order', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      res.status(400).json({ success: false, error: 'Order ID is required.' });
      return;
    }

    const order = await db.getOrderById(orderId);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    const gatewayResult = await paymentService.createGatewayOrder({
      amount: order.pricing.grandTotal,
      currency: 'INR',
      receipt: order.id,
      notes: {
        customerName: order.customer.fullName,
        customerMobile: order.customer.mobileNumber
      }
    });

    if (!gatewayResult.success) {
      res.status(400).json({
        success: false,
        error: gatewayResult.error
      });
      return;
    }

    res.json({
      success: true,
      gatewayOrderId: gatewayResult.gatewayOrderId,
      amount: gatewayResult.amountInPaise,
      currency: gatewayResult.currency,
      keyId: paymentService.getPublicConfig().keyId
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Payment initiation error.' });
  }
});

/**
 * Cryptographically Verify Razorpay Payment Signature
 * POST /api/payments/verify
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      res.status(400).json({
        success: false,
        error: 'Missing required payment verification parameters.'
      });
      return;
    }

    // Cryptographic HMAC SHA256 Signature Verification
    const isValid = paymentService.verifySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    if (!isValid) {
      res.status(400).json({
        success: false,
        error: 'Invalid payment signature. Payment could not be verified by backend.'
      });
      return;
    }

    // Update order payment status in database
    const order = await db.getOrderById(orderId);
    if (order) {
      order.paymentStatus = 'PAID';
      order.orderStatus = 'CONFIRMED';
      order.paymentDetails = {
        gateway: 'RAZORPAY',
        razorpayOrderId,
        razorpayPaymentId,
        verifiedAt: new Date().toISOString()
      };
      order.timeline.push({
        status: 'PAID',
        title: 'Payment Received',
        description: `Online payment of ₹${order.pricing.grandTotal} captured successfully via Razorpay (Ref: ${razorpayPaymentId}).`,
        timestamp: new Date().toISOString(),
        location: 'Razorpay Gateway'
      });
    }

    res.json({
      success: true,
      message: 'Payment verified and captured successfully by backend.',
      order
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Payment verification error.' });
  }
});

export default router;
