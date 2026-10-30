import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// ==========================================
// 1. LIST INVOICES
// ==========================================
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { patientId, hospitalId, doctorId, status, category, search } = req.query;
    const where: any = {};

    // Patient filter: patients can only see their own invoices
    if (req.user?.role === 'PATIENT') {
      const patient = await prisma.patientProfile.findUnique({ where: { userId: req.user.id } });
      if (patient) {
        where.patientId = patient.id;
      }
    } else if (patientId) {
      where.patientId = patientId as string;
    }

    if (hospitalId) where.hospitalId = hospitalId as string;
    if (doctorId) where.doctorId = doctorId as string;
    if (status && status !== 'ALL') where.status = status as string;
    if (category && category !== 'ALL') where.category = category as string;

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search as string } },
        { notes: { contains: search as string } },
        { patient: { user: { fullName: { contains: search as string } } } }
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        patient: {
          include: {
            user: { select: { fullName: true, email: true, phone: true, abhaId: true } }
          }
        },
        hospital: { select: { id: true, name: true, city: true, phone: true } },
        doctor: {
          include: {
            user: { select: { fullName: true } }
          }
        },
        items: true,
        payments: {
          select: { id: true, paymentReference: true, amount: true, paymentMethod: true, status: true, paidAt: true }
        },
        insuranceClaims: {
          select: { id: true, claimNumber: true, claimAmount: true, approvedAmount: true, status: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, invoices });
  } catch (error) {
    console.error('Failed to get invoices:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invoices.' });
  }
});

// ==========================================
// 2. GET INVOICE BY ID (DETAIL)
// ==========================================
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: { select: { fullName: true, email: true, phone: true, abhaId: true } }
          }
        },
        hospital: true,
        doctor: {
          include: {
            user: { select: { fullName: true, email: true } }
          }
        },
        items: true,
        payments: {
          include: { transactions: true }
        },
        refunds: true,
        insuranceClaims: {
          include: { policy: true }
        }
      }
    });

    if (!invoice) {
      res.status(404).json({ success: false, message: 'Invoice not found.' });
      return;
    }

    // Role check: If patient, must be owner
    if (req.user?.role === 'PATIENT') {
      const patient = await prisma.patientProfile.findUnique({ where: { userId: req.user.id } });
      if (invoice.patientId !== patient?.id) {
        res.status(403).json({ success: false, message: 'Access denied to this invoice.' });
        return;
      }
    }

    res.json({ success: true, invoice });
  } catch (error) {
    console.error('Failed to get invoice detail:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve invoice details.' });
  }
});

// ==========================================
// 3. CREATE INVOICE WITH ITEMIZED CHARGES
// ==========================================
router.post('/', authenticateToken, requireRole(['CENTRAL_ADMIN', 'HOSPITAL_ADMIN', 'HOSPITAL_STAFF', 'DOCTOR', 'PHARMACIST', 'LAB_ADMIN', 'LAB_STAFF']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      patientId,
      hospitalId,
      doctorId,
      category,
      items,
      discountAmount,
      discountReason,
      notes,
      dueDate,
      appointmentId,
      admissionId,
      orderId,
      testBookingId
    } = req.body;

    if (!patientId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Patient ID and at least one itemized service charge are required.' });
      return;
    }

    // Calculate subtotal and tax
    let subTotal = 0;
    let taxAmount = 0;

    const validatedItems = items.map((item: any) => {
      const qty = Number(item.quantity) || 1;
      const unitPrice = Number(item.unitPrice) || 0;
      const taxRate = Number(item.taxRate) || 0;
      const totalPrice = qty * unitPrice;
      const itemTax = (totalPrice * taxRate) / 100;

      subTotal += totalPrice;
      taxAmount += itemTax;

      return {
        serviceCategory: item.serviceCategory || 'GENERAL',
        description: item.description,
        quantity: qty,
        unitPrice,
        totalPrice,
        taxRate
      };
    });

    const discount = Number(discountAmount) || 0;
    const totalAmount = Math.max(0, subTotal + taxAmount - discount);
    const outstandingBalance = totalAmount;

    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        patientId,
        hospitalId: hospitalId || 'hosp-aims-hyd',
        doctorId: doctorId || undefined,
        category: category || 'CONSULTATION',
        appointmentId,
        admissionId,
        orderId,
        testBookingId,
        subTotal,
        discountAmount: discount,
        discountReason,
        taxAmount,
        totalAmount,
        insuranceCovered: 0,
        paidAmount: 0,
        outstandingBalance,
        status: 'PENDING',
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notes,
        items: {
          create: validatedItems
        }
      },
      include: {
        items: true,
        patient: {
          include: {
            user: { select: { fullName: true, phone: true, email: true } }
          }
        }
      }
    });

    // Audit Log
    await prisma.paymentAuditLog.create({
      data: {
        action: 'INVOICE_GENERATED',
        performedBy: req.user?.fullName || 'Hospital Staff',
        role: req.user?.role || 'STAFF',
        entityType: 'INVOICE',
        entityId: invoice.id,
        details: JSON.stringify({ invoiceNumber, totalAmount, category })
      }
    });

    res.status(201).json({
      success: true,
      message: `Invoice ${invoiceNumber} created successfully.`,
      invoice
    });
  } catch (error) {
    console.error('Failed to create invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to create invoice.' });
  }
});

// ==========================================
// 4. AUTO-GENERATE INVOICE FROM WORKFLOW
// ==========================================
router.post('/auto-generate', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { source, sourceId, patientId, hospitalId } = req.body; // source: 'APPOINTMENT' | 'ADMISSION' | 'PHARMACY' | 'LAB'

    if (!source || !sourceId || !patientId) {
      res.status(400).json({ success: false, message: 'Source type, source ID, and patient ID are required.' });
      return;
    }

    let category = 'CONSULTATION';
    let items: any[] = [];
    let notes = '';

    if (source === 'APPOINTMENT') {
      const appt = await prisma.appointment.findUnique({
        where: { id: sourceId },
        include: { doctor: { include: { user: true } } }
      });
      if (!appt) {
        res.status(404).json({ success: false, message: 'Appointment not found.' });
        return;
      }
      category = 'CONSULTATION';
      items = [
        {
          serviceCategory: 'DOCTOR_CONSULTATION',
          description: `Specialist Consultation with ${appt.doctor.user.fullName} (${appt.type})`,
          quantity: 1,
          unitPrice: appt.fee || 500,
          totalPrice: appt.fee || 500,
          taxRate: 0
        }
      ];
      notes = `Automated billing for appointment on ${appt.date} at ${appt.timeSlot}`;
    } else if (source === 'PHARMACY') {
      const order = await prisma.medicineOrder.findUnique({
        where: { id: sourceId },
        include: { items: { include: { medicine: true } } }
      });
      if (!order) {
        res.status(404).json({ success: false, message: 'Medicine order not found.' });
        return;
      }
      category = 'PHARMACY';
      items = order.items.map(it => ({
        serviceCategory: 'MEDICINE',
        description: `${it.medicine.name} (${it.medicine.strength || ''})`,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
        taxRate: 5
      }));
      notes = `Prescription medication fulfillment order #${order.orderNumber}`;
    } else if (source === 'LAB') {
      const booking = await prisma.testBooking.findUnique({
        where: { id: sourceId },
        include: { test: true }
      });
      if (!booking) {
        res.status(404).json({ success: false, message: 'Diagnostic booking not found.' });
        return;
      }
      category = 'DIAGNOSTIC';
      items = [
        {
          serviceCategory: 'LAB_TEST',
          description: booking.test.name,
          quantity: 1,
          unitPrice: booking.test.priceINR,
          totalPrice: booking.test.priceINR,
          taxRate: 0
        }
      ];
      notes = `Diagnostic test booking #${booking.bookingRef}`;
    } else if (source === 'ADMISSION') {
      const adm = await prisma.admission.findUnique({
        where: { id: sourceId },
        include: { bed: { include: { ward: true } } }
      });
      if (!adm) {
        res.status(404).json({ success: false, message: 'Admission not found.' });
        return;
      }
      category = 'INPATIENT';
      items = [
        {
          serviceCategory: 'BED_CHARGE',
          description: `Bed Tariff (${adm.bed?.bedNumber || 'Inpatient Bed'}, ${adm.bed?.ward.name || 'General'})`,
          quantity: 1,
          unitPrice: adm.bed?.dailyTariff || 1500,
          totalPrice: adm.bed?.dailyTariff || 1500,
          taxRate: 0
        },
        {
          serviceCategory: 'NURSING',
          description: 'Daily Nursing & Clinical Monitoring Care',
          quantity: 1,
          unitPrice: 500,
          totalPrice: 500,
          taxRate: 0
        }
      ];
      notes = `Inpatient admission billing for admission #${adm.admissionNumber}`;
    }

    const subTotal = items.reduce((acc, it) => acc + it.totalPrice, 0);
    const taxAmount = items.reduce((acc, it) => acc + (it.totalPrice * it.taxRate) / 100, 0);
    const totalAmount = subTotal + taxAmount;

    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        patientId,
        hospitalId: hospitalId || 'hosp-aims-hyd',
        category,
        subTotal,
        taxAmount,
        totalAmount,
        outstandingBalance: totalAmount,
        status: 'PENDING',
        notes,
        items: {
          create: items
        }
      },
      include: { items: true }
    });

    res.status(201).json({
      success: true,
      message: `Generated invoice ${invoiceNumber} from ${source}.`,
      invoice
    });
  } catch (error) {
    console.error('Failed to auto-generate invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to auto-generate invoice.' });
  }
});

// ==========================================
// 5. DOWNLOADABLE INVOICE / RECEIPT HTML
// ==========================================
router.get('/:id/pdf', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        hospital: true,
        items: true,
        payments: true
      }
    });

    if (!invoice) {
      res.status(404).json({ success: false, message: 'Invoice not found.' });
      return;
    }

    // Return HTML printable format that triggers browser print/PDF download
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bharat HealthConnect Tax Invoice - ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #1e293b; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f766e; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #0f766e; }
          .meta { font-size: 12px; color: #64748b; }
          .grid { display: flex; justify-content: space-between; margin-top: 24px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          th { background-color: #f1f5f9; padding: 10px; text-align: left; font-size: 12px; font-weight: bold; }
          td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          .totals { margin-top: 24px; float: right; width: 300px; font-size: 13px; }
          .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
          .total-line { font-size: 16px; font-weight: bold; color: #0f766e; border-top: 2px solid #0f766e; padding-top: 8px; margin-top: 8px; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: bold; }
          .paid { background-color: #dcfce7; color: #15803d; }
          .pending { background-color: #fef3c7; color: #b45309; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">Bharat HealthConnect</div>
            <div class="meta">One Nation. One Connected Healthcare Ecosystem.</div>
            <div class="meta" style="margin-top: 6px;">Hospital: ${invoice.hospital?.name || 'AIIMS Hyderabad Super Speciality'}</div>
            <div class="meta">${invoice.hospital?.address || 'Bibinagar, Hyderabad'} • GSTIN: 36AAACB1234F1Z8</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: bold;">TAX INVOICE</div>
            <div class="meta">Invoice: <strong>${invoice.invoiceNumber}</strong></div>
            <div class="meta">Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}</div>
            <div style="margin-top: 8px;">
              <span class="badge ${invoice.status === 'PAID' ? 'paid' : 'pending'}">${invoice.status}</span>
            </div>
          </div>
        </div>

        <div class="grid">
          <div>
            <strong>Billed To (Patient):</strong>
            <div>${invoice.patient.user.fullName}</div>
            <div>Phone: ${invoice.patient.user.phone}</div>
            <div>ABHA ID: ${invoice.patient.user.abhaId || 'ABHA-LINKED'}</div>
          </div>
          <div style="text-align: right;">
            <strong>Category:</strong> ${invoice.category}<br/>
            <strong>Payment Mode:</strong> ${invoice.payments?.[0]?.paymentMethod || 'Razorpay Gateway'}<br/>
            <strong>Reference ID:</strong> ${invoice.payments?.[0]?.paymentReference || 'N/A'}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Service Item Description</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th style="text-align: right;">Total (INR)</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((it, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${it.description}</strong></td>
                <td>${it.serviceCategory}</td>
                <td>${it.quantity}</td>
                <td>₹${it.unitPrice.toLocaleString('en-IN')}</td>
                <td style="text-align: right;">₹${it.totalPrice.toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div><span>Subtotal:</span><span>₹${invoice.subTotal.toLocaleString('en-IN')}</span></div>
          <div><span>GST / Tax:</span><span>₹${invoice.taxAmount.toLocaleString('en-IN')}</span></div>
          ${invoice.discountAmount > 0 ? `<div><span>Discount Concession:</span><span>-₹${invoice.discountAmount.toLocaleString('en-IN')}</span></div>` : ''}
          ${invoice.insuranceCovered > 0 ? `<div><span>Insurance Cashless Approval:</span><span>-₹${invoice.insuranceCovered.toLocaleString('en-IN')}</span></div>` : ''}
          <div class="total-line"><span>Net Amount Payable:</span><span>₹${invoice.totalAmount.toLocaleString('en-IN')}</span></div>
          <div><span>Amount Paid:</span><span style="color: #15803d; font-weight: bold;">₹${invoice.paidAmount.toLocaleString('en-IN')}</span></div>
          <div><span>Outstanding Balance:</span><span style="color: #b91c1c; font-weight: bold;">₹${invoice.outstandingBalance.toLocaleString('en-IN')}</span></div>
        </div>

        <div style="clear: both; margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
          This is a computer-generated digital tax invoice authorized under Bharat HealthConnect & National Digital Health Mission standards.
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
    console.error('Failed to generate PDF invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to generate printable invoice.' });
  }
});

export default router;
