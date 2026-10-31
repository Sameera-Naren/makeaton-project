import { Request, Response, NextFunction } from 'express';

/**
 * AUTH MIDDLEWARE STUB – Member 3
 *
 * This is a passthrough stub for development/demo purposes.
 * When Member 1 (Auth) completes their JWT implementation,
 * replace this with the real JWT verification middleware.
 *
 * Integration point:
 *   - Member 1 should export their verifyToken middleware
 *   - Replace this file's logic with: import { verifyToken } from '../../auth/middleware'
 *   - The verified user should be attached as req.user
 */

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

// Passthrough: attaches a mock staff user for demo purposes
export const authMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  // TODO: Replace with real JWT verification from Member 1
  req.user = {
    id: 'mock-staff-user',
    role: 'STAFF',
    email: 'staff@brightloop.com',
  };
  next();
};

// Staff-only guard (ADMIN or STAFF)
export const requireStaff = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || (req.user.role !== 'STAFF' && req.user.role !== 'ADMIN')) {
    res.status(403).json({ error: 'Forbidden: staff access required' });
    return;
  }
  next();
};
