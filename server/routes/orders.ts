import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { authenticateToken, requireAdmin, AuthenticatedRequest, JWT_SECRET } from '../middleware/auth';
import { notificationService } from '../services/notificationService';

const router = Router();

/**
 * Place Order (Transactional)
 * POST /api/orders
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { customer, shippingAddress, items, paymentMethod, couponCode, customerNote, userId } = req.body;

    // Check if customer is authenticated via Bearer token
    let authenticatedUserId = userId;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.id) {
          authenticatedUserId = decoded.id;
        }
      } catch {
        // Continue if token invalid or expired
      }
    }

    if (!customer || !customer.fullName || !customer.mobileNumber) {
      res.status(400).json({ success: false, error: 'Customer name and 10-digit mobile number are required.' });
      return;
    }

    if (!shippingAddress || !shippingAddress.houseShopNo || !shippingAddress.pinCode || !shippingAddress.city) {
      res.status(400).json({ success: false, error: 'Complete shipping address is required.' });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: 'Your cart is empty. Please add items to checkout.' });
      return;
    }

    if (!['COD', 'ONLINE'].includes(paymentMethod)) {
      res.status(400).json({ success: false, error: 'Invalid payment method. Choose COD or ONLINE.' });
      return;
    }

    // Call transactional order creation in database
    const createdOrder = await db.createOrder({
      userId: authenticatedUserId,
      customer,
      shippingAddress,
      items,
      paymentMethod,
      couponCode,
      customerNote
    });

    // Asynchronously dispatch notifications (SMS / WhatsApp / Email)
    notificationService.dispatchOrderNotification(createdOrder, 'Order Placed').catch((err) => {
      console.warn('[Notification Error]:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order: createdOrder
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Could not process order.' });
  }
});

/**
 * Public Order Tracking
 * GET /api/orders/track/:query
 */
router.get('/track/:query', async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const mobile = (req.query.mobile as string) || undefined;
    const isScan = req.query.scan === 'true';

    const order = await db.trackOrder(query, mobile);
    if (!order) {
      res.status(404).json({
        success: false,
        error: `No active order found matching "${query}". Please verify your Order ID, Tracking Number, or Scan Token.`
      });
      return;
    }

    // A normal customer QR scan must NOT change the parcel status.
    // It only logs a read-only customer QR scan event for audit records.
    if (isScan) {
      await db.recordQrScan({
        orderId: order.id,
        trackingNumber: order.trackingNumber,
        scannerType: 'CUSTOMER',
        location: order.currentLocation
      }).catch(console.warn);
    }

    const trackingEvents = await db.getOrderTrackingEvents(order.id);

    res.json({
      success: true,
      order,
      trackingEvents
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

/**
 * Get Order Tracking Events
 * GET /api/orders/:id/tracking
 */
router.get('/:id/tracking', async (req: Request, res: Response) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    const trackingEvents = await db.getOrderTrackingEvents(order.id);
    res.json({
      success: true,
      order,
      trackingEvents
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

/**
 * Customer: Get My Orders
 * GET /api/orders/my-orders
 */
router.get('/my-orders', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await db.getOrders({ userId: req.user!.id });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

/**
 * Admin: Get All Orders
 * GET /api/orders
 */
router.get('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status, limit, offset } = req.query;
    const result = await db.getOrders({
      status: status as string,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

/**
 * Get Order by ID
 * GET /api/orders/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

/**
 * Admin: Update Order Status
 * PATCH /api/orders/:id/status
 */
router.patch('/:id/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status, courierName, awbNumber, note } = req.body;
    if (!status) {
      res.status(400).json({ success: false, error: 'Status is required.' });
      return;
    }

    const updated = await db.updateOrderStatus(req.params.id, status, courierName, awbNumber, note);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    // Trigger notification on status transition
    notificationService.dispatchOrderNotification(updated, `Status updated to ${status}`).catch(console.warn);

    res.json({ success: true, order: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Could not update status.' });
  }
});

export default router;
