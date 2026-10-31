import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbStore } from '../lib/store.js';
import { Role, UserPayload } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || 'brightloop_hackathon_super_secret_jwt_key_2026';

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Access denied. No authorization token provided.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    // Verify user still exists
    const user = dbStore.findUserById(decoded.id);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid session. User account no longer exists.',
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      companyName: user.companyName,
      role: user.role,
      phone: user.phone,
      address: user.address,
    };
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      error: 'Invalid or expired authorization token.',
    });
  }
};

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access forbidden. Role '${req.user.role}' does not have sufficient permission for this resource. Required: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};

export const requireCustomerOrStaff = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return;
  }

  if (req.user.role === 'CUSTOMER' || req.user.role === 'STAFF' || req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Access forbidden.' });
  }
};
