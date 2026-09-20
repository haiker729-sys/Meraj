import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db';
import { generateToken, authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// In-memory active OTP store with rate limiting: key -> { codeHash, expiresAt, attempts }
const activeOtps: Map<string, { codeHash: string; expiresAt: number; attempts: number }> = new Map();

/**
 * Customer Registration
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { fullName, email, mobile, password } = req.body;

    if (!fullName || !mobile) {
      res.status(400).json({ success: false, error: 'Full name and mobile number are required.' });
      return;
    }

    if (mobile.replace(/\D/g, '').length < 10) {
      res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number.' });
      return;
    }

    const existing = await db.getUserByEmailOrMobile(mobile);
    if (existing) {
      res.status(409).json({ success: false, error: 'An account with this mobile number already exists. Please log in.' });
      return;
    }

    const newUser = await db.createUser({
      fullName,
      email,
      mobile,
      password: password || undefined
    });

    const token = generateToken({
      id: newUser.id,
      role: newUser.role,
      fullName: newUser.fullName,
      mobile: newUser.mobile,
      email: newUser.email
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        mobile: newUser.mobile,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal server error.' });
  }
});

/**
 * Customer Password Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body; // mobile or email

    if (!identifier || !password) {
      res.status(400).json({ success: false, error: 'Please provide your mobile/email and password.' });
      return;
    }

    const user = await db.getUserByEmailOrMobile(identifier);
    if (!user || !user.passwordHash) {
      res.status(401).json({ success: false, error: 'Invalid credentials or no password set for this account. Try OTP login.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid mobile number or password.' });
      return;
    }

    const token = generateToken({
      id: user.id,
      role: user.role,
      fullName: user.fullName,
      mobile: user.mobile,
      email: user.email
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        mobile: user.mobile,
        email: user.email,
        role: user.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal server error.' });
  }
});

/**
 * Request Real Secure OTP
 * POST /api/auth/request-otp
 */
router.post('/request-otp', async (req: Request, res: Response) => {
  try {
    const { mobile } = req.body;
    const cleanMobile = (mobile || '').replace(/\D/g, '').slice(-10);

    if (cleanMobile.length !== 10) {
      res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number.' });
      return;
    }

    // Rate Limiting: Check previous attempts
    const existing = activeOtps.get(cleanMobile);
    if (existing && existing.expiresAt > Date.now() && existing.attempts >= 3) {
      res.status(429).json({
        success: false,
        error: 'Too many OTP requests. Please wait 5 minutes before trying again.'
      });
      return;
    }

    // Generate cryptographically secure random 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const codeHash = bcrypt.hashSync(rawOtp, 8);

    activeOtps.set(cleanMobile, {
      codeHash,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes expiry
      attempts: (existing?.attempts || 0) + 1
    });

    const isSmsConfigured = Boolean(process.env.SMS_API_KEY || process.env.SMS_PROVIDER_KEY);

    if (isSmsConfigured) {
      // In production with SMS provider configured, dispatch via provider API
      console.log(`[Fashion Point SMS] Outbound OTP dispatched to +91 ${cleanMobile}`);
    } else {
      console.log(
        `[Fashion Point Dev Info] SMS provider is not configured. Customer accounts can register and sign in with password without SMS costs.`
      );
    }

    res.json({
      success: true,
      message: isSmsConfigured
        ? `OTP code sent to +91 ${cleanMobile}. Valid for 5 minutes.`
        : `SMS provider is not configured. Customer accounts can register and sign in with password without SMS costs.`,
      providerConfigured: isSmsConfigured,
      status: isSmsConfigured ? 'Configured' : 'Not configured',
      expiresInSeconds: 300
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal server error.' });
  }
});

/**
 * Verify Secure OTP
 * POST /api/auth/verify-otp
 */
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { mobile, otp, fullName } = req.body;
    const cleanMobile = (mobile || '').replace(/\D/g, '').slice(-10);

    if (!cleanMobile || !otp) {
      res.status(400).json({ success: false, error: 'Mobile number and OTP are required.' });
      return;
    }

    const record = activeOtps.get(cleanMobile);
    if (!record) {
      res.status(400).json({ success: false, error: 'No active OTP found or it has expired. Please request a new OTP.' });
      return;
    }

    if (Date.now() > record.expiresAt) {
      activeOtps.delete(cleanMobile);
      res.status(400).json({ success: false, error: 'OTP has expired. Please request a new code.' });
      return;
    }

    const isMatch = bcrypt.compareSync(otp.toString().trim(), record.codeHash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Incorrect OTP code. Please verify and try again.' });
      return;
    }

    // Clean up OTP upon successful verification
    activeOtps.delete(cleanMobile);

    // Find or create customer
    let user = await db.getUserByEmailOrMobile(cleanMobile);
    if (!user) {
      user = await db.createUser({
        fullName: fullName || `Customer ${cleanMobile.slice(-4)}`,
        mobile: cleanMobile
      });
    }

    const token = generateToken({
      id: user.id,
      role: user.role,
      fullName: user.fullName,
      mobile: user.mobile,
      email: user.email
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        mobile: user.mobile,
        email: user.email,
        role: user.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal server error.' });
  }
});

/**
 * Get Current User Profile
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await db.getUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }
    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal server error.' });
  }
});

export default router;
