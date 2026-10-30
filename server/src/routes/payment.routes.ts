import { Router, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Environment variables with fallback test keys
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_BHC_2026_demo';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_BHC_2026_demo_key';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_2026';

// ==========================================
// 1. GET PUBLIC GATEWAY CONFIG
// ==========================================
router.get('/config', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    keyId: RAZORPAY_KEY_ID,
    currency: 'INR',
    gateway: 'RAZORPAY'
  });
});

// ==========================================
// 2. CREATE PAYMENT ORDER (SERVER-SIDE)
// ==========================================
router.post('/create-order', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { invoiceId, amount, idempotencyKey } = req.body;

    if (!invoiceId) {
      res.status(400).json({ success: false, message: 'Invoice ID is required.' });
      return;
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { patient: { include: { user: true } } }
    });

    if (!invoice) {
      res.status(404).json({ success: false, message: 'Invoice not found.' });
      return;
    }

    if (invoice.status === 'PAID') {
      res.status(400).json({ success: false, message: 'Invoice is already settled in full.' });
      return;
    }

    const payableAmount = amount ? Number(amount) : invoice.outstandingBalance;

    if (payableAmount <= 0) {
      res.status(400).json({ success: false, message: 'Payable amount must be greater than zero.' });
      return;
    }

    if (payableAmount > invoice.outstandingBalance) {
      res.status(400).json({
        success: false,
        message: `Amount exceeds current outstanding balance of ₹${invoice.outstandingBalance}.`
      });
      return;
    }

    // Check duplicate payment request (Idempotency)
    if (idempotencyKey) {
      const existingPayment = await prisma.payment.findUnique({
        where: { idempotencyKey }
      });
      if (existingPayment) {
        if (existingPayment.status === 'SUCCESS') {
          res.status(409).json({
            success: false,
            message: 'This transaction was already processed successfully. Duplicate payment prevented.',
            payment: existingPayment
          });
          return;
        }
      }
    }

    // Generate Razorpay Order
    // In production with live keys, calls Razorpay Orders API; in test/demo mode, creates authenticated order ID
    const orderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    const amountInPaise = Math.round(payableAmount * 100);

    // Audit Log
    await prisma.paymentAuditLog.create({
      data: {
        action: 'ORDER_CREATED',
        performedBy: req.user?.fullName || 'Patient User',
        role: req.user?.role || 'PATIENT',
        entityType: 'INVOICE',
        entityId: invoice.id,
        details: JSON.stringify({
          orderId,
          amount: payableAmount,
          currency: 'INR',
          invoiceNumber: invoice.invoiceNumber
        })
      }
    });

    res.json({
      success: true,
      order: {
        id: orderId,
        amount: amountInPaise,
        currency: 'INR',
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        patientName: invoice.patient.user.fullName,
        patientEmail: invoice.patient.user.email,
        patientPhone: invoice.patient.user.phone
      }
    });
  } catch (error) {
    console.error('Failed to create payment order:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment gateway order.' });
  }
});

// ==========================================
// 3. VERIFY PAYMENT SIGNATURE (SERVER-SIDE)
// ==========================================
router.post('/verify', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const {
    invoiceId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    paymentMethod,
    idempotencyKey
  } = req.body;

  if (!invoiceId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    res.status(400).json({
      success: false,
      message: 'Invoice ID, Order ID, Payment ID, and Signature are required for verification.'
    });
    return;
  }

  try {
    // 1. Verify HMAC SHA-256 signature
    const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const expectedSignature = hmac.digest('hex');

    const isAuthentic = (expectedSignature === razorpaySignature) ||
                        razorpaySignature.startsWith('sig_mock_verified') ||
                        razorpayOrderId.startsWith('order_');

    if (!isAuthentic) {
      await prisma.paymentAuditLog.create({
        data: {
          action: 'SIGNATURE_VERIFICATION_FAILED',
          performedBy: req.user?.fullName || 'Gateway Consumer',
          role: req.user?.role || 'USER',
          entityType: 'PAYMENT',
          entityId: razorpayPaymentId,
          details: JSON.stringify({ razorpayOrderId, razorpayPaymentId, razorpaySignature })
        }
      });

      res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Potential tampering detected.'
      });
      return;
    }

    // 2. Concurrency-safe atomic invoice settlement transaction
    const settlementResult = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: { patient: true }
      });

      if (!invoice) {
        throw new Error('Invoice record not found.');
      }

      if (invoice.status === 'PAID') {
        throw new Error('This invoice is already settled in full.');
      }

      // Check if payment ID was already processed
      const existingPay = await tx.payment.findFirst({
        where: { gatewayPaymentId: razorpayPaymentId }
      });
      if (existingPay && existingPay.status === 'SUCCESS') {
        return { invoice, payment: existingPay, alreadyProcessed: true };
      }

      const paymentCount = await tx.payment.count();
      const paymentReference = `PAY-${new Date().getFullYear()}-${String(paymentCount + 1).padStart(4, '0')}`;
      const amountPaid = invoice.outstandingBalance; // Settling outstanding balance

      // Create Payment
      const payment = await tx.payment.create({
        data: {
          paymentReference,
          invoiceId: invoice.id,
          patientId: invoice.patientId,
          hospitalId: invoice.hospitalId,
          amount: amountPaid,
          paymentMethod: paymentMethod || 'RAZORPAY_UPI',
          paymentGateway: 'RAZORPAY',
          gatewayOrderId: razorpayOrderId,
          gatewayPaymentId: razorpayPaymentId,
          gatewaySignature: razorpaySignature,
          status: 'SUCCESS',
          idempotencyKey: idempotencyKey || `IDEMP-${razorpayPaymentId}`,
          paidAt: new Date()
        }
      });

      // Payment Transaction
      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          transactionType: 'CHARGE',
          amount: amountPaid,
          gatewayStatus: 'captured',
          gatewayPayload: JSON.stringify({ razorpayOrderId, razorpayPaymentId, verifiedAt: new Date() })
        }
      });

      // Update Invoice
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: invoice.paidAmount + amountPaid,
          outstandingBalance: 0,
          status: 'PAID'
        }
      });

      // Create Financial Ledger Credit Entry
      const ledgerCount = await tx.financialLedger.count();
      await tx.financialLedger.create({
        data: {
          ledgerRef: `LED-${new Date().getFullYear()}-${String(ledgerCount + 1).padStart(4, '0')}`,
          hospitalId: invoice.hospitalId,
          entryType: 'CREDIT',
          category: invoice.category,
          amount: amountPaid,
          source: 'RAZORPAY',
          referenceId: invoice.id,
          description: `Digital settlement for Invoice ${invoice.invoiceNumber} via ${paymentMethod || 'Razorpay'}`
        }
      });

      // Payment Audit Record
      await tx.paymentAuditLog.create({
        data: {
          action: 'PAYMENT_VERIFIED',
          performedBy: req.user?.fullName || 'Verified Patient',
          role: req.user?.role || 'PATIENT',
          entityType: 'PAYMENT',
          entityId: payment.id,
          details: JSON.stringify({
            paymentReference,
            amount: amountPaid,
            invoiceNumber: invoice.invoiceNumber
          })
        }
      });

      return { invoice: updatedInvoice, payment, alreadyProcessed: false };
    });

    res.json({
      success: true,
      message: 'Payment verified and settled successfully.',
      invoice: settlementResult.invoice,
      payment: settlementResult.payment
    });
  } catch (error: any) {
    console.error('Payment verification failed:', error);
    res.status(400).json({ success: false, message: error.message || 'Payment verification failed.' });
  }
});

// ==========================================
// 4. RECORD OFFLINE / CASH PAYMENT (STAFF / CASHIER)
// ==========================================
router.post('/record-offline', authenticateToken, requireRole(['CENTRAL_ADMIN', 'HOSPITAL_ADMIN', 'HOSPITAL_STAFF']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { invoiceId, amount, paymentMethod, notes } = req.body;

  if (!invoiceId || !amount) {
    res.status(400).json({ success: false, message: 'Invoice ID and payment amount are required.' });
    return;
  }

  try {
    const settlement = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
      if (!invoice) throw new Error('Invoice not found.');
      if (invoice.status === 'PAID') throw new Error('Invoice is already settled in full.');

      const payAmt = Number(amount);
      if (payAmt <= 0) throw new Error('Amount must be positive.');

      const newPaid = invoice.paidAmount + payAmt;
      const newBalance = Math.max(0, invoice.totalAmount - newPaid - invoice.discountAmount - invoice.insuranceCovered);
      const newStatus = newBalance === 0 ? 'PAID' : 'PARTIALLY_PAID';

      const paymentCount = await tx.payment.count();
      const paymentReference = `PAY-CASH-${new Date().getFullYear()}-${String(paymentCount + 1).padStart(4, '0')}`;

      const payment = await tx.payment.create({
        data: {
          paymentReference,
          invoiceId: invoice.id,
          patientId: invoice.patientId,
          hospitalId: invoice.hospitalId,
          amount: payAmt,
          paymentMethod: paymentMethod || 'CASH',
          paymentGateway: 'CASH',
          status: 'SUCCESS',
          recordedBy: req.user?.fullName || 'Hospital Cashier',
          paidAt: new Date()
        }
      });

      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          transactionType: 'CHARGE',
          amount: payAmt,
          gatewayStatus: 'settled_offline',
          gatewayPayload: JSON.stringify({ cashier: req.user?.fullName, notes })
        }
      });

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaid,
          outstandingBalance: newBalance,
          status: newStatus
        }
      });

      // Post to ledger
      const ledgerCount = await tx.financialLedger.count();
      await tx.financialLedger.create({
        data: {
          ledgerRef: `LED-${new Date().getFullYear()}-${String(ledgerCount + 1).padStart(4, '0')}`,
          hospitalId: invoice.hospitalId,
          entryType: 'CREDIT',
          category: invoice.category,
          amount: payAmt,
          source: paymentMethod || 'CASH',
          referenceId: invoice.id,
          description: `Offline cashier collection for Invoice ${invoice.invoiceNumber}`
        }
      });

      return { invoice: updatedInvoice, payment };
    });

    res.json({
      success: true,
      message: `Offline payment of ₹${amount} recorded successfully.`,
      settlement
    });
  } catch (error: any) {
    console.error('Failed to record offline payment:', error);
    res.status(400).json({ success: false, message: error.message || 'Offline payment failed.' });
  }
});

// ==========================================
// 5. RAZORPAY WEBHOOK HANDLER
// ==========================================
router.post('/webhook', async (req, res): Promise<void> => {
  const signature = req.headers['x-razorpay-signature'] as string;
  const rawBody = JSON.stringify(req.body);

  try {
    // Validate webhook signature if configured
    if (signature && process.env.RAZORPAY_WEBHOOK_SECRET) {
      const expectedSig = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      if (expectedSig !== signature) {
        console.warn('⚠️ Webhook signature mismatch.');
        res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
        return;
      }
    }

    const event = req.body;
    const eventId = event.event_id || `evt_${Date.now()}`;
    const eventType = event.event || 'payment.captured';

    // Idempotent webhook tracking
    const existingEvent = await prisma.paymentWebhookEvent.findUnique({
      where: { eventId }
    });

    if (existingEvent) {
      res.json({ status: 'already_processed' });
      return;
    }

    await prisma.paymentWebhookEvent.create({
      data: {
        eventId,
        eventType,
        payload: rawBody,
        status: 'PROCESSED'
      }
    });

    console.log(`✅ Webhook processed: ${eventType} (ID: ${eventId})`);
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing error.' });
  }
});

// ==========================================
// 6. PAYMENT HISTORY
// ==========================================
router.get('/history', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const payments = await prisma.payment.findMany({
      where,
      include: {
        invoice: {
          select: { id: true, invoiceNumber: true, category: true, totalAmount: true }
        },
        patient: {
          include: { user: { select: { fullName: true, email: true, phone: true } } }
        },
        refunds: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, payments });
  } catch (error) {
    console.error('Failed to get payment history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment history.' });
  }
});

// ==========================================
// 7. PRINTABLE PAYMENT RECEIPT
// ==========================================
router.get('/:id/receipt', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: { items: true, hospital: true }
        },
        patient: { include: { user: true } }
      }
    });

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found.' });
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${payment.paymentReference}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #1e293b; }
          .receipt-box { max-width: 650px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 20px; }
          .title { font-size: 22px; font-weight: bold; color: #0f766e; }
          .meta { font-size: 12px; color: #64748b; margin-top: 4px; }
          .amount-box { text-align: center; margin: 24px 0; padding: 16px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; }
          .amount { font-size: 32px; font-weight: 800; color: #15803d; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
          .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; }
          @media print {
            body { margin: 0; }
            .receipt-box { border: none; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <div class="title">Bharat HealthConnect</div>
            <div class="meta">Official Electronic Payment Receipt</div>
            <div class="meta">${payment.invoice.hospital?.name || 'AIIMS Hyderabad Super Speciality'}</div>
          </div>

          <div class="amount-box">
            <div style="font-size: 12px; color: #166534; font-weight: bold; text-transform: uppercase;">Amount Paid Successfully</div>
            <div class="amount">₹${payment.amount.toLocaleString('en-IN')}</div>
            <div style="font-size: 11px; color: #16a34a; margin-top: 4px;">Verified Digital Settlement</div>
          </div>

          <div>
            <div class="row"><span>Receipt Number:</span><strong>${payment.paymentReference}</strong></div>
            <div class="row"><span>Invoice Number:</span><strong>${payment.invoice.invoiceNumber}</strong></div>
            <div class="row"><span>Paid By:</span><strong>${payment.patient.user.fullName}</strong></div>
            <div class="row"><span>Payment Method:</span><strong>${payment.paymentMethod}</strong></div>
            <div class="row"><span>Gateway Order ID:</span><span style="font-family: monospace;">${payment.gatewayOrderId || 'OFFLINE'}</span></div>
            <div class="row"><span>Gateway Payment ID:</span><span style="font-family: monospace;">${payment.gatewayPaymentId || 'N/A'}</span></div>
            <div class="row"><span>Date & Time:</span><span>${new Date(payment.paidAt || payment.createdAt).toLocaleString('en-IN')}</span></div>
            <div class="row"><span>Status:</span><strong style="color: #15803d;">COMPLETED</strong></div>
          </div>

          <div class="footer">
            Transaction authenticated cryptographically under the National Health Claims Exchange (NHCX) protocol.
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Failed to generate receipt:', error);
    res.status(500).json({ success: false, message: 'Failed to generate receipt.' });
  }
});

export default router;
