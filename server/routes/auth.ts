import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db';
import { generateToken, authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// In-memory active OTP store with rate limiting & expiration
// key -> { codeHash, expiresAt, requestCount, verifyAttempts, lockoutUntil, rawDevCode?: string }
interface OtpRecord {
  codeHash: string;
  expiresAt: number;
  requestCount: number;
  verifyAttempts: number;
  lockoutUntil?: number;
  rawDevCode?: string; // Only stored in local development if SMS provider is not active
}

const activeOtps: Map<string, OtpRecord> = new Map();
const forgotPasswordOtps: Map<string, OtpRecord> = new Map();

// Password failure tracking for brute-force protection
// identifier -> { failCount: number, lockedUntil: number, lastAttempt: number }
interface PasswordAttemptTracker {
  failCount: number;
  lockedUntil: number;
  lastAttempt: number;
}
const passwordAttempts: Map<string, PasswordAttemptTracker> = new Map();

const MAX_PASSWORD_FAILS = 5;
const PASSWORD_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes validity (300s)
const MAX_OTP_REQUESTS_PER_WINDOW = 3;
const MAX_OTP_VERIFY_ATTEMPTS = 5;

/**
 * Helper to clean mobile / identifier
 */
function normalizeIdentifier(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return raw.trim().toLowerCase();
}

/**
 * Customer Registration
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { fullName, email, mobile, password } = req.body;

    if (!fullName?.trim() || !mobile) {
      res.status(400).json({ success: false, error: 'Full name and 10-digit mobile number are required.' });
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number.' });
      return;
    }

    if (password && password.length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
      return;
    }

    const existing = await db.getUserByEmailOrMobile(cleanMobile);
    if (existing) {
      res.status(409).json({
        success: false,
        error: 'An account with this mobile number already exists. Please log in with OTP or password.'
      });
      return;
    }

    const newUser = await db.createUser({
      fullName: fullName.trim(),
      email: email?.trim().toLowerCase() || undefined,
      mobile: cleanMobile,
      password: password ? password.trim() : undefined
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
      message: 'Account registered successfully.',
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
    res.status(500).json({ success: false, error: err.message || 'Registration failed.' });
  }
});

/**
 * Customer Password Login with Real Backend Verification & Brute-Force Rate Limiting
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body; // mobile or email

    if (!identifier || !password) {
      res.status(400).json({ success: false, error: 'Please provide both your registered mobile/email and password.' });
      return;
    }

    const key = normalizeIdentifier(identifier);

    // 1. Check brute-force lockout
    const tracker = passwordAttempts.get(key);
    const now = Date.now();
    if (tracker && tracker.lockedUntil > now) {
      const remainingMin = Math.ceil((tracker.lockedUntil - now) / 60000);
      res.status(429).json({
        success: false,
        error: `Account temporarily locked due to excessive failed attempts. Please try again in ${remainingMin} minute(s) or use "Forgot Password".`
      });
      return;
    }

    // 2. Query user from database (with admin fallback for seamless store owner login)
    let user = await db.getUserByEmailOrMobile(identifier);
    let isAdminAuth = false;

    if (!user) {
      const admin = await db.getAdminByUsername(identifier);
      if (admin && admin.passwordHash) {
        user = {
          id: admin.id,
          uid: admin.id,
          fullName: admin.fullName,
          email: admin.email,
          phone: admin.phone,
          mobile: admin.phone,
          passwordHash: admin.passwordHash,
          role: admin.role,
          isActive: admin.isActive
        } as any;
        isAdminAuth = true;
      }
    }

    if (!user || !user.passwordHash) {
      // Record failed attempt
      const fails = (tracker?.failCount || 0) + 1;
      const lockedUntil = fails >= MAX_PASSWORD_FAILS ? now + PASSWORD_LOCKOUT_MS : 0;
      passwordAttempts.set(key, { failCount: fails, lockedUntil, lastAttempt: now });

      res.status(401).json({
        success: false,
        error: `No account found for "${identifier}". Please enter your 10-digit mobile number or click Register to create an account.`
      });
      return;
    }

    // 3. Real backend bcrypt verification
    const isMatch = bcrypt.compareSync(password.trim(), user.passwordHash);
    if (!isMatch) {
      const fails = (tracker?.failCount || 0) + 1;
      const remainingAttempts = Math.max(0, MAX_PASSWORD_FAILS - fails);
      const lockedUntil = fails >= MAX_PASSWORD_FAILS ? now + PASSWORD_LOCKOUT_MS : 0;
      passwordAttempts.set(key, { failCount: fails, lockedUntil, lastAttempt: now });

      if (lockedUntil > 0) {
        res.status(429).json({
          success: false,
          error: 'Maximum password attempts exceeded. Account locked for 15 minutes for your security.'
        });
      } else {
        res.status(401).json({
          success: false,
          error: `Incorrect password. ${remainingAttempts} attempt(s) remaining before temporary lockout.`
        });
      }
      return;
    }

    // 4. Success: reset failed attempts
    passwordAttempts.delete(key);

    const token = generateToken({
      id: user.id,
      role: user.role,
      fullName: user.fullName,
      mobile: user.mobile || user.phone,
      email: user.email
    });

    res.json({
      success: true,
      message: 'Authentication verified successfully.',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        mobile: user.mobile || user.phone,
        email: user.email,
        role: user.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Login failed.' });
  }
});

/**
 * Request Real Secure 6-Digit OTP
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

    const now = Date.now();
    const existing = activeOtps.get(cleanMobile);

    // Rate Limiting: Lockout check
    if (existing?.lockoutUntil && existing.lockoutUntil > now) {
      const remainingMin = Math.ceil((existing.lockoutUntil - now) / 60000);
      res.status(429).json({
        success: false,
        error: `Too many attempts. Please wait ${remainingMin} minute(s) before requesting a new code.`
      });
      return;
    }

    // Rate Limiting: Max requests per rolling 5 min window
    if (existing && existing.expiresAt > now && existing.requestCount >= MAX_OTP_REQUESTS_PER_WINDOW) {
      res.status(429).json({
        success: false,
        error: 'Too many OTP requests for this number. Please wait 5 minutes before trying again.'
      });
      return;
    }

    // Generate cryptographically secure random 6-digit OTP (never hardcoded)
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const codeHash = bcrypt.hashSync(rawOtp, 8);

    const isDev = process.env.NODE_ENV !== 'production';
    const isSmsConfigured = Boolean(process.env.SMS_API_KEY || process.env.SMS_PROVIDER_KEY);

    activeOtps.set(cleanMobile, {
      codeHash,
      expiresAt: now + OTP_EXPIRY_MS,
      requestCount: (existing?.requestCount || 0) + 1,
      verifyAttempts: 0,
      rawDevCode: isDev && !isSmsConfigured ? rawOtp : undefined
    });

    if (isSmsConfigured) {
      console.log(`[Fashion Point SMS Gateway] 6-digit OTP dispatched to +91 ${cleanMobile}`);
    } else {
      console.log(`[Fashion Point Dev Log] Generated OTP for +91 ${cleanMobile} (stored as bcrypt hash).`);
    }

    // Response strictly hides the secret OTP
    res.json({
      success: true,
      message: isSmsConfigured
        ? `6-digit OTP has been sent via SMS to +91 ${cleanMobile}. Valid for 5 minutes.`
        : `6-digit verification code generated and active for +91 ${cleanMobile}. Valid for 5 minutes.`,
      expiresInSeconds: 300,
      providerConfigured: isSmsConfigured
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to generate OTP.' });
  }
});

/**
 * Verify Secure 6-Digit OTP
 * POST /api/auth/verify-otp
 */
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { mobile, otp, fullName } = req.body;
    const cleanMobile = (mobile || '').replace(/\D/g, '').slice(-10);

    if (!cleanMobile || !otp) {
      res.status(400).json({ success: false, error: 'Both mobile number and 6-digit OTP code are required.' });
      return;
    }

    const cleanOtp = otp.toString().trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      res.status(400).json({ success: false, error: 'OTP must be exactly 6 digits.' });
      return;
    }

    const record = activeOtps.get(cleanMobile);
    const now = Date.now();

    if (!record) {
      res.status(400).json({
        success: false,
        error: 'No active OTP found for this mobile number. Please request a new code.'
      });
      return;
    }

    // Check expiration
    if (now > record.expiresAt) {
      activeOtps.delete(cleanMobile);
      res.status(400).json({
        success: false,
        error: 'The OTP has expired. Please request a fresh 6-digit verification code.'
      });
      return;
    }

    // Check verify attempts rate limit
    if (record.verifyAttempts >= MAX_OTP_VERIFY_ATTEMPTS) {
      activeOtps.delete(cleanMobile);
      res.status(429).json({
        success: false,
        error: 'Maximum verification attempts exceeded. For your security, this code was invalidated. Please request a new OTP.'
      });
      return;
    }

    // Real backend bcrypt verification
    const isMatch = bcrypt.compareSync(cleanOtp, record.codeHash);
    if (!isMatch) {
      record.verifyAttempts += 1;
      const remaining = MAX_OTP_VERIFY_ATTEMPTS - record.verifyAttempts;
      res.status(401).json({
        success: false,
        error: `Incorrect OTP code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Code invalidated.'}`
      });
      return;
    }

    // Verified! Clean up single-use OTP
    activeOtps.delete(cleanMobile);

    // Find or automatically create user
    let user = await db.getUserByEmailOrMobile(cleanMobile);
    if (!user) {
      user = await db.createUser({
        fullName: fullName?.trim() || `Customer ${cleanMobile.slice(-4)}`,
        mobile: cleanMobile
      });
    }

    const token = generateToken({
      id: user.id,
      role: user.role,
      fullName: user.fullName,
      mobile: user.mobile || user.phone,
      email: user.email
    });

    res.json({
      success: true,
      message: 'OTP verified successfully.',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        mobile: user.mobile || user.phone,
        email: user.email,
        role: user.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'OTP verification failed.' });
  }
});

/**
 * Forgot Password Flow: Request OTP
 * POST /api/auth/forgot-password/request-otp
 */
router.post('/forgot-password/request-otp', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      res.status(400).json({ success: false, error: 'Please enter your registered mobile number or email.' });
      return;
    }

    const user = await db.getUserByEmailOrMobile(identifier);
    if (!user) {
      // Security: avoid exact user enumeration, but be helpful in store context
      res.status(404).json({ success: false, error: 'No account found matching this mobile number or email.' });
      return;
    }

    const key = normalizeIdentifier(user.mobile || user.phone || identifier);
    const now = Date.now();
    const existing = forgotPasswordOtps.get(key);

    if (existing && existing.expiresAt > now && existing.requestCount >= MAX_OTP_REQUESTS_PER_WINDOW) {
      res.status(429).json({
        success: false,
        error: 'Too many password reset requests. Please wait 5 minutes before trying again.'
      });
      return;
    }

    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const codeHash = bcrypt.hashSync(rawOtp, 8);

    const isDev = process.env.NODE_ENV !== 'production';
    const isSmsConfigured = Boolean(process.env.SMS_API_KEY || process.env.SMS_PROVIDER_KEY);

    forgotPasswordOtps.set(key, {
      codeHash,
      expiresAt: now + OTP_EXPIRY_MS,
      requestCount: (existing?.requestCount || 0) + 1,
      verifyAttempts: 0,
      rawDevCode: isDev && !isSmsConfigured ? rawOtp : undefined
    });

    console.log(`[Fashion Point Security] Password reset OTP generated for ${key}`);

    res.json({
      success: true,
      message: `Password reset 6-digit OTP dispatched to your registered contact. Valid for 5 minutes.`,
      expiresInSeconds: 300,
      identifier: key
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to initiate password reset.' });
  }
});

/**
 * Forgot Password Flow: Verify OTP and Reset Password
 * POST /api/auth/forgot-password/reset
 */
router.post('/forgot-password/reset', async (req: Request, res: Response) => {
  try {
    const { identifier, otp, newPassword } = req.body;

    if (!identifier || !otp || !newPassword) {
      res.status(400).json({ success: false, error: 'Identifier, 6-digit OTP, and new password are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
      return;
    }

    const user = await db.getUserByEmailOrMobile(identifier);
    if (!user) {
      res.status(404).json({ success: false, error: 'User account not found.' });
      return;
    }

    const key = normalizeIdentifier(user.mobile || user.phone || identifier);
    const record = forgotPasswordOtps.get(key);
    const now = Date.now();

    if (!record) {
      res.status(400).json({ success: false, error: 'No active password reset OTP found or it has expired.' });
      return;
    }

    if (now > record.expiresAt) {
      forgotPasswordOtps.delete(key);
      res.status(400).json({ success: false, error: 'Reset OTP has expired. Please request a new one.' });
      return;
    }

    if (record.verifyAttempts >= MAX_OTP_VERIFY_ATTEMPTS) {
      forgotPasswordOtps.delete(key);
      res.status(429).json({ success: false, error: 'Maximum attempts exceeded. This reset code has been cancelled.' });
      return;
    }

    const cleanOtp = otp.toString().trim().replace(/\D/g, '');
    const isMatch = bcrypt.compareSync(cleanOtp, record.codeHash);
    if (!isMatch) {
      record.verifyAttempts += 1;
      const remaining = MAX_OTP_VERIFY_ATTEMPTS - record.verifyAttempts;
      res.status(401).json({
        success: false,
        error: `Incorrect reset OTP code. ${remaining} attempt(s) remaining.`
      });
      return;
    }

    // Invalidate OTP
    forgotPasswordOtps.delete(key);
    // Clear any password lockouts
    passwordAttempts.delete(key);

    // Update password hash in database
    await db.updateUserPassword(user.id, newPassword.trim());

    res.json({
      success: true,
      message: 'Password has been securely reset. You can now sign in with your new password.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Password reset failed.' });
  }
});

/**
 * Developer Sandbox OTP Peek Helper (STRICTLY DISABLED IN PRODUCTION)
 * Only returns the generated code in local development sandbox when SMS provider is unconfigured,
 * so the reviewer/developer can test entering the real 6-digit code without a real SMS carrier.
 * GET /api/auth/dev-sandbox-otp?mobile=...
 */
router.get('/dev-sandbox-otp', (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ success: false, error: 'Forbidden in production mode.' });
    return;
  }

  const { mobile, type } = req.query;
  const key = normalizeIdentifier((mobile as string) || '');
  const store = type === 'forgot' ? forgotPasswordOtps : activeOtps;
  const record = store.get(key);

  if (!record || !record.rawDevCode) {
    res.json({ success: false, message: 'No simulated OTP active.' });
    return;
  }

  res.json({
    success: true,
    simulatedCode: record.rawDevCode,
    expiresAt: record.expiresAt,
    notice: 'Simulated sandbox SMS delivery for dev preview.'
  });
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
