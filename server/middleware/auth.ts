import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

function getJwtSecret(): string {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable is required in production mode.');
  }
  return crypto.randomBytes(32).toString('hex');
}

export const JWT_SECRET = getJwtSecret();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    username?: string;
    email?: string;
    mobile?: string;
    fullName: string;
  };
}

export function generateToken(payload: object, expiresIn: string = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required. Missing Bearer token.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ success: false, error: 'Invalid or expired session token.' });
  }
}

export const ALLOWED_STAFF_ROLES = [
  'SUPER_ADMIN',
  'STORE_MANAGER',
  'ADMIN',
  'INVENTORY_MANAGER',
  'WAREHOUSE_STAFF',
  'HUB_OPERATOR',
  'DELIVERY_BOY',
  'STAFF'
];

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  authenticateToken(req, res, () => {
    if (!req.user || !['SUPER_ADMIN', 'STORE_MANAGER', 'ADMIN'].includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Access denied: Admin privileges required.' });
      return;
    }
    next();
  });
}

export function requireStaffOrAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  authenticateToken(req, res, () => {
    if (!req.user || !ALLOWED_STAFF_ROLES.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Access denied: Authorized Admin, Warehouse, Hub, or Delivery Staff credentials required.'
      });
      return;
    }
    next();
  });
}

export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  authenticateToken(req, res, () => {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
      res.status(403).json({ success: false, error: 'Access denied: Super Admin authorization required.' });
      return;
    }
    next();
  });
}
