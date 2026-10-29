import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/marketplace/medicines - Search medicines and compare registered pharmacy prices/stock
router.get('/medicines', async (req, res): Promise<void> => {
  const { search, category, pharmacyId } = req.query;

  try {
    const medicines = await prisma.medicine.findMany({
      where: {
        ...(category && typeof category === 'string' && category !== 'All' ? { category } : {}),
        ...(search && typeof search === 'string' ? {
          OR: [
            { name: { contains: search } },
            { genericName: { contains: search } },
            { brandName: { contains: search } },
            { category: { contains: search } }
          ]
        } : {})
      },
      include: {
        inventories: {
          include: { pharmacy: true }
        },
        batches: {
          where: { isRecalled: false },
          select: { id: true, batchNumber: true, quantity: true, expiryDate: true, unitPrice: true }
        }
      }
    });

    res.json({ success: true, medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to search marketplace.' });
  }
});

// POST /api/marketplace/orders - Concurrency-Safe Online Order with Stock Reservation
router.post('/orders', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { pharmacyId, items, deliveryType, deliveryAddress, prescriptionUrl } = req.body;

  if (!pharmacyId || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, message: 'Pharmacy ID and at least one order item are required.' });
    return;
  }

  try {
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!patientProfile) {
      res.status(400).json({ success: false, message: 'Only registered patients can place medicine orders.' });
      return;
    }

    // Atomic stock reservation transaction
    const orderResult = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData: any[] = [];

      for (const item of items) {
        const { medicineId, quantity } = item;
        const qty = parseInt(quantity, 10);

        // Fetch inventory for pharmacy & medicine
        const inventory = await tx.inventory.findUnique({
          where: {
            pharmacyId_medicineId: { pharmacyId, medicineId }
          },
          include: { medicine: true }
        });

        if (!inventory) {
          throw new Error(`Medicine is not in stock at selected pharmacy.`);
        }

        const available = inventory.totalQuantity - inventory.reservedQuantity;
        if (available < qty) {
          throw new Error(`Insufficient stock for ${inventory.medicine.name}. Available: ${available}, Requested: ${qty}`);
        }

        if (inventory.medicine.requiresPrescription && !prescriptionUrl) {
          throw new Error(`Prescription upload is mandatory for ${inventory.medicine.name}.`);
        }

        // Concurrency-safe reservation: increment reservedQuantity
        await tx.inventory.update({
          where: { id: inventory.id },
          data: {
            reservedQuantity: inventory.reservedQuantity + qty
          }
        });

        const itemTotal = qty * inventory.medicine.unitPrice;
        totalAmount += itemTotal;

        orderItemsData.push({
          medicineId,
          quantity: qty,
          unitPrice: inventory.medicine.unitPrice,
          totalPrice: itemTotal
        });
      }

      const orderNumber = `ORD-BHC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      const order = await tx.medicineOrder.create({
        data: {
          orderNumber,
          patientId: patientProfile.id,
          pharmacyId,
          totalAmount,
          status: 'PENDING',
          deliveryType: deliveryType || 'DELIVERY',
          deliveryAddress: deliveryAddress || patientProfile.address || 'Standard Delivery Address',
          prescriptionUrl: prescriptionUrl || null,
          items: {
            create: orderItemsData
          }
        },
        include: {
          items: { include: { medicine: true } },
          pharmacy: true
        }
      });

      // Notify Pharmacy
      const pharmacist = await tx.pharmacistProfile.findFirst({
        where: { pharmacyId },
        include: { user: true }
      });

      if (pharmacist) {
        await tx.notification.create({
          data: {
            userId: pharmacist.user.id,
            title: `New Online Medicine Order: ${orderNumber}`,
            message: `Order received for INR ₹${totalAmount.toFixed(2)}. ${items.length} items reserved awaiting pharmacy review.`,
            category: 'pharmacy',
            actionUrl: '/pharmacy/orders'
          }
        });
      }

      return order;
    });

    res.status(201).json({
      success: true,
      message: `Order placed successfully! Stock reserved. Order Number: ${orderResult.orderNumber}`,
      order: orderResult
    });
  } catch (error: any) {
    console.error('Order reservation error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to reserve stock and place order.' });
  }
});

// GET /api/marketplace/orders - List patient orders or pharmacy orders
router.get('/orders', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role === 'PATIENT') {
      const patientProfile = await prisma.patientProfile.findUnique({
        where: { userId: req.user!.id }
      });

      if (!patientProfile) {
        res.status(404).json({ success: false, message: 'Patient profile not found.' });
        return;
      }

      const orders = await prisma.medicineOrder.findMany({
        where: { patientId: patientProfile.id },
        include: {
          items: { include: { medicine: true } },
          pharmacy: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ success: true, orders });
      return;
    }

    // For Pharmacist / Admin
    const orders = await prisma.medicineOrder.findMany({
      include: {
        items: { include: { medicine: true } },
        patient: { include: { user: true } },
        pharmacy: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
});

// PUT /api/marketplace/orders/:id/status - Status transitions with Stock Reservation Release or Permanent Deduction
router.put('/orders/:id/status', authenticateToken, requireRole(['PHARMACIST', 'CENTRAL_ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, pharmacistNotes } = req.body;

  try {
    const order = await prisma.medicineOrder.findUnique({
      where: { id },
      include: {
        items: true,
        patient: { include: { user: true } }
      }
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      // 1. If REJECTED or CANCELLED: Release reserved stock
      if (status === 'REJECTED' || status === 'CANCELLED') {
        for (const item of order.items) {
          const inv = await tx.inventory.findFirst({
            where: { pharmacyId: order.pharmacyId, medicineId: item.medicineId }
          });

          if (inv) {
            await tx.inventory.update({
              where: { id: inv.id },
              data: {
                reservedQuantity: Math.max(0, inv.reservedQuantity - item.quantity)
              }
            });
          }
        }
      }

      // 2. If DISPATCHED or DELIVERED: Permanently deduct reserved stock and total stock
      if ((status === 'DISPATCHED' || status === 'DELIVERED') && order.status !== 'DISPATCHED' && order.status !== 'DELIVERED') {
        for (const item of order.items) {
          const inv = await tx.inventory.findFirst({
            where: { pharmacyId: order.pharmacyId, medicineId: item.medicineId }
          });

          if (inv) {
            const newTotal = Math.max(0, inv.totalQuantity - item.quantity);
            const newReserved = Math.max(0, inv.reservedQuantity - item.quantity);

            await tx.inventory.update({
              where: { id: inv.id },
              data: {
                totalQuantity: newTotal,
                reservedQuantity: newReserved,
                status: newTotal === 0 ? 'OUT_OF_STOCK' : (newTotal <= inv.lowStockThreshold ? 'LOW_STOCK' : 'IN_STOCK')
              }
            });
          }
        }
      }

      // 3. Update Order status
      await tx.medicineOrder.update({
        where: { id: order.id },
        data: {
          status,
          ...(pharmacistNotes ? { pharmacistNotes } : {})
        }
      });

      // 4. Notify Patient
      await tx.notification.create({
        data: {
          userId: order.patient.user.id,
          title: `Medicine Order Update: ${order.orderNumber}`,
          message: `Your order status is now: ${status.replace(/_/g, ' ')}. ${pharmacistNotes ? `Note: ${pharmacistNotes}` : ''}`,
          category: 'pharmacy',
          actionUrl: '/patient'
        }
      });
    });

    res.json({
      success: true,
      message: `Order ${order.orderNumber} updated to ${status}.`
    });
  } catch (error: any) {
    console.error('Order status update error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update order status.' });
  }
});

export default router;
