import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/supplier/orders - List purchase orders assigned to suppliers
router.get('/orders', authenticateToken, requireRole(['SUPPLIER', 'CENTRAL_ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: {
        medicine: true,
        pharmacy: true,
        supplier: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve supplier purchase orders.' });
  }
});

// PUT /api/supplier/orders/:id/status - Update supplier dispatch status
router.put('/orders/:id/status', authenticateToken, requireRole(['SUPPLIER', 'CENTRAL_ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, notes } = req.body; // 'APPROVED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED'

  try {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { pharmacy: true, medicine: true }
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status,
        ...(notes ? { notes } : {})
      }
    });

    res.json({
      success: true,
      message: `Purchase Order ${order.poNumber} status updated to ${status}.`,
      order: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

export default router;
