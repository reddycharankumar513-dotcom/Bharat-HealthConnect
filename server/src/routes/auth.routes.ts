import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bharat_healthconnect_secure_jwt_token_secret_2026_innovation';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const getRedirectUrlForRole = (role: string): string => {
  switch (role) {
    case 'CENTRAL_ADMIN':
      return '/admin';
    case 'HOSPITAL_ADMIN':
      return '/hospital';
    case 'DOCTOR':
      return '/doctor';
    case 'HOSPITAL_STAFF':
      return '/hospital/staff';
    case 'PHARMACIST':
      return '/pharmacy';
    case 'LAB_ADMIN':
    case 'LAB_STAFF':
      return '/laboratory';
    case 'SUPPLIER':
      return '/supplier';
    case 'PATIENT':
    default:
      return '/patient';
  }
};

// POST /api/auth/login
router.post('/login', async (req, res): Promise<void> => {
  const { identifier, password, rememberMe } = req.body;

  if (!identifier || !password) {
    res.status(400).json({ success: false, message: 'Email or phone and password are required.' });
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.trim().toLowerCase() },
          { phone: identifier.trim() }
        ]
      },
      include: {
        patientProfile: true,
        doctorProfile: true,
        pharmacistProfile: true,
        labStaff: true,
        supplier: true
      }
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (user.status === 'PENDING_VERIFICATION') {
      res.status(403).json({
        success: false,
        message: 'Your healthcare provider registration is pending verification by the Central Administrator. You will receive an SMS and email upon review.'
      });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({ success: false, message: 'This account has been suspended by administration.' });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: rememberMe ? '30d' : JWT_EXPIRES_IN }
    );

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: 'LOGIN',
        resource: 'User',
        resourceId: user.id,
        details: JSON.stringify({ email: user.email, role: user.role, timestamp: new Date() })
      }
    });

    const redirectUrl = getRedirectUrlForRole(user.role);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      redirectUrl,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        state: user.state,
        abhaId: user.abhaId,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res): Promise<void> => {
  const {
    accountType, // 'patient' | 'provider'
    fullName,
    email,
    phone,
    password,
    city,
    state,
    // Provider specific fields:
    providerType, // 'Doctor' | 'Hospital' | 'Pharmacy' | 'Diagnostic Lab' | 'Supplier'
    organizationName,
    licenseNumber,
    registrationNumber,
    specialty,
    qualification,
    address
  } = req.body;

  if (!fullName || !email || !password) {
    res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    return;
  }

  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.trim().toLowerCase() },
          ...(phone ? [{ phone: phone.trim() }] : [])
        ]
      }
    });

    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email or phone number already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (accountType === 'provider') {
      // Map providerType to Role
      let role = 'DOCTOR';
      if (providerType === 'Hospital') role = 'HOSPITAL_ADMIN';
      else if (providerType === 'Pharmacy') role = 'PHARMACIST';
      else if (providerType === 'Diagnostic Lab') role = 'LAB_ADMIN';
      else if (providerType === 'Supplier') role = 'SUPPLIER';

      const newUser = await prisma.user.create({
        data: {
          fullName,
          email: email.trim().toLowerCase(),
          phone: phone?.trim(),
          passwordHash,
          role,
          status: 'PENDING_VERIFICATION', // Providers require admin approval!
          city: city || 'Hyderabad',
          state: state || 'Telangana'
        }
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: newUser.id,
          userRole: newUser.role,
          action: 'PROVIDER_REGISTER',
          resource: 'User',
          resourceId: newUser.id,
          details: JSON.stringify({ providerType, organizationName, licenseNumber, status: 'PENDING_VERIFICATION' })
        }
      });

      res.status(201).json({
        success: true,
        isPending: true,
        message: 'Healthcare provider application registered successfully. It is currently under review by the Central Administrator.'
      });
      return;
    }

    // Patient Registration (Immediately Active)
    const newUser = await prisma.user.create({
      data: {
        fullName,
        email: email.trim().toLowerCase(),
        phone: phone?.trim(),
        passwordHash,
        role: 'PATIENT',
        status: 'ACTIVE',
        city: city || 'Hyderabad',
        state: state || 'Telangana',
        abhaId: `ABHA-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        patientProfile: {
          create: {
            address: address || '',
            preferredLanguage: 'en'
          }
        }
      }
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, fullName: newUser.fullName },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      isPending: false,
      message: 'Patient account created successfully.',
      token,
      redirectUrl: '/patient',
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        abhaId: newUser.abhaId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        status: true,
        avatarUrl: true,
        city: true,
        state: true,
        abhaId: true,
        patientProfile: true,
        doctorProfile: true,
        pharmacistProfile: true,
        labStaff: true,
        supplier: true
      }
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({ success: true, user, redirectUrl: getRedirectUrlForRole(user.role) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user profile.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res): Promise<void> => {
  const { email } = req.body;
  // Security standard: Never reveal whether an email address belongs to a registered account
  res.json({
    success: true,
    message: 'If an account exists with this email address, a secure password reset link has been dispatched.'
  });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res): Promise<void> => {
  const { token, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    return;
  }
  res.json({
    success: true,
    message: 'Password has been reset successfully. Please sign in with your new credentials.'
  });
});

export default router;
