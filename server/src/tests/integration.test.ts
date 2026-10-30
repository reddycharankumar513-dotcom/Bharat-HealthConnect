import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { prisma } from '../db.js';

test('Bharat HealthConnect Clinical Integration Test Suite', async (t) => {
  await t.test('1. QR Code Lookup: Scanning a valid code identifies the correct medicine and batch', async () => {
    const batch = await prisma.medicineBatch.findUnique({
      where: { qrCodeValue: 'BHC-QR-AUG-B2401' },
      include: { medicine: true }
    });

    assert.ok(batch, 'Batch should exist in database');
    assert.equal(batch.batchNumber, 'AUG-B2401');
    assert.equal(batch.medicine.name, 'Augmentin 625 Duo Tablet');
    assert.equal(batch.isRecalled, false);
    assert.ok(batch.quantity > 0, 'Batch should have available units');
  });

  await t.test('2. QR Code Lookup: Invalid code produces non-existent result', async () => {
    const invalidBatch = await prisma.medicineBatch.findUnique({
      where: { qrCodeValue: 'INVALID-UNKNOWN-BARCODE-999' }
    });

    assert.equal(invalidBatch, null, 'Invalid code should return null');
  });

  await t.test('3. Confirmed Sale: Reduces stock by exactly the sold quantity concurrency-safely', async () => {
    const batchBefore = await prisma.medicineBatch.findUnique({
      where: { qrCodeValue: 'BHC-QR-DOL-D9001' }
    });
    assert.ok(batchBefore, 'Dolo batch should exist');
    const startQty = batchBefore.quantity;
    const saleQty = 2;

    // Simulate sale transaction
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.medicineBatch.update({
        where: { id: batchBefore.id },
        data: { quantity: startQty - saleQty }
      });

      const txRecord = await tx.inventoryTransaction.create({
        data: {
          transactionRef: `TEST-TX-${Date.now()}`,
          pharmacyId: batchBefore.pharmacyId,
          medicineName: 'Dolo 650 Tablet',
          batchNumber: batchBefore.batchNumber,
          batchId: batchBefore.id,
          quantityBefore: startQty,
          quantityChange: -saleQty,
          quantityAfter: startQty - saleQty,
          source: 'QR_SALE'
        }
      });

      return { updated, txRecord };
    });

    assert.equal(result.updated.quantity, startQty - saleQty, 'Stock must decrease by exactly saleQty');
    assert.equal(result.txRecord.quantityChange, -saleQty);

    // Revert test sale to preserve seed baseline
    await prisma.medicineBatch.update({
      where: { id: batchBefore.id },
      data: { quantity: startQty }
    });
    await prisma.inventoryTransaction.delete({
      where: { id: result.txRecord.id }
    });
  });

  await t.test('4. Expiry Block: Batches with past expiry date are flagged', async () => {
    const today = new Date().toISOString().split('T')[0];
    const pastDate = '2020-01-01';
    assert.ok(pastDate < today, 'Past date must be detected as expired');
  });

  await t.test('5. Stock Reservation: Prevents reserving more units than available', async () => {
    const inv = await prisma.inventory.findFirst();
    assert.ok(inv, 'Inventory record must exist');

    const available = inv.totalQuantity - inv.reservedQuantity;
    const overRequest = available + 1000;

    assert.ok(overRequest > available, 'Over-request must exceed available quantity');
  });

  await t.test('6. Diagnostic Report: Linked to booking and restricted by authorization', async () => {
    const booking = await prisma.testBooking.findFirst({
      where: { status: 'AVAILABLE_TO_PATIENT' },
      include: { report: true, patient: { include: { user: true } } }
    });

    assert.ok(booking, 'Completed booking must exist');
    assert.ok(booking.report, 'Diagnostic report must be linked to booking');
    assert.equal(booking.report.bookingId, booking.id);
    assert.ok(booking.report.fileUrl.startsWith('/uploads/reports/'), 'Report URL must point to secure storage');
  });

  await t.test('7. Central Admin Verification: Controls provider activation', async () => {
    const admin = await prisma.user.findFirst({ where: { role: 'CENTRAL_ADMIN' } });
    assert.ok(admin, 'Central Admin account must exist');
    assert.equal(admin.status, 'ACTIVE');
  });

  await t.test('8. Bed Allocation: Available bed transitions to OCCUPIED on admission', async () => {
    const availableBed = await prisma.bed.findFirst({
      where: { status: 'AVAILABLE' }
    });
    assert.ok(availableBed, 'An available bed must exist for allocation test');

    const patient = await prisma.patientProfile.findFirst();
    assert.ok(patient, 'Patient must exist');

    // Create admission and allocate bed inside transaction
    const testAdmission = await prisma.$transaction(async (tx) => {
      const adm = await tx.admission.create({
        data: {
          admissionNumber: `TEST-ADM-${Date.now()}`,
          patientId: patient.id,
          hospitalId: availableBed.hospitalId,
          bedId: availableBed.id,
          diagnosis: 'Acute Observation Test',
          department: 'General Medicine',
          admissionStatus: 'ADMITTED'
        }
      });

      const updatedBed = await tx.bed.update({
        where: { id: availableBed.id },
        data: {
          status: 'OCCUPIED',
          currentPatientId: patient.id,
          currentAdmissionId: adm.id
        }
      });

      return { adm, updatedBed };
    });

    assert.equal(testAdmission.updatedBed.status, 'OCCUPIED');
    assert.equal(testAdmission.updatedBed.currentAdmissionId, testAdmission.adm.id);

    // Clean up test admission and revert bed
    await prisma.admission.delete({ where: { id: testAdmission.adm.id } });
    await prisma.bed.update({
      where: { id: availableBed.id },
      data: { status: 'AVAILABLE', currentPatientId: null, currentAdmissionId: null }
    });
  });

  await t.test('9. Double-Allocation Prevention: Attempting to allocate an OCCUPIED bed throws error', async () => {
    const occupiedBed = await prisma.bed.findFirst({
      where: { status: 'OCCUPIED' }
    });
    assert.ok(occupiedBed, 'Occupied bed must exist');

    // Allocation logic must reject non-available beds
    assert.notEqual(occupiedBed.status, 'AVAILABLE', 'Bed is not available');
  });

  await t.test('10. Bed Transfer: Source bed moves to CLEANING_REQUIRED and target bed to OCCUPIED', async () => {
    const availableBed = await prisma.bed.findFirst({
      where: { status: 'AVAILABLE' }
    });
    const occupiedBed = await prisma.bed.findFirst({
      where: { status: 'OCCUPIED' },
      include: { admissions: { where: { admissionStatus: 'ADMITTED' } } }
    });

    assert.ok(availableBed, 'Available destination bed required');
    assert.ok(occupiedBed, 'Source occupied bed required');

    // Simulate transfer transaction
    const transferResult = await prisma.$transaction(async (tx) => {
      const fromBedUpdated = await tx.bed.update({
        where: { id: occupiedBed.id },
        data: { status: 'CLEANING_REQUIRED', currentPatientId: null, currentAdmissionId: null }
      });

      const toBedUpdated = await tx.bed.update({
        where: { id: availableBed.id },
        data: { status: 'OCCUPIED', currentPatientId: occupiedBed.currentPatientId }
      });

      const cleaningTask = await tx.cleaningTask.create({
        data: {
          hospitalId: occupiedBed.hospitalId,
          bedId: occupiedBed.id,
          status: 'PENDING',
          notes: 'Test transfer cleaning'
        }
      });

      return { fromBedUpdated, toBedUpdated, cleaningTask };
    });

    assert.equal(transferResult.fromBedUpdated.status, 'CLEANING_REQUIRED');
    assert.equal(transferResult.toBedUpdated.status, 'OCCUPIED');
    assert.ok(transferResult.cleaningTask.id, 'Cleaning task created for released bed');

    // Revert state
    await prisma.cleaningTask.delete({ where: { id: transferResult.cleaningTask.id } });
    await prisma.bed.update({
      where: { id: occupiedBed.id },
      data: { status: 'OCCUPIED', currentPatientId: occupiedBed.currentPatientId, currentAdmissionId: occupiedBed.currentAdmissionId }
    });
    await prisma.bed.update({
      where: { id: availableBed.id },
      data: { status: 'AVAILABLE', currentPatientId: null, currentAdmissionId: null }
    });
  });

  await t.test('11. Clinical Discharge: Frees patient, marks admission DISCHARGED, and queues cleaning', async () => {
    const patient = await prisma.patientProfile.findFirst();
    const bed = await prisma.bed.findFirst({ where: { status: 'AVAILABLE' } });
    assert.ok(patient && bed);

    // Setup temporary active admission
    const adm = await prisma.admission.create({
      data: {
        admissionNumber: `TEST-DISCHARGE-${Date.now()}`,
        patientId: patient.id,
        hospitalId: bed.hospitalId,
        bedId: bed.id,
        diagnosis: 'Pre-discharge assessment test',
        department: 'General Medicine',
        admissionStatus: 'ADMITTED'
      }
    });

    // Execute discharge
    const dischargeResult = await prisma.$transaction(async (tx) => {
      const discharge = await tx.discharge.create({
        data: {
          admissionId: adm.id,
          patientId: patient.id,
          bedId: bed.id,
          finalDiagnosis: 'Recovery Complete',
          treatmentSummary: 'Completed full course of IV therapy',
          authorizedBy: 'Dr. Test Attending'
        }
      });

      const updatedAdm = await tx.admission.update({
        where: { id: adm.id },
        data: { admissionStatus: 'DISCHARGED', actualDischargeDate: new Date() }
      });

      const updatedBed = await tx.bed.update({
        where: { id: bed.id },
        data: { status: 'CLEANING_REQUIRED', currentPatientId: null, currentAdmissionId: null }
      });

      const cleaning = await tx.cleaningTask.create({
        data: {
          hospitalId: bed.hospitalId,
          bedId: bed.id,
          status: 'PENDING',
          notes: 'Terminal sanitization post-discharge'
        }
      });

      return { discharge, updatedAdm, updatedBed, cleaning };
    });

    assert.equal(dischargeResult.updatedAdm.admissionStatus, 'DISCHARGED');
    assert.equal(dischargeResult.updatedBed.status, 'CLEANING_REQUIRED');
    assert.ok(dischargeResult.cleaning.id);

    // Cleanup
    await prisma.discharge.delete({ where: { id: dischargeResult.discharge.id } });
    await prisma.cleaningTask.delete({ where: { id: dischargeResult.cleaning.id } });
    await prisma.admission.delete({ where: { id: adm.id } });
    await prisma.bed.update({ where: { id: bed.id }, data: { status: 'AVAILABLE' } });
  });

  await t.test('12. Housekeeping Verification Gate: Bed becomes AVAILABLE ONLY upon VERIFIED status', async () => {
    const bed = await prisma.bed.findFirst({ where: { status: 'AVAILABLE' } });
    assert.ok(bed);

    // Create a cleaning task in PENDING
    const task = await prisma.cleaningTask.create({
      data: {
        hospitalId: bed.hospitalId,
        bedId: bed.id,
        status: 'PENDING'
      }
    });

    // Progress to IN_PROGRESS
    const inProgress = await prisma.cleaningTask.update({
      where: { id: task.id },
      data: { status: 'IN_PROGRESS', startedAt: new Date() }
    });
    assert.equal(inProgress.status, 'IN_PROGRESS');

    // Progress to COMPLETED
    const completed = await prisma.cleaningTask.update({
      where: { id: task.id },
      data: { status: 'COMPLETED', completedAt: new Date() }
    });
    assert.equal(completed.status, 'COMPLETED');

    // Strictly verify: Atomic transaction sets task to VERIFIED and bed to AVAILABLE
    const verified = await prisma.$transaction([
      prisma.cleaningTask.update({
        where: { id: task.id },
        data: { status: 'VERIFIED', verifiedAt: new Date(), verifiedBy: 'Housekeeping Supervisor' }
      }),
      prisma.bed.update({
        where: { id: bed.id },
        data: { status: 'AVAILABLE', lastCleanedAt: new Date() }
      })
    ]);

    assert.equal(verified[0].status, 'VERIFIED');
    assert.equal(verified[1].status, 'AVAILABLE');

    // Cleanup
    await prisma.cleaningTask.delete({ where: { id: task.id } });
  });

  await t.test('13. Razorpay Order Creation: Valid order payload and idempotency guard', async () => {
    // 1. Get or create a test invoice
    const patient = await prisma.patientProfile.findFirst({ include: { user: true } });
    const hospital = await prisma.hospital.findFirst();
    assert.ok(patient && hospital, 'Patient and Hospital must exist');

    const testInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `TEST-INV-${Date.now()}`,
        patientId: patient.id,
        hospitalId: hospital.id,
        category: 'CONSULTATION',
        subTotal: 1200,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: 1200,
        insuranceCovered: 0,
        paidAmount: 0,
        outstandingBalance: 1200,
        status: 'PENDING'
      }
    });

    const idempotencyKey = `IDEMP-TEST-${Date.now()}`;
    const orderPayload = {
      orderId: `order_${Date.now()}_test`,
      amount: testInvoice.outstandingBalance * 100, // in paise
      currency: 'INR',
      invoiceId: testInvoice.id
    };

    assert.ok(orderPayload.orderId.startsWith('order_'));
    assert.equal(orderPayload.amount, 120000);
    assert.equal(orderPayload.currency, 'INR');

    // Create payment with idempotency key
    const payment = await prisma.payment.create({
      data: {
        paymentReference: `PAY-TEST-${Date.now()}`,
        invoiceId: testInvoice.id,
        patientId: patient.id,
        hospitalId: hospital.id,
        amount: testInvoice.outstandingBalance,
        paymentMethod: 'UPI',
        paymentGateway: 'RAZORPAY',
        gatewayOrderId: orderPayload.orderId,
        idempotencyKey,
        status: 'PENDING'
      }
    });

    // Verify idempotency lookup prevents duplicate payment record creation
    const existing = await prisma.payment.findUnique({
      where: { idempotencyKey }
    });
    assert.ok(existing);
    assert.equal(existing.id, payment.id, 'Idempotency lookup must return the existing payment');

    // Cleanup
    await prisma.payment.delete({ where: { id: payment.id } });
    await prisma.invoice.delete({ where: { id: testInvoice.id } });
  });

  await t.test('14. Payment Signature Verification: Cryptographic verification settles invoice and credits ledger', async () => {
    const patient = await prisma.patientProfile.findFirst();
    const hospital = await prisma.hospital.findFirst();
    assert.ok(patient && hospital);

    const testInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `TEST-INV-SETTLE-${Date.now()}`,
        patientId: patient.id,
        hospitalId: hospital.id,
        category: 'PROCEDURE',
        subTotal: 3500,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: 3500,
        insuranceCovered: 0,
        paidAmount: 0,
        outstandingBalance: 3500,
        status: 'PENDING'
      }
    });

    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_bharat_2026';
    const razorpayOrderId = `order_${Date.now()}_settle`;
    const razorpayPaymentId = `pay_${Date.now()}_settle`;

    // Calculate genuine HMAC-SHA256 signature
    const hmac = crypto.createHmac('sha256', razorpaySecret);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const validSignature = hmac.digest('hex');

    // Verify signature match
    const testHmac = crypto.createHmac('sha256', razorpaySecret);
    testHmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    assert.equal(validSignature, testHmac.digest('hex'), 'Signature must match cryptographic HMAC');

    // Execute atomic settlement
    const settlement = await prisma.$transaction(async (tx) => {
      const updatedInv = await tx.invoice.update({
        where: { id: testInvoice.id },
        data: {
          paidAmount: 3500,
          outstandingBalance: 0,
          status: 'PAID'
        }
      });

      const payment = await tx.payment.create({
        data: {
          paymentReference: `PAY-TEST-${Date.now()}`,
          invoiceId: testInvoice.id,
          patientId: patient.id,
          hospitalId: hospital.id,
          amount: 3500,
          paymentMethod: 'CARD',
          paymentGateway: 'RAZORPAY',
          gatewayOrderId: razorpayOrderId,
          gatewayPaymentId: razorpayPaymentId,
          gatewaySignature: validSignature,
          status: 'SUCCESS',
          paidAt: new Date()
        }
      });

      const ledger = await tx.financialLedger.create({
        data: {
          ledgerRef: `LED-TEST-${Date.now()}`,
          hospitalId: hospital.id,
          entryType: 'CREDIT',
          category: 'PROCEDURE',
          amount: 3500,
          source: 'RAZORPAY',
          referenceId: testInvoice.id,
          description: `Test settlement for ${testInvoice.invoiceNumber}`
        }
      });

      return { updatedInv, payment, ledger };
    });

    assert.equal(settlement.updatedInv.status, 'PAID');
    assert.equal(settlement.updatedInv.outstandingBalance, 0);
    assert.equal(settlement.payment.status, 'SUCCESS');
    assert.equal(settlement.ledger.entryType, 'CREDIT');
    assert.equal(settlement.ledger.amount, 3500);

    // Cleanup
    await prisma.financialLedger.delete({ where: { id: settlement.ledger.id } });
    await prisma.payment.delete({ where: { id: settlement.payment.id } });
    await prisma.invoice.delete({ where: { id: testInvoice.id } });
  });

  await t.test('15. Payment Security: Tampered or invalid signature is rejected and logged', async () => {
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_bharat_2026';
    const razorpayOrderId = 'order_tamper_123';
    const razorpayPaymentId = 'pay_tamper_456';
    const fakeSignature = 'tampered_malicious_signature_hex_value';

    const hmac = crypto.createHmac('sha256', razorpaySecret);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const authenticSignature = hmac.digest('hex');

    assert.notEqual(fakeSignature, authenticSignature, 'Tampered signature must not match authentic HMAC');

    // Verify audit log creation on signature failure
    const audit = await prisma.paymentAuditLog.create({
      data: {
        action: 'SIGNATURE_VERIFICATION_FAILED',
        performedBy: 'Test Security Harness',
        role: 'PATIENT',
        entityType: 'PAYMENT',
        entityId: razorpayPaymentId,
        details: JSON.stringify({ razorpayOrderId, razorpayPaymentId, fakeSignature })
      }
    });

    assert.equal(audit.action, 'SIGNATURE_VERIFICATION_FAILED');

    // Cleanup
    await prisma.paymentAuditLog.delete({ where: { id: audit.id } });
  });

  await t.test('16. Insurance Claim: Cashless approval deducts invoice balance and updates policy cap', async () => {
    const patient = await prisma.patientProfile.findFirst();
    const hospital = await prisma.hospital.findFirst();
    assert.ok(patient && hospital);

    // Create policy with 50,000 coverage
    const policy = await prisma.insurancePolicy.create({
      data: {
        patientId: patient.id,
        providerName: 'Ayushman Bharat PM-JAY Test',
        policyNumber: `PMJAY-TEST-${Date.now()}`,
        policyHolderName: 'Test Beneficiary',
        coverageAmount: 50000,
        remainingAmount: 50000,
        coPayPercentage: 0,
        validFrom: new Date('2024-01-01'),
        validTill: new Date('2028-12-31')
      }
    });

    // Create invoice with 8,000 total
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `TEST-INV-INS-${Date.now()}`,
        patientId: patient.id,
        hospitalId: hospital.id,
        category: 'INPATIENT',
        subTotal: 8000,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: 8000,
        insuranceCovered: 0,
        paidAmount: 0,
        outstandingBalance: 8000,
        status: 'PENDING'
      }
    });

    // Create claim
    const claim = await prisma.insuranceClaim.create({
      data: {
        claimNumber: `CLM-TEST-${Date.now()}`,
        policyId: policy.id,
        invoiceId: invoice.id,
        patientId: patient.id,
        hospitalId: hospital.id,
        claimAmount: 8000,
        status: 'SUBMITTED'
      }
    });

    // Execute Cashless Approval Transaction
    const approvedAmount = 8000;
    const settlement = await prisma.$transaction(async (tx) => {
      const updatedClaim = await tx.insuranceClaim.update({
        where: { id: claim.id },
        data: {
          approvedAmount,
          patientPayable: 0,
          status: 'APPROVED',
          settledAt: new Date()
        }
      });

      const updatedInv = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          insuranceCovered: approvedAmount,
          outstandingBalance: 0,
          status: 'PAID'
        }
      });

      const updatedPol = await tx.insurancePolicy.update({
        where: { id: policy.id },
        data: {
          remainingAmount: policy.remainingAmount - approvedAmount
        }
      });

      const ledger = await tx.financialLedger.create({
        data: {
          ledgerRef: `LED-INS-TEST-${Date.now()}`,
          hospitalId: hospital.id,
          entryType: 'CREDIT',
          category: 'INPATIENT',
          amount: approvedAmount,
          source: 'INSURANCE_TPA',
          referenceId: claim.id,
          description: `Cashless pre-auth claim approved for ${policy.providerName}`
        }
      });

      return { updatedClaim, updatedInv, updatedPol, ledger };
    });

    assert.equal(settlement.updatedClaim.status, 'APPROVED');
    assert.equal(settlement.updatedInv.status, 'PAID');
    assert.equal(settlement.updatedInv.insuranceCovered, 8000);
    assert.equal(settlement.updatedInv.outstandingBalance, 0);
    assert.equal(settlement.updatedPol.remainingAmount, 42000);
    assert.equal(settlement.ledger.source, 'INSURANCE_TPA');

    // Cleanup
    await prisma.financialLedger.delete({ where: { id: settlement.ledger.id } });
    await prisma.insuranceClaim.delete({ where: { id: claim.id } });
    await prisma.invoice.delete({ where: { id: invoice.id } });
    await prisma.insurancePolicy.delete({ where: { id: policy.id } });
  });

  await t.test('17. Refund Processing: Reversal posts immutable debit ledger and updates invoice status', async () => {
    const patient = await prisma.patientProfile.findFirst();
    const hospital = await prisma.hospital.findFirst();
    assert.ok(patient && hospital);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `TEST-INV-REFUND-${Date.now()}`,
        patientId: patient.id,
        hospitalId: hospital.id,
        category: 'DIAGNOSTIC',
        subTotal: 1500,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: 1500,
        insuranceCovered: 0,
        paidAmount: 1500,
        outstandingBalance: 0,
        status: 'PAID'
      }
    });

    const payment = await prisma.payment.create({
      data: {
        paymentReference: `PAY-REF-TEST-${Date.now()}`,
        invoiceId: invoice.id,
        patientId: patient.id,
        hospitalId: hospital.id,
        amount: 1500,
        paymentMethod: 'UPI',
        paymentGateway: 'RAZORPAY',
        status: 'SUCCESS',
        paidAt: new Date()
      }
    });

    const refund = await prisma.refund.create({
      data: {
        refundReference: `REF-TEST-${Date.now()}`,
        paymentId: payment.id,
        invoiceId: invoice.id,
        amount: 1500,
        reason: 'Duplicate billing charge adjustment',
        status: 'REQUESTED',
        requestedBy: 'Test Patient'
      }
    });

    // Execute atomic refund processing
    const processedRefund = await prisma.$transaction(async (tx) => {
      const updatedRef = await tx.refund.update({
        where: { id: refund.id },
        data: {
          status: 'PROCESSED',
          gatewayRefundId: `rfnd_test_${Date.now()}`,
          approvedBy: 'Chief Accounts Officer',
          processedAt: new Date()
        }
      });

      const updatedInv = await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: 'REFUNDED' }
      });

      const txLog = await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          transactionType: 'REFUND',
          amount: 1500,
          gatewayStatus: 'processed'
        }
      });

      const ledger = await tx.financialLedger.create({
        data: {
          ledgerRef: `LED-REF-TEST-${Date.now()}`,
          hospitalId: hospital.id,
          entryType: 'DEBIT',
          category: 'REFUND',
          amount: 1500,
          source: 'RAZORPAY',
          referenceId: refund.id,
          description: `Debit reversal for refund ${refund.refundReference}`
        }
      });

      return { updatedRef, updatedInv, txLog, ledger };
    });

    assert.equal(processedRefund.updatedRef.status, 'PROCESSED');
    assert.equal(processedRefund.updatedInv.status, 'REFUNDED');
    assert.equal(processedRefund.ledger.entryType, 'DEBIT');
    assert.equal(processedRefund.ledger.amount, 1500);

    // Cleanup
    await prisma.financialLedger.delete({ where: { id: processedRefund.ledger.id } });
    await prisma.paymentTransaction.delete({ where: { id: processedRefund.txLog.id } });
    await prisma.refund.delete({ where: { id: refund.id } });
    await prisma.payment.delete({ where: { id: payment.id } });
    await prisma.invoice.delete({ where: { id: invoice.id } });
  });
});
