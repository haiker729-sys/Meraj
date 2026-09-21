import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { generateToken, requireAdmin, requireSuperAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * Admin Login with Backend Verification
 * POST /api/admin/auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: 'Please enter both your admin username and password.'
      });
      return;
    }

    const admin = await db.getAdminByUsername(username);
    if (!admin) {
      res.status(401).json({
        success: false,
        error: 'Invalid administrator credentials. Access is logged.'
      });
      return;
    }

    const isValid = bcrypt.compareSync(password, admin.passwordHash);
    if (!isValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid administrator credentials. Access is logged.'
      });
      return;
    }

    // Generate Admin JWT Token
    const token = generateToken({
      id: admin.id,
      username: admin.username,
      role: admin.role,
      fullName: admin.fullName,
      email: admin.email
    });

    const { passwordHash: _, ...safeAdmin } = admin;

    res.json({
      success: true,
      message: 'Admin authorization granted.',
      token,
      admin: safeAdmin
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

/**
 * Get Current Admin Profile
 * GET /api/admin/auth/me
 */
router.get('/me', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = await db.getAdminByUsername(req.user!.username || '');
    if (!admin) {
      res.status(404).json({ success: false, error: 'Admin record not found.' });
      return;
    }
    const { passwordHash: _, ...safeAdmin } = admin;
    res.json({ success: true, admin: safeAdmin });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

/**
 * List all Admins
 * GET /api/admin/auth/list
 */
router.get('/list', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const admins = await db.getAdmins();
    res.json({ success: true, admins });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

/**
 * Add New Admin (Super Admin only)
 * POST /api/admin/auth/create
 */
router.post('/create', requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username, password, fullName, role, phone, email } = req.body;

    if (!username || !password || !fullName) {
      res.status(400).json({ success: false, error: 'Username, password, and full name are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
      return;
    }

    const newAdmin = await db.createAdmin({
      username,
      password,
      fullName,
      role: role || 'STORE_MANAGER',
      phone,
      email
    });

    res.status(201).json({
      success: true,
      message: `Admin account "${username}" created successfully.`,
      admin: newAdmin
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Could not create admin.' });
  }
});

/**
 * Change Admin Password
 * POST /api/admin/auth/change-password
 */
router.post('/change-password', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, error: 'Both current and new password are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
      return;
    }

    const admin = await db.getAdminByUsername(req.user!.username || '');
    if (!admin) {
      res.status(404).json({ success: false, error: 'Admin record not found.' });
      return;
    }

    const isCurrentValid = bcrypt.compareSync(currentPassword, admin.passwordHash);
    if (!isCurrentValid) {
      res.status(401).json({ success: false, error: 'Incorrect current password.' });
      return;
    }

    await db.updateAdminPassword(admin.id, newPassword);

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

export default router;
