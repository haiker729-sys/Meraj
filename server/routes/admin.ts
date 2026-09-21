import { Router, Request, Response } from 'express';
import { db } from '../db';
import { requireAdmin, requireStaffOrAdmin, requireSuperAdmin, AuthenticatedRequest } from '../middleware/auth';
import { getServiceStatusSummary } from '../../api-key/api-keys';
import { parcelJourneyService, JourneyStage } from '../services/parcelJourneyService';

const router = Router();

// Staff or Admin authorization for dashboard and logistics scanning
router.use(requireStaffOrAdmin);

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
router.get('/users', requireSuperAdmin, async (_req: Request, res: Response) => {
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
router.post('/users', requireSuperAdmin, async (req: Request, res: Response) => {
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
router.put('/users/:id', requireSuperAdmin, async (req: Request, res: Response) => {
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
router.delete('/users/:id', requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    if (currentUser && currentUser.id === id) {
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
 * Admin / Staff: Lookup Order via QR Code Token or Barcode AWB
 * GET /api/admin/tracking/scan/:token
 */
router.get('/tracking/scan/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const order = await parcelJourneyService.findOrder(token);

    if (!order) {
      res.status(404).json({
        success: false,
        error: `No parcel found matching QR / Barcode "${token}".`
      });
      return;
    }

    const trackingEvents = await db.getOrderTrackingEvents(order.id);
    const currentStatus = (order.orderStatus || order.status || 'ORDER_PLACED').toUpperCase();

    // Determine recommended journey stage
    let recommendedStage: JourneyStage = 'ADMIN_SCAN';
    let allowedStages: JourneyStage[] = [];

    if (['ORDER_PLACED', 'NEW', 'PAYMENT_PENDING', 'PAYMENT_CONFIRMED'].includes(currentStatus)) {
      recommendedStage = 'ADMIN_SCAN';
      allowedStages = ['ADMIN_SCAN'];
    } else if (currentStatus === 'CONFIRMED') {
      recommendedStage = 'WAREHOUSE_SCAN';
      allowedStages = ['WAREHOUSE_SCAN'];
    } else if (currentStatus === 'PACKED') {
      recommendedStage = 'WAREHOUSE_SCAN'; // dispatch
      allowedStages = ['WAREHOUSE_SCAN', 'HUB_SCAN'];
    } else if (['DISPATCHED', 'IN_TRANSIT', 'ARRIVED_AT_HUB', 'DEPARTED_FROM_HUB'].includes(currentStatus)) {
      recommendedStage = 'HUB_SCAN';
      allowedStages = ['HUB_SCAN', 'NEXT_HUB_SCAN', 'OUT_FOR_DELIVERY'];
    } else if (currentStatus === 'OUT_FOR_DELIVERY') {
      recommendedStage = 'DELIVERY';
      allowedStages = ['DELIVERY'];
    } else if (currentStatus === 'DELIVERED') {
      allowedStages = [];
    }

    res.json({
      success: true,
      order,
      trackingEvents,
      currentStatus,
      recommendedStage,
      allowedStages,
      isDelivered: currentStatus === 'DELIVERED',
      isCancelled: currentStatus === 'CANCELLED'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

/**
 * Single QR/Barcode Parcel Journey Scanner Endpoint
 * POST /api/admin/tracking/journey-scan
 */
router.post('/tracking/journey-scan', async (req: Request, res: Response) => {
  try {
    const {
      scanInput,
      stage,
      location,
      hubName,
      targetStatus,
      notes,
      recipientName,
      confirmationCode
    } = req.body;
    const authUser = (req as any).user;

    if (!scanInput || !scanInput.trim()) {
      res.status(400).json({ success: false, error: 'Scan input (QR URL or Barcode) is required.' });
      return;
    }

    if (!stage) {
      res.status(400).json({ success: false, error: 'Journey stage is required.' });
      return;
    }

    const result = await parcelJourneyService.processJourneyScan({
      scanInput: scanInput.trim(),
      stage: stage as JourneyStage,
      user: {
        id: authUser?.id || 'STAFF',
        username: authUser?.username,
        fullName: authUser?.fullName || authUser?.username || 'Authorized Staff',
        role: authUser?.role || 'STAFF'
      },
      location,
      hubName,
      targetStatus,
      notes,
      recipientName,
      confirmationCode
    });

    const refreshedEvents = result.order ? await db.getOrderTrackingEvents(result.order.id) : [];

    res.json({
      success: true,
      message: result.message,
      order: result.order,
      event: result.event,
      trackingEvents: refreshedEvents
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Journey scan processing failed.'
    });
  }
});

/**
 * Admin: Submit QR Scanner Tracking Event (Legacy compatibility)
 * POST /api/admin/tracking/scan
 */
router.post('/tracking/scan', async (req: Request, res: Response) => {
  try {
    const { token, stage, status, location, description, courierName, awbNumber, recipientName, hubName } = req.body;
    const adminUser = (req as any).user;

    if (!token) {
      res.status(400).json({ success: false, error: 'Tracking token or QR payload is required.' });
      return;
    }

    // If a journey stage is supplied, use the dedicated parcelJourneyService
    if (stage) {
      const result = await parcelJourneyService.processJourneyScan({
        scanInput: token,
        stage: stage as JourneyStage,
        user: {
          id: adminUser?.id || 'STAFF',
          username: adminUser?.username,
          fullName: adminUser?.fullName || adminUser?.username || 'Staff Scanner',
          role: adminUser?.role || 'STAFF'
        },
        location,
        hubName,
        targetStatus: status,
        notes: description,
        recipientName
      });

      const trackingEvents = result.order ? await db.getOrderTrackingEvents(result.order.id) : [];
      res.json({
        success: true,
        message: result.message,
        order: result.order,
        event: result.event,
        trackingEvents
      });
      return;
    }

    const order = await parcelJourneyService.findOrder(token);
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
    res.status(400).json({ success: false, error: err.message || 'Scan update failed.' });
  }
});

export default router;
