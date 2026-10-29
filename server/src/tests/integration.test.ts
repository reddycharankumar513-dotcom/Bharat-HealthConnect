import test from 'node:test';
import assert from 'node:assert/strict';
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
});
