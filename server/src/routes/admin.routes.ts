import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/admin/providers - Central Admin list of provider registrations
router.get('/providers', authenticateToken, requireRole(['CENTRAL_ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const providers = await prisma.user.findMany({
      where: {
        role: { in: ['DOCTOR', 'HOSPITAL_ADMIN', 'PHARMACIST', 'LAB_ADMIN', 'SUPPLIER'] }
      },
      include: {
        doctorProfile: { include: { hospital: true } },
        pharmacistProfile: { include: { pharmacy: true } },
        labStaff: { include: { laboratory: true } },
        supplier: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, providers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve providers.' });
  }
});

// PUT /api/admin/providers/:id/verify - Approve, Reject or Suspend Provider
router.put('/providers/:id/verify', authenticateToken, requireRole(['CENTRAL_ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, remarks } = req.body; // 'ACTIVE' | 'SUSPENDED' | 'REJECTED'

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, message: 'Provider user not found.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        userRole: req.user!.role,
        action: 'PROVIDER_VERIFICATION_UPDATE',
        resource: 'User',
        resourceId: user.id,
        details: JSON.stringify({ targetEmail: user.email, oldStatus: user.status, newStatus: status, remarks })
      }
    });

    // Notify Provider
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: `Account Verification Status: ${status}`,
        message: status === 'ACTIVE' 
          ? 'Congratulations! Your Bharat HealthConnect healthcare provider credentials have been verified and approved.'
          : `Your provider account has been marked as ${status}. Remarks: ${remarks || 'Contact support for details.'}`,
        category: 'system'
      }
    });

    res.json({
      success: true,
      message: `Provider ${user.fullName} is now set to ${status}.`,
      provider: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update provider status.' });
  }
});

// GET /api/admin/audit-logs - Central Audit Trail
router.get('/audit-logs', authenticateToken, requireRole(['CENTRAL_ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: { select: { fullName: true, email: true, role: true } }
      },
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
  }
});

// GET /api/admin/stats - Macro Telemetry Metrics
router.get('/stats', authenticateToken, requireRole(['CENTRAL_ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalHospitals,
      totalPharmacies,
      totalLabs,
      totalSuppliers,
      pendingVerifications,
      totalOrders,
      totalDiagnosticReports
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'PATIENT' } }),
      prisma.doctorProfile.count(),
      prisma.hospital.count(),
      prisma.pharmacy.count(),
      prisma.diagnosticLaboratory.count(),
      prisma.supplier.count(),
      prisma.user.count({ where: { status: 'PENDING_VERIFICATION' } }),
      prisma.medicineOrder.count(),
      prisma.diagnosticReport.count()
    ]);

    res.json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        totalHospitals,
        totalPharmacies,
        totalLabs,
        totalSuppliers,
        pendingVerifications,
        totalOrders,
        totalDiagnosticReports,
        telemetryUptime: '99.98%'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch platform metrics.' });
  }
});

export default router;
