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

export default router;
