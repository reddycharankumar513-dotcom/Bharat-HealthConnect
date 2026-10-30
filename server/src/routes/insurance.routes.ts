import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// ==========================================
// 1. LIST INSURANCE POLICIES
// ==========================================
router.get('/policies', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.query;
    const where: any = {};

    if (req.user?.role === 'PATIENT') {
      const patient = await prisma.patientProfile.findUnique({ where: { userId: req.user.id } });
      if (patient) where.patientId = patient.id;
    } else if (patientId) {
      where.patientId = patientId as string;
    }

    const policies = await prisma.insurancePolicy.findMany({
      where,
      include: {
        patient: {
          include: { user: { select: { fullName: true, phone: true, email: true, abhaId: true } } }
        },
        claims: {
          select: { id: true, claimNumber: true, claimAmount: true, approvedAmount: true, status: true, settledAt: true }
        }
      },
      orderBy: { validTill: 'desc' }
    });

    res.json({ success: true, policies });
  } catch (error) {
    console.error('Failed to get policies:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch insurance policies.' });
  }
});

// ==========================================
// 2. REGISTER INSURANCE POLICY
// ==========================================
router.post('/policies', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      patientId,
      providerName,
      policyNumber,
      policyHolderName,
      relationship,
      coverageAmount,
      coPayPercentage,
      validFrom,
      validTill,
      tpaName
    } = req.body;

    let targetPatientId = patientId;
    if (req.user?.role === 'PATIENT') {
      const patient = await prisma.patientProfile.findUnique({ where: { userId: req.user.id } });
      if (patient) targetPatientId = patient.id;
    }

    if (!targetPatientId || !providerName || !policyNumber || !coverageAmount) {
      res.status(400).json({
        success: false,
        message: 'Patient ID, provider name, policy number, and coverage amount are required.'
      });
      return;
    }

    const policy = await prisma.insurancePolicy.create({
      data: {
        patientId: targetPatientId,
        providerName,
        policyNumber,
        policyHolderName: policyHolderName || req.user?.fullName || 'Self',
        relationship: relationship || 'SELF',
        coverageAmount: Number(coverageAmount),
        remainingAmount: Number(coverageAmount),
        coPayPercentage: Number(coPayPercentage) || 0,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validTill: validTill ? new Date(validTill) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        tpaName,
        status: 'ACTIVE'
      }
    });

    res.status(201).json({ success: true, message: 'Insurance policy registered successfully.', policy });
  } catch (error: any) {
    console.error('Failed to register policy:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ success: false, message: 'A policy with this number already exists.' });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to register insurance policy.' });
  }
});

// ==========================================
// 3. LIST INSURANCE CLAIMS
// ==========================================
router.get('/claims', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { patientId, hospitalId, status } = req.query;
    const where: any = {};

    if (req.user?.role === 'PATIENT') {
      const patient = await prisma.patientProfile.findUnique({ where: { userId: req.user.id } });
      if (patient) where.patientId = patient.id;
    } else if (patientId) {
      where.patientId = patientId as string;
    }

    if (hospitalId) where.hospitalId = hospitalId as string;
    if (status && status !== 'ALL') where.status = status as string;

    const claims = await prisma.insuranceClaim.findMany({
      where,
      include: {
        policy: true,
        invoice: {
          select: { id: true, invoiceNumber: true, totalAmount: true, category: true, outstandingBalance: true }
        },
        patient: {
          include: { user: { select: { fullName: true, phone: true } } }
        },
        hospital: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, claims });
  } catch (error) {
    console.error('Failed to get claims:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch insurance claims.' });
  }
});

// ==========================================
// 4. FILE INSURANCE CLAIM
// ==========================================
router.post('/claims', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { policyId, invoiceId, claimAmount, preAuthCode, remarks } = req.body;

    if (!policyId || !invoiceId || !claimAmount) {
      res.status(400).json({
        success: false,
        message: 'Policy ID, Invoice ID, and Claim Amount are required.'
      });
      return;
    }

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) {
      res.status(404).json({ success: false, message: 'Invoice not found.' });
      return;
    }

    const policy = await prisma.insurancePolicy.findUnique({ where: { id: policyId } });
    if (!policy) {
      res.status(404).json({ success: false, message: 'Insurance policy not found.' });
      return;
    }

    const amount = Number(claimAmount);
    if (amount > policy.remainingAmount) {
      res.status(400).json({
        success: false,
        message: `Claim amount (₹${amount}) exceeds remaining policy limit (₹${policy.remainingAmount}).`
      });
      return;
    }

    const claimCount = await prisma.insuranceClaim.count();
    const claimNumber = `CLM-${new Date().getFullYear()}-${String(claimCount + 1).padStart(4, '0')}`;

    const claim = await prisma.insuranceClaim.create({
      data: {
        claimNumber,
        policyId,
        invoiceId,
        patientId: invoice.patientId,
        hospitalId: invoice.hospitalId || 'hosp-aims-hyd',
        claimAmount: amount,
        approvedAmount: 0,
        rejectedAmount: 0,
        patientPayable: invoice.outstandingBalance,
        status: 'SUBMITTED',
        preAuthCode,
        remarks
      },
      include: { policy: true, invoice: true }
    });

    // Audit log
    await prisma.paymentAuditLog.create({
      data: {
        action: 'CLAIM_SUBMITTED',
        performedBy: req.user?.fullName || 'User',
        role: req.user?.role || 'PATIENT',
        entityType: 'CLAIM',
        entityId: claim.id,
        details: JSON.stringify({ claimNumber, amount, invoiceNumber: invoice.invoiceNumber })
      }
    });

    res.status(201).json({ success: true, message: `Insurance claim ${claimNumber} filed successfully.`, claim });
  } catch (error) {
    console.error('Failed to file claim:', error);
    res.status(500).json({ success: false, message: 'Failed to file insurance claim.' });
  }
});

// ==========================================
// 5. UPDATE CLAIM STATUS & CASHLESS SETTLEMENT (ATOMIC)
// ==========================================
router.patch('/claims/:id/status', authenticateToken, requireRole(['CENTRAL_ADMIN', 'HOSPITAL_ADMIN', 'HOSPITAL_STAFF']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, approvedAmount, rejectedAmount, remarks } = req.body;

    const validStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SETTLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: `Invalid status. Valid values: ${validStatuses.join(', ')}` });
      return;
    }

    const claim = await prisma.insuranceClaim.findUnique({
      where: { id },
      include: { invoice: true, policy: true }
    });

    if (!claim) {
      res.status(404).json({ success: false, message: 'Insurance claim not found.' });
      return;
    }

    // If APPROVED or SETTLED, execute atomic financial settlement
    if (status === 'APPROVED' || status === 'SETTLED') {
      const approved = approvedAmount !== undefined ? Number(approvedAmount) : claim.claimAmount;
      const rejected = rejectedAmount !== undefined ? Number(rejectedAmount) : (claim.claimAmount - approved);

      const result = await prisma.$transaction(async (tx) => {
        // 1. Update Claim
        const updatedClaim = await tx.insuranceClaim.update({
          where: { id },
          data: {
            status,
            approvedAmount: approved,
            rejectedAmount: rejected,
            patientPayable: Math.max(0, claim.invoice.outstandingBalance - approved),
            settledAt: new Date(),
            ...(remarks && { remarks })
          }
        });

        // 2. Update Invoice
        const newInsuranceCovered = claim.invoice.insuranceCovered + approved;
        const newBalance = Math.max(0, claim.invoice.totalAmount - claim.invoice.paidAmount - claim.invoice.discountAmount - newInsuranceCovered);
        const newInvoiceStatus = newBalance === 0 ? 'PAID' : 'PARTIALLY_PAID';

        const updatedInvoice = await tx.invoice.update({
          where: { id: claim.invoiceId },
          data: {
            insuranceCovered: newInsuranceCovered,
            outstandingBalance: newBalance,
            status: newInvoiceStatus
          }
        });

        // 3. Deduct from policy remaining amount
        await tx.insurancePolicy.update({
          where: { id: claim.policyId },
          data: {
            remainingAmount: { decrement: approved }
          }
        });

        // 4. Post to Financial Ledger
        const ledgerCount = await tx.financialLedger.count();
        await tx.financialLedger.create({
          data: {
            ledgerRef: `LED-${new Date().getFullYear()}-${String(ledgerCount + 1).padStart(4, '0')}`,
            hospitalId: claim.hospitalId,
            entryType: 'CREDIT',
            category: 'INSURANCE_PAYOUT',
            amount: approved,
            source: 'TPA_REIMBURSEMENT',
            referenceId: claim.id,
            description: `Cashless pre-auth claim #${claim.claimNumber} settled by ${claim.policy.providerName}`
          }
        });

        // 5. Payment Audit Log
        await tx.paymentAuditLog.create({
          data: {
            action: 'CLAIM_SETTLED',
            performedBy: req.user?.fullName || 'TPA Coordinator',
            role: req.user?.role || 'STAFF',
            entityType: 'CLAIM',
            entityId: claim.id,
            details: JSON.stringify({ claimNumber: claim.claimNumber, approvedAmount: approved })
          }
        });

        return { claim: updatedClaim, invoice: updatedInvoice };
      });

      res.json({
        success: true,
        message: `Claim ${claim.claimNumber} settled for ₹${approved}. Invoice balance updated.`,
        settlement: result
      });
      return;
    }

    // Normal non-settlement status update
    const updated = await prisma.insuranceClaim.update({
      where: { id },
      data: {
        status,
        ...(rejectedAmount !== undefined && { rejectedAmount: Number(rejectedAmount) }),
        ...(remarks && { remarks })
      }
    });

    res.json({ success: true, message: `Claim status updated to ${status}.`, claim: updated });
  } catch (error: any) {
    console.error('Failed to update claim:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update claim.' });
  }
});

export default router;
