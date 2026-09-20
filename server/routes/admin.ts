import { Router, Request, Response } from 'express';
import { db } from '../db';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// All routes here require admin authorization
router.use(requireAdmin);

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
    const lowStock = products.filter((p) => p.stock < 5);
    const outOfStock = products.filter((p) => p.stock === 0);
    const totalInventoryUnits = products.reduce((sum, p) => sum + p.stock, 0);

    res.json({
      success: true,
      inventory: {
        totalProducts: products.length,
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

export default router;
