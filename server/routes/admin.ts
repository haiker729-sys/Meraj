import { Router, Request, Response } from 'express';
import { db } from '../db';
import { requireAdmin } from '../middleware/auth';
import { getServiceStatusSummary } from '../../api-key/api-keys';

const router = Router();

// All routes here require admin authorization
router.use(requireAdmin);

/**
 * External Integrations Status (Architecture for Low-Cost Launch v1)
 * GET /api/admin/integrations/status
 */
router.get('/integrations/status', (_req: Request, res: Response) => {
  try {
    const services = getServiceStatusSummary();
    res.json({
      success: true,
      launchTier: 'v1-low-cost-launch',
      database: 'PostgreSQL (Active)',
      codAvailable: true,
      services
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

/**
 * Admin Dashboard Stats (Real calculated metrics)
 * GET /api/admin/stats
 */
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await db.getStats();
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

/**
 * Admin Inventory Overview
 * GET /api/admin/inventory
 */
router.get('/inventory', async (_req: Request, res: Response) => {
  try {
    const { products } = await db.getProducts({ limit: 500 });
    const validProducts = (products || []).filter((p): p is NonNullable<typeof p> => p != null);
    const lowStock = validProducts.filter((p) => p.stock < 5);
    const outOfStock = validProducts.filter((p) => p.stock === 0);
    const totalInventoryUnits = validProducts.reduce((sum, p) => sum + (p.stock || 0), 0);

    res.json({
      success: true,
      inventory: {
        totalProducts: validProducts.length,
        totalUnits: totalInventoryUnits,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        items: products
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

/**
 * Get Store Settings
 * GET /api/admin/settings
 */
router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await db.getSettings();
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

/**
 * Update Store Settings
 * PUT /api/admin/settings
 */
router.put('/settings', async (req: Request, res: Response) => {
  try {
    const updated = await db.updateSettings(req.body);
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

/**
 * List Admins
 * GET /api/admin/users
 */
router.get('/users', async (_req: Request, res: Response) => {
  try {
    const admins = await db.getAdmins();
    res.json({ success: true, admins });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

/**
 * Create Admin
 * POST /api/admin/users
 */
router.post('/users', async (req: Request, res: Response) => {
  try {
    const { username, password, fullName, role, phone, email } = req.body;
    if (!username || !password || !fullName) {
      return res.status(400).json({ success: false, error: 'Username, password, and full name are required.' });
    }
    const created = await db.createAdmin({ username, password, fullName, role, phone, email });
    res.json({ success: true, admin: created });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to create admin.' });
  }
});

/**
 * Update Admin (status, password, role, details)
 * PUT /api/admin/users/:id
 */
router.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive, role, fullName, phone, email, password } = req.body;
    const success = await db.updateAdmin(id, { isActive, role, fullName, phone, email, password });
    res.json({ success, message: success ? 'Admin updated successfully.' : 'Admin not found.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update admin.' });
  }
});

/**
 * Delete Admin
 * DELETE /api/admin/users/:id
 */
router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentAdmin = (req as any).admin;
    if (currentAdmin && currentAdmin.id === id) {
      return res.status(400).json({ success: false, error: 'You cannot delete your own admin account.' });
    }
    const success = await db.deleteAdmin(id);
    res.json({ success, message: success ? 'Admin account permanently deleted.' : 'Admin not found.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to delete admin.' });
  }
});

const ALLOWED_STATUSES = [
  'ORDER_PLACED',
  'PAYMENT_PENDING',
  'PAYMENT_CONFIRMED',
  'PROCESSING',
  'PACKED',
  'READY_TO_SHIP',
  'SHIPPED',
  'IN_TRANSIT',
  'ARRIVED_AT_FACILITY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURN_REQUESTED',
  'RETURNED',
  'REFUNDED'
];

/**
 * Admin: Update Order Tracking Event
 * POST /api/admin/orders/:id/tracking
 */
router.post('/orders/:id/tracking', async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const { status, location, description, courierName, awbNumber } = req.body;
    const adminUser = (req as any).user;

    if (!status) {
      res.status(400).json({ success: false, error: 'Status is required.' });
      return;
    }

    const upperStatus = status.toUpperCase();
    if (!ALLOWED_STATUSES.includes(upperStatus)) {
      res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}`
      });
      return;
    }

    if (!description || !description.trim()) {
      res.status(400).json({ success: false, error: 'Event description / update note is required.' });
      return;
    }

    const result = await db.addOrderTrackingEvent({
      orderId,
      status: upperStatus,
      location: location?.trim() || undefined,
      description: description.trim(),
      source: 'ADMIN',
      scannedBy: adminUser?.username || adminUser?.fullName || 'STORE_ADMIN',
      courierName: courierName?.trim() || undefined,
      awbNumber: awbNumber?.trim() || undefined
    });

    if (!result) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    res.json({
      success: true,
      message: `Order status updated to ${upperStatus}.`,
      order: result.order,
      event: result.event
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update tracking.' });
  }
});

/**
 * Admin: Lookup Order via QR Code Token
 * GET /api/admin/tracking/scan/:token
 */
router.get('/tracking/scan/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const order = await db.getOrderByTrackingToken(token);

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'No parcel found matching this QR code tracking token.'
      });
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
 * Admin: Submit QR Scanner Tracking Event
 * POST /api/admin/tracking/scan
 */
router.post('/tracking/scan', async (req: Request, res: Response) => {
  try {
    const { token, status, location, description, courierName, awbNumber } = req.body;
    const adminUser = (req as any).user;

    if (!token) {
      res.status(400).json({ success: false, error: 'Tracking token or QR payload is required.' });
      return;
    }

    const order = await db.getOrderByTrackingToken(token);
    if (!order) {
      res.status(404).json({ success: false, error: 'No parcel found matching this QR token.' });
      return;
    }

    // Record the scanner audit event
    await db.recordQrScan({
      orderId: order.id,
      trackingNumber: order.trackingNumber,
      scannedBy: adminUser?.username || adminUser?.fullName || 'STAFF_SCANNER',
      scannerType: 'ADMIN',
      location: location || order.currentLocation
    });

    // If an update is supplied, record the new tracking event
    if (status) {
      const upperStatus = status.toUpperCase();
      if (!ALLOWED_STATUSES.includes(upperStatus)) {
        res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}`
        });
        return;
      }

      const result = await db.addOrderTrackingEvent({
        orderId: order.id,
        status: upperStatus,
        location: location?.trim() || undefined,
        description: description?.trim() || `Parcel scanned and status marked as ${upperStatus}.`,
        source: 'WAREHOUSE',
        scannedBy: adminUser?.username || adminUser?.fullName || 'STAFF_SCANNER',
        courierName: courierName?.trim() || undefined,
        awbNumber: awbNumber?.trim() || undefined
      });

      res.json({
        success: true,
        message: `Parcel scanned and status updated to ${upperStatus}.`,
        order: result?.order,
        event: result?.event
      });
      return;
    }

    // Just lookup + recorded scan
    const trackingEvents = await db.getOrderTrackingEvents(order.id);
    res.json({
      success: true,
      message: 'Parcel scanned successfully.',
      order,
      trackingEvents
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Scan update failed.' });
  }
});

export default router;
