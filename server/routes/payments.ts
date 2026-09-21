import { Router, Request, Response } from 'express';
import { paymentService } from '../services/paymentService';
import { db } from '../db';
import { pool } from '../../src/db/index';

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
      res.status(404).json({ success: false, error: 'Order not found in database.' });
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

    // Associate razorpay_order_id with the order in PostgreSQL
    if (gatewayResult.gatewayOrderId) {
      await pool.query(
        'UPDATE orders SET razorpay_order_id = $1, updated_at = NOW() WHERE id = $2',
        [gatewayResult.gatewayOrderId, order.id]
      );
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

    // Update order payment status directly in PostgreSQL
    const updatedOrder = await db.updateOrderPaymentVerified(orderId, {
      razorpayOrderId,
      razorpayPaymentId,
      paymentDetails: {
        gateway: 'RAZORPAY',
        razorpayOrderId,
        razorpayPaymentId,
        verifiedAt: new Date().toISOString()
      }
    });

    res.json({
      success: true,
      message: 'Payment verified and captured successfully in PostgreSQL database.',
      order: updatedOrder
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Payment verification error.' });
  }
});

/**
 * Secure Razorpay Webhook Listener
 * POST /api/payments/webhook
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawPayload = JSON.stringify(req.body);

    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      res.status(503).json({ success: false, error: 'Webhook processing is unavailable: webhook secret is not configured.' });
      return;
    }

    const isValid = paymentService.verifyWebhookSignature(rawPayload, signature || '');
    if (!isValid) {
      res.status(400).json({ success: false, error: 'Invalid webhook signature.' });
      return;
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload?.payment?.entity;
      const gatewayOrderId = paymentEntity?.order_id || payload?.order?.entity?.id;
      const paymentId = paymentEntity?.id;

      if (gatewayOrderId) {
        const order = await db.getOrderById(gatewayOrderId);
        if (order && order.paymentStatus !== 'PAID') {
          await db.updateOrderPaymentVerified(order.id, {
            razorpayOrderId: gatewayOrderId,
            razorpayPaymentId: paymentId || 'webhook_captured',
            paymentDetails: {
              gateway: 'RAZORPAY',
              razorpayOrderId: gatewayOrderId,
              razorpayPaymentId: paymentId,
              webhookReceivedAt: new Date().toISOString()
            }
          });
          console.log(`[Razorpay Webhook] Order ${order.id} marked as PAID via webhook event ${event}`);
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload?.payment?.entity;
      const gatewayOrderId = paymentEntity?.order_id;
      if (gatewayOrderId) {
        const order = await db.getOrderById(gatewayOrderId);
        if (order && order.paymentStatus === 'PENDING') {
          await pool.query(
            `UPDATE orders SET payment_status = 'FAILED', updated_at = NOW() WHERE id = $1`,
            [order.id]
          );
          console.log(`[Razorpay Webhook] Order ${order.id} payment failed`);
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (err: any) {
    console.error('Razorpay webhook processing error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
