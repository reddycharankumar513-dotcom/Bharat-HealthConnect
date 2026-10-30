import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// ==========================================
// 1. FINANCIAL DASHBOARD METRICS & REVENUE
// ==========================================
router.get('/dashboard', authenticateToken, requireRole(['CENTRAL_ADMIN', 'HOSPITAL_ADMIN', 'HOSPITAL_STAFF']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { hospitalId, startDate, endDate } = req.query;
    const filter = hospitalId ? { hospitalId: hospitalId as string } : {};

    const [
      totalInvoices,
      pendingInvoices,
      paidInvoices,
      allPayments,
      allRefunds,
      ledgerEntries,
      insuranceClaims
    ] = await Promise.all([
      prisma.invoice.findMany({ where: filter }),
      prisma.invoice.findMany({ where: { ...filter, status: 'PENDING' } }),
      prisma.invoice.findMany({ where: { ...filter, status: 'PAID' } }),
      prisma.payment.findMany({ where: { ...filter, status: 'SUCCESS' } }),
      prisma.refund.findMany({ where: {} }),
      prisma.financialLedger.findMany({ where: filter }),
      prisma.insuranceClaim.findMany({ where: { ...(hospitalId ? { hospitalId: hospitalId as string } : {}) } })
    ]);

    // Aggregate numbers
    const totalBilled = totalInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalCollected = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalOutstanding = totalInvoices.reduce((sum, inv) => sum + inv.outstandingBalance, 0);
    const totalRefunded = allRefunds.filter(r => r.status === 'PROCESSED').reduce((sum, r) => sum + r.amount, 0);
    const pendingRefunds = allRefunds.filter(r => r.status === 'REQUESTED').reduce((sum, r) => sum + r.amount, 0);
    const insuranceSettled = insuranceClaims.filter(c => c.status === 'APPROVED' || c.status === 'SETTLED').reduce((sum, c) => sum + c.approvedAmount, 0);

    // Category-wise revenue breakdown
    const categoryRevenue: Record<string, number> = {
      CONSULTATION: 0,
      INPATIENT: 0,
      PHARMACY: 0,
      DIAGNOSTIC: 0,
      PROCEDURE: 0
    };

    totalInvoices.forEach(inv => {
      const cat = inv.category || 'CONSULTATION';
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + inv.paidAmount;
    });

    // Payment method breakdown
    const methodBreakdown: Record<string, number> = {};
    allPayments.forEach(p => {
      methodBreakdown[p.paymentMethod] = (methodBreakdown[p.paymentMethod] || 0) + p.amount;
    });

    // Monthly collection trend (last 6 months sample)
    const monthlyTrend = [
      { month: 'May 2026', collection: Math.round(totalCollected * 0.12), claims: 12000 },
      { month: 'Jun 2026', collection: Math.round(totalCollected * 0.14), claims: 18000 },
      { month: 'Jul 2026', collection: Math.round(totalCollected * 0.16), claims: 24000 },
      { month: 'Aug 2026', collection: Math.round(totalCollected * 0.18), claims: 30000 },
      { month: 'Sep 2026', collection: Math.round(totalCollected * 0.19), claims: 32000 },
      { month: 'Oct 2026', collection: totalCollected, claims: insuranceSettled }
    ];

    res.json({
      success: true,
      metrics: {
        totalBilled,
        totalCollected,
        totalOutstanding,
        totalRefunded,
        pendingRefunds,
        insuranceSettled,
        totalInvoiceCount: totalInvoices.length,
        pendingInvoiceCount: pendingInvoices.length,
        paidInvoiceCount: paidInvoices.length,
        netRevenue: Math.max(0, totalCollected - totalRefunded)
      },
      categoryRevenue: Object.entries(categoryRevenue).map(([name, value]) => ({ name, value })),
      paymentMethods: Object.entries(methodBreakdown).map(([name, value]) => ({ name, value })),
      monthlyTrend,
      recentLedger: ledgerEntries.slice(0, 10)
    });
  } catch (error) {
    console.error('Failed to get finance dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to load financial dashboard.' });
  }
});

// ==========================================
// 2. FINANCIAL LEDGER
// ==========================================
router.get('/ledger', authenticateToken, requireRole(['CENTRAL_ADMIN', 'HOSPITAL_ADMIN', 'HOSPITAL_STAFF']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { hospitalId, entryType, category } = req.query;
    const where: any = {};

    if (hospitalId) where.hospitalId = hospitalId as string;
    if (entryType && entryType !== 'ALL') where.entryType = entryType as string;
    if (category && category !== 'ALL') where.category = category as string;

    const ledger = await prisma.financialLedger.findMany({
      where,
      include: {
        hospital: { select: { id: true, name: true } }
      },
      orderBy: { postedAt: 'desc' }
    });

    res.json({ success: true, ledger });
  } catch (error) {
    console.error('Failed to get ledger:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch financial ledger.' });
  }
});

// ==========================================
// 3. REFUNDS MANAGEMENT
// ==========================================
router.get('/refunds', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const where: any = {};

    if (status && status !== 'ALL') where.status = status as string;

    const refunds = await prisma.refund.findMany({
      where,
      include: {
        payment: true,
        invoice: {
          include: {
            patient: { include: { user: { select: { fullName: true, phone: true, email: true } } } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, refunds });
  } catch (error) {
    console.error('Failed to get refunds:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch refunds.' });
  }
});

// Request refund
router.post('/refunds', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { paymentId, amount, reason } = req.body;

    if (!paymentId || !reason) {
      res.status(400).json({ success: false, message: 'Payment ID and refund reason are required.' });
      return;
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { invoice: true }
    });

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found.' });
      return;
    }

    const refundAmount = amount ? Number(amount) : payment.amount;

    if (refundAmount <= 0 || refundAmount > payment.amount) {
      res.status(400).json({ success: false, message: 'Invalid refund amount.' });
      return;
    }

    const count = await prisma.refund.count();
    const refundReference = `REF-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const refund = await prisma.refund.create({
      data: {
        refundReference,
        paymentId: payment.id,
        invoiceId: payment.invoiceId,
        amount: refundAmount,
        reason,
        status: 'REQUESTED',
        requestedBy: req.user?.fullName || 'Patient'
      }
    });

    // Audit log
    await prisma.paymentAuditLog.create({
      data: {
        action: 'REFUND_REQUESTED',
        performedBy: req.user?.fullName || 'User',
        role: req.user?.role || 'PATIENT',
        entityType: 'REFUND',
        entityId: refund.id,
        details: JSON.stringify({ refundReference, amount: refundAmount, reason })
      }
    });

    res.status(201).json({ success: true, message: `Refund request ${refundReference} created.`, refund });
  } catch (error) {
    console.error('Failed to request refund:', error);
    res.status(500).json({ success: false, message: 'Failed to request refund.' });
  }
});

// Approve or Reject refund
router.patch('/refunds/:id/status', authenticateToken, requireRole(['CENTRAL_ADMIN', 'HOSPITAL_ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body; // 'APPROVED' | 'REJECTED' | 'PROCESSED'

    const refund = await prisma.refund.findUnique({
      where: { id },
      include: { payment: true, invoice: true }
    });

    if (!refund) {
      res.status(404).json({ success: false, message: 'Refund record not found.' });
      return;
    }

    if (status === 'PROCESSED' || status === 'APPROVED') {
      const gatewayRefundId = `rfnd_${Date.now()}`;

      // Atomic debit accounting transaction
      const processed = await prisma.$transaction(async (tx) => {
        const updatedRefund = await tx.refund.update({
          where: { id },
          data: {
            status: 'PROCESSED',
            gatewayRefundId,
            approvedBy: req.user?.fullName || 'Finance Controller',
            processedAt: new Date(),
            remarks
          }
        });

        // Update payment transaction
        await tx.paymentTransaction.create({
          data: {
            paymentId: refund.paymentId,
            transactionType: 'REFUND',
            amount: refund.amount,
            gatewayStatus: 'processed',
            gatewayPayload: JSON.stringify({ gatewayRefundId, approvedBy: req.user?.fullName })
          }
        });

        // Debit entry in FinancialLedger
        const ledgerCount = await tx.financialLedger.count();
        await tx.financialLedger.create({
          data: {
            ledgerRef: `LED-${new Date().getFullYear()}-${String(ledgerCount + 1).padStart(4, '0')}`,
            hospitalId: refund.invoice.hospitalId,
            entryType: 'DEBIT',
            category: 'REFUND',
            amount: refund.amount,
            source: 'RAZORPAY',
            referenceId: refund.id,
            description: `Reversal refund for ${refund.refundReference} (${refund.reason})`
          }
        });

        // Update invoice status if full refund
        if (refund.amount >= refund.invoice.paidAmount) {
          await tx.invoice.update({
            where: { id: refund.invoiceId },
            data: { status: 'REFUNDED' }
          });
        }

        return updatedRefund;
      });

      res.json({ success: true, message: `Refund ${refund.refundReference} processed successfully.`, refund: processed });
      return;
    }

    const updated = await prisma.refund.update({
      where: { id },
      data: { status, remarks }
    });

    res.json({ success: true, message: `Refund updated to ${status}.`, refund: updated });
  } catch (error: any) {
    console.error('Failed to update refund status:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update refund.' });
  }
});

export default router;
