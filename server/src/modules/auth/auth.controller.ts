import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { dbStore, StoredUser } from '../../lib/store.js';
import { Role, UserPayload } from '../../types/index.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'brightloop_hackathon_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN: SignOptions['expiresIn'] = '7d';

export const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (!password || password.length <= 8) {
    return {
      valid: false,
      error: 'Password must be more than 8 characters long.',
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one uppercase letter (A-Z).',
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one lowercase letter (a-z).',
    };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one special character (e.g. !@#$%^&*).',
    };
  }
  return { valid: true };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, companyName, phone, address, role } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        error: 'Name, email, and password are required fields.',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.',
      });
      return;
    }

    // Password validation per requirements
    const pwdValidation = validatePassword(password);
    if (!pwdValidation.valid) {
      res.status(400).json({
        success: false,
        error: pwdValidation.error,
      });
      return;
    }

    // Check if user already exists
    const existing = dbStore.findUserByEmail(email);
    if (existing) {
      res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Default role is CUSTOMER unless explicitly set in dev/testing
    const userRole: Role = role && ['ADMIN', 'STAFF', 'CUSTOMER'].includes(role) ? role : 'CUSTOMER';

    const newUser: StoredUser = {
      id: `usr-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      companyName: companyName || '',
      phone: phone || '',
      address: address || '',
      role: userRole,
      passwordHash,
    };

    dbStore.createUser(newUser);

    const tokenPayload: UserPayload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      companyName: newUser.companyName,
      role: newUser.role,
      phone: newUser.phone,
      address: newUser.address,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Welcome to Brightloop Software!',
      data: {
        user: tokenPayload,
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred during registration.',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required.',
      });
      return;
    }

    const user = dbStore.findUserByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
      return;
    }

    const tokenPayload: UserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      companyName: user.companyName,
      role: user.role,
      phone: user.phone,
      address: user.address,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: {
        user: tokenPayload,
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred during login.',
    });
  }
};

export const getMe = (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Unauthorized.' });
    return;
  }

  res.status(200).json({
    success: true,
    data: req.user,
  });
};

export const forgotPassword = (req: Request, res: Response): void => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, error: 'Email address is required.' });
    return;
  }

  const user = dbStore.findUserByEmail(email);
  if (!user) {
    // Return friendly message even if email not found for security
    res.status(200).json({
      success: true,
      message: 'If that email exists in our system, a password reset link has been dispatched.',
    });
    return;
  }

  const resetToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

  // Log link in console for hackathon testing
  console.log(`[Password Reset Dispatch] To: ${user.email} | URL: ${resetUrl}`);

  res.status(200).json({
    success: true,
    message: `A password reset link has been sent to ${email}.`,
    data: {
      demoResetUrl: resetUrl,
    },
  });
};

// Admin adds new staff member (per requirement: "Only the admin can add a new member of staff")
export const addStaff = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        error: 'Name, email, and password are required for new staff member.',
      });
      return;
    }

    const pwdValidation = validatePassword(password);
    if (!pwdValidation.valid) {
      res.status(400).json({ success: false, error: pwdValidation.error });
      return;
    }

    if (dbStore.findUserByEmail(email)) {
      res.status(409).json({ success: false, error: 'User with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newStaff: StoredUser = {
      id: `staff-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      companyName: 'Brightloop Software Internal',
      role: 'STAFF',
      passwordHash,
    };

    dbStore.createUser(newStaff);

    res.status(201).json({
      success: true,
      message: 'Staff member added successfully.',
      data: {
        id: newStaff.id,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
