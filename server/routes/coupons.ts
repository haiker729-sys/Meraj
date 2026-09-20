import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

/**
 * Validate Coupon Code
 * POST /api/coupons/validate
 */
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      res.status(400).json({ success: false, error: 'Coupon code is required.' });
      return;
    }

    const result = await db.validateCoupon(code, Number(subtotal) || 0);
    res.json({
      success: result.valid,
      ...result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

/**
 * List Public Active Coupons
 * GET /api/coupons
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const coupons = await db.getCoupons();
    res.json({ success: true, coupons });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

export default router;
