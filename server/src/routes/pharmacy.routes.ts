import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/pharmacy/inventory - Get all inventory with batches and threshold status
router.get('/inventory', async (req, res): Promise<void> => {
  try {
    const medicines = await prisma.medicine.findMany({
      include: {
        inventories: {
          include: {
            pharmacy: true
          }
        },
        batches: {
          orderBy: { expiryDate: 'asc' }
        }
      }
    });

    res.json({ success: true, medicines });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory.' });
  }
});

// GET /api/pharmacy/qr/lookup - Scan QR Code or manual barcode lookup
router.get('/qr/lookup', async (req, res): Promise<void> => {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    res.status(400).json({ success: false, message: 'Valid QR code or barcode identifier is required.' });
    return;
  }

  const cleanCode = code.trim();

  try {
    // 1. First search by exact QR code value
    let batch = await prisma.medicineBatch.findUnique({
      where: { qrCodeValue: cleanCode },
      include: {
        medicine: true,
        pharmacy: true
      }
    });

    // 2. Fallback to SKU or Batch Number search
    if (!batch) {
      batch = await prisma.medicineBatch.findFirst({
        where: {
          OR: [
            { batchNumber: cleanCode },
            { sku: cleanCode }
          ]
        },
        include: {
          medicine: true,
          pharmacy: true
        }
      });
    }

    if (!batch) {
      res.status(404).json({
        success: false,
        message: `No medicine batch found matching code "${cleanCode}". Please verify code or enter manually.`
      });
      return;
    }

    // Check expiry
    const today = new Date().toISOString().split('T')[0];
    const isExpired = batch.expiryDate < today;

    res.json({
      success: true,
      data: {
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        qrCodeValue: batch.qrCodeValue,
        sku: batch.sku,
        medicineId: batch.medicine.id,
        name: batch.medicine.name,
        genericName: batch.medicine.genericName,
        category: batch.medicine.category,
        dosageForm: batch.medicine.dosageForm,
        requiresPrescription: batch.medicine.requiresPrescription,
        unitPrice: batch.unitPrice,
        availableQuantity: batch.quantity,
        expiryDate: batch.expiryDate,
        isExpired,
        isRecalled: batch.isRecalled,
        pharmacyName: batch.pharmacy.name
      }
    });
  } catch (error) {
    console.error('QR lookup error:', error);
    res.status(500).json({ success: false, message: 'Failed to process QR code lookup.' });
  }
});

// POST /api/pharmacy/sale - Concurrency-Safe QR Medicine Sale & Stock Deduction
router.post('/sale', authenticateToken, requireRole(['PHARMACIST', 'HOSPITAL_STAFF', 'CENTRAL_ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { batchId, quantitySold, paymentMode, customerName, customerPhone, prescriptionVerified } = req.body;

  if (!batchId || !quantitySold || quantitySold <= 0) {
    res.status(400).json({ success: false, message: 'Valid batch ID and positive sale quantity are required.' });
    return;
  }

  const pharmacistId = req.user!.id;
  const qty = parseInt(quantitySold, 10);

  try {
    // Run atomic concurrency-safe transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch batch with lock/fresh state
      const batch = await tx.medicineBatch.findUnique({
        where: { id: batchId },
        include: {
          medicine: true,
          pharmacy: true,
          inventory: true
        }
      });

      if (!batch) {
        throw new Error('Batch not found.');
      }

      if (batch.isRecalled) {
        throw new Error(`Batch ${batch.batchNumber} has been recalled by manufacturer. Dispensing is strictly prohibited.`);
      }

      const today = new Date().toISOString().split('T')[0];
      if (batch.expiryDate < today) {
        throw new Error(`Batch ${batch.batchNumber} expired on ${batch.expiryDate}. Dispensing expired medication is blocked.`);
      }

      if (batch.medicine.requiresPrescription && !prescriptionVerified) {
        throw new Error(`${batch.medicine.name} is a Schedule H/X prescription medicine. Pharmacist prescription verification is required.`);
      }

      if (batch.quantity < qty) {
        throw new Error(`Insufficient stock. Requested: ${qty}, Available in Batch: ${batch.quantity}`);
      }

      const qtyBefore = batch.quantity;
      const qtyAfter = qtyBefore - qty;
      const totalAmount = qty * batch.unitPrice;

      // 2. Deduct from batch
      const updatedBatch = await tx.medicineBatch.update({
        where: { id: batch.id },
        data: { quantity: qtyAfter }
      });

      // 3. Update inventory total quantity
      let isLowStock = false;
      if (batch.inventoryId) {
        const inv = await tx.inventory.findUnique({ where: { id: batch.inventoryId } });
        if (inv) {
          const newTotal = Math.max(0, inv.totalQuantity - qty);
          isLowStock = newTotal <= inv.lowStockThreshold;

          await tx.inventory.update({
            where: { id: inv.id },
            data: {
              totalQuantity: newTotal,
              status: newTotal === 0 ? 'OUT_OF_STOCK' : (isLowStock ? 'LOW_STOCK' : 'IN_STOCK')
            }
          });
        }
      }

      // 4. Create unique sale record
      const saleRef = `SALE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const sale = await tx.sale.create({
        data: {
          saleRef,
          pharmacyId: batch.pharmacyId,
          batchId: batch.id,
          pharmacistId,
          quantitySold: qty,
          unitPrice: batch.unitPrice,
          totalAmount,
          paymentMode: paymentMode || 'UPI',
          customerName: customerName || 'Walk-in Patient',
          customerPhone: customerPhone || ''
        }
      });

      // 5. Record in Inventory Transaction Ledger
      const txRef = `TX-QR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      await tx.inventoryTransaction.create({
        data: {
          transactionRef: txRef,
          pharmacyId: batch.pharmacyId,
          medicineName: batch.medicine.name,
          batchNumber: batch.batchNumber,
          batchId: batch.id,
          quantityBefore: qtyBefore,
          quantityChange: -qty,
          quantityAfter: qtyAfter,
          source: 'QR_SALE',
          staffId: pharmacistId,
          staffName: req.user!.fullName,
          status: 'COMPLETED',
          notes: `QR Sale Ref: ${saleRef} to ${customerName || 'Walk-in Customer'}`
        }
      });

      // 6. Trigger low-stock alert if threshold reached
      if (isLowStock) {
        await tx.notification.create({
          data: {
            userId: pharmacistId,
            targetRole: 'PHARMACIST',
            title: `Low Stock Alert: ${batch.medicine.name}`,
            message: `Available stock for ${batch.medicine.name} has dropped below threshold. Batch ${batch.batchNumber} remaining: ${qtyAfter} units. Suggested reorder: ${batch.medicine.suggestedReorderQty} units.`,
            category: 'pharmacy',
            actionUrl: '/pharmacy/inventory'
          }
        });
      }

      return {
        sale,
        updatedBatch,
        isLowStock,
        medicineName: batch.medicine.name,
        suggestedReorderQty: batch.medicine.suggestedReorderQty
      };
    });

    res.json({
      success: true,
      message: `Sale confirmed successfully. Deducted ${quantitySold} units from batch ${result.updatedBatch.batchNumber}.`,
      data: {
        saleRef: result.sale.saleRef,
        totalAmount: result.sale.totalAmount,
        remainingStock: result.updatedBatch.quantity,
        isLowStock: result.isLowStock,
        suggestedReorderQty: result.suggestedReorderQty
      }
    });
  } catch (error: any) {
    console.error('Sale deduction error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to process sale and stock deduction.' });
  }
});

// GET /api/pharmacy/transactions - Searchable transaction history ledger
router.get('/transactions', async (req, res): Promise<void> => {
  const { searchTerm, source } = req.query;

  try {
    const transactions = await prisma.inventoryTransaction.findMany({
      where: {
        ...(source && typeof source === 'string' && source !== 'All' ? { source } : {}),
        ...(searchTerm && typeof searchTerm === 'string' ? {
          OR: [
            { medicineName: { contains: searchTerm } },
            { batchNumber: { contains: searchTerm } },
            { transactionRef: { contains: searchTerm } }
          ]
        } : {})
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve transaction records.' });
  }
});

// POST /api/pharmacy/purchase-orders - Create purchase reorder request for medical supplier
router.post('/purchase-orders', authenticateToken, requireRole(['PHARMACIST', 'CENTRAL_ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { medicineId, quantity, supplierId, notes } = req.body;

  if (!medicineId || !quantity || quantity <= 0) {
    res.status(400).json({ success: false, message: 'Medicine and valid reorder quantity are required.' });
    return;
  }

  try {
    const medicine = await prisma.medicine.findUnique({ where: { id: medicineId } });
    if (!medicine) {
      res.status(404).json({ success: false, message: 'Medicine not found.' });
      return;
    }

    const defaultSupplier = supplierId 
      ? await prisma.supplier.findUnique({ where: { id: supplierId } })
      : await prisma.supplier.findFirst();

    if (!defaultSupplier) {
      res.status(400).json({ success: false, message: 'No registered medical supplier found.' });
      return;
    }

    const pharmacy = await prisma.pharmacy.findFirst();
    if (!pharmacy) {
      res.status(400).json({ success: false, message: 'No registered pharmacy found.' });
      return;
    }

    const poNumber = `PO-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const totalAmount = quantity * (medicine.unitPrice * 0.78); // Wholesale discount

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        pharmacyId: pharmacy.id,
        supplierId: defaultSupplier.id,
        medicineId: medicine.id,
        quantity: parseInt(quantity, 10),
        unitPrice: medicine.unitPrice * 0.78,
        totalAmount,
        status: 'PENDING_APPROVAL',
        estimatedDelivery: '2-3 Business Days',
        approvedBy: req.user!.fullName,
        notes: notes || 'Automated replenishment order triggered by low-stock threshold'
      },
      include: {
        medicine: true,
        supplier: true
      }
    });

    res.status(201).json({
      success: true,
      message: `Purchase order ${poNumber} created and routed to ${defaultSupplier.name}.`,
      order: po
    });
  } catch (error) {
    console.error('PO creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create purchase order.' });
  }
});

// PUT /api/pharmacy/purchase-orders/:id/receive - Simulated Goods-Received Confirmation & Stock Restocking
router.put('/purchase-orders/:id/receive', authenticateToken, requireRole(['PHARMACIST', 'CENTRAL_ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { medicine: true, pharmacy: true }
    });

    if (!po) {
      res.status(404).json({ success: false, message: 'Purchase order not found.' });
      return;
    }

    if (po.status === 'RECEIVED') {
      res.status(400).json({ success: false, message: 'Goods have already been received and stock updated.' });
      return;
    }

    // Atomic restock transaction
    const receivedBatchNum = `REC-B${Date.now().toString().slice(-4)}`;
    const qrCode = `BHC-QR-${po.medicine.name.slice(0, 3).toUpperCase()}-${receivedBatchNum}`;

    await prisma.$transaction(async (tx) => {
      // 1. Mark PO received
      await tx.purchaseOrder.update({
        where: { id: po.id },
        data: {
          status: 'RECEIVED',
          receivedAt: new Date(),
          receivedBatchNumber: receivedBatchNum,
          receivedExpiryDate: '2028-06-30'
        }
      });

      // 2. Create new batch
      const newBatch = await tx.medicineBatch.create({
        data: {
          pharmacyId: po.pharmacyId,
          medicineId: po.medicineId,
          batchNumber: receivedBatchNum,
          qrCodeValue: qrCode,
          sku: `SKU-${receivedBatchNum}`,
          quantity: po.quantity,
          unitPrice: po.medicine.unitPrice,
          expiryDate: '2028-06-30',
          supplierId: po.supplierId
        }
      });

      // 3. Update inventory total quantity
      const inv = await tx.inventory.findFirst({
        where: { pharmacyId: po.pharmacyId, medicineId: po.medicineId }
      });

      if (inv) {
        await tx.inventory.update({
          where: { id: inv.id },
          data: {
            totalQuantity: inv.totalQuantity + po.quantity,
            status: 'IN_STOCK'
          }
        });
      }

      // 4. Record in Transaction Ledger
      await tx.inventoryTransaction.create({
        data: {
          transactionRef: `TX-REC-${Date.now()}`,
          pharmacyId: po.pharmacyId,
          medicineName: po.medicine.name,
          batchNumber: receivedBatchNum,
          batchId: newBatch.id,
          quantityBefore: inv ? inv.totalQuantity : 0,
          quantityChange: po.quantity,
          quantityAfter: (inv ? inv.totalQuantity : 0) + po.quantity,
          source: 'SUPPLIER_RECEIPT',
          staffId: req.user!.id,
          staffName: req.user!.fullName,
          status: 'COMPLETED',
          notes: `Goods received for PO ${po.poNumber}`
        }
      });
    });

    res.json({
      success: true,
      message: `Stock successfully updated with ${po.quantity} units under batch ${receivedBatchNum}. Generated QR: ${qrCode}`
    });
  } catch (error) {
    console.error('Goods receipt error:', error);
    res.status(500).json({ success: false, message: 'Failed to process goods received.' });
  }
});

export default router;
