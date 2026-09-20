import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

/**
 * GET /api/postal/pincode/:pincode
 * Local PostgreSQL lookup for Indian postal PIN codes
 */
router.get('/pincode/:pincode', async (req: Request, res: Response) => {
  try {
    const rawPin = req.params.pincode || '';
    const cleanPin = rawPin.replace(/\D/g, '');

    if (cleanPin.length !== 6) {
      res.status(400).json({
        success: false,
        found: false,
        error: 'PIN code must contain exactly 6 digits.'
      });
      return;
    }

    const records = await db.lookupPostalCode(cleanPin);

    if (!records || records.length === 0) {
      res.status(404).json({
        success: false,
        found: false,
        message: 'PIN code not found. Please enter address manually.',
        error: 'PIN code not found. Please enter address manually.'
      });
      return;
    }

    // Pick first representative record for state, district, and city
    const primary = records[0];
    const postOffices = records.map((r: any) => r.postOffice).filter(Boolean);

    res.json({
      success: true,
      found: true,
      pincode: cleanPin,
      district: primary.district,
      state: primary.state,
      city: primary.city || primary.district,
      postOffices: Array.from(new Set(postOffices))
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      found: false,
      error: err.message || 'Server error while checking PIN code.'
    });
  }
});

export default router;
