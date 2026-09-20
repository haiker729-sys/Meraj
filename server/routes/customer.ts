import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// All customer routes require authentication
router.use(authenticateToken);

/**
 * GET /api/customer/profile
 * Get authenticated customer's profile details
 */
router.get('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = await db.getCustomerProfile(userId);
    if (!profile) {
      res.status(404).json({ success: false, error: 'Customer profile not found.' });
      return;
    }
    res.json({
      success: true,
      profile: {
        id: profile.id,
        uid: profile.uid,
        fullName: profile.fullName || '',
        mobile: profile.mobile || '',
        email: profile.email || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || '',
        role: profile.role,
        createdAt: profile.createdAt
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch customer profile.' });
  }
});

/**
 * PUT /api/customer/profile
 * Update authenticated customer's profile details
 */
router.put('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { fullName, mobile, email, dateOfBirth, gender } = req.body;

    if (!fullName || !fullName.trim()) {
      res.status(400).json({ success: false, error: 'Full name is required.' });
      return;
    }

    if (!mobile || mobile.replace(/\D/g, '').length < 10) {
      res.status(400).json({ success: false, error: 'A valid 10-digit mobile number is required.' });
      return;
    }

    const updated = await db.updateCustomerProfile(userId, {
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      email: email?.trim() || undefined,
      dateOfBirth: dateOfBirth?.trim() || undefined,
      gender: gender?.trim() || undefined
    });

    if (!updated) {
      res.status(404).json({ success: false, error: 'User account not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: {
        id: updated.id,
        uid: updated.uid,
        fullName: updated.fullName,
        mobile: updated.mobile,
        email: updated.email || '',
        dateOfBirth: updated.dateOfBirth || '',
        gender: updated.gender || '',
        role: updated.role,
        createdAt: updated.createdAt
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update customer profile.' });
  }
});

/**
 * GET /api/customer/addresses
 * List all saved delivery addresses for the authenticated customer
 */
router.get('/addresses', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const addresses = await db.getCustomerAddresses(userId);
    res.json({ success: true, addresses });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch addresses.' });
  }
});

/**
 * POST /api/customer/addresses
 * Add a new delivery address
 */
router.post('/addresses', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      fullName,
      mobileNumber,
      houseBuilding,
      streetArea,
      villageTownCity,
      postOffice,
      district,
      state,
      pinCode,
      landmark,
      addressType,
      isDefault
    } = req.body;

    if (!fullName?.trim() || !mobileNumber?.trim() || !houseBuilding?.trim() || !streetArea?.trim() || !villageTownCity?.trim() || !district?.trim() || !state?.trim() || !pinCode?.trim()) {
      res.status(400).json({
        success: false,
        error: 'Missing required address fields. Please ensure Full Name, Mobile, House/Building, Street/Area, City/Town, District, State, and PIN code are filled.'
      });
      return;
    }

    if (pinCode.replace(/\D/g, '').length !== 6) {
      res.status(400).json({ success: false, error: 'PIN code must contain exactly 6 digits.' });
      return;
    }

    const created = await db.createCustomerAddress(userId, {
      fullName,
      mobileNumber,
      houseBuilding,
      streetArea,
      villageTownCity,
      postOffice,
      district,
      state,
      pinCode: pinCode.replace(/\D/g, ''),
      landmark,
      addressType: addressType || 'HOME',
      isDefault: Boolean(isDefault)
    });

    res.status(201).json({
      success: true,
      message: 'Address saved successfully.',
      address: created
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to save address.' });
  }
});

/**
 * PUT /api/customer/addresses/:id
 * Update an existing delivery address
 */
router.put('/addresses/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const addressId = req.params.id;
    const {
      fullName,
      mobileNumber,
      houseBuilding,
      streetArea,
      villageTownCity,
      postOffice,
      district,
      state,
      pinCode,
      landmark,
      addressType,
      isDefault
    } = req.body;

    if (!fullName?.trim() || !mobileNumber?.trim() || !houseBuilding?.trim() || !streetArea?.trim() || !villageTownCity?.trim() || !district?.trim() || !state?.trim() || !pinCode?.trim()) {
      res.status(400).json({
        success: false,
        error: 'Missing required address fields.'
      });
      return;
    }

    const updated = await db.updateCustomerAddress(addressId, userId, {
      fullName,
      mobileNumber,
      houseBuilding,
      streetArea,
      villageTownCity,
      postOffice,
      district,
      state,
      pinCode: pinCode.replace(/\D/g, ''),
      landmark,
      addressType: addressType || 'HOME',
      isDefault: isDefault !== undefined ? Boolean(isDefault) : undefined
    });

    if (!updated) {
      res.status(404).json({ success: false, error: 'Address not found or unauthorized.' });
      return;
    }

    res.json({
      success: true,
      message: 'Address updated successfully.',
      address: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update address.' });
  }
});

/**
 * DELETE /api/customer/addresses/:id
 * Delete a delivery address
 */
router.delete('/addresses/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const addressId = req.params.id;

    const deleted = await db.deleteCustomerAddress(addressId, userId);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Address not found or unauthorized.' });
      return;
    }

    res.json({ success: true, message: 'Address removed successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to delete address.' });
  }
});

/**
 * PATCH /api/customer/addresses/:id/default
 * Set an address as the default delivery address
 */
router.patch('/addresses/:id/default', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const addressId = req.params.id;

    const success = await db.setDefaultCustomerAddress(addressId, userId);
    if (!success) {
      res.status(404).json({ success: false, error: 'Address not found or unauthorized.' });
      return;
    }

    res.json({ success: true, message: 'Default address updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to set default address.' });
  }
});

/**
 * GET /api/customer/orders
 * Fetch authenticated customer's order history from PostgreSQL
 */
router.get('/orders', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const mobile = req.user!.mobile;
    const email = req.user!.email;

    const orders = await db.getCustomerOrders(userId, mobile, email);
    res.json({ success: true, orders, total: orders.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch customer orders.' });
  }
});

export default router;
