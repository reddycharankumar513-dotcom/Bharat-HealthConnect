import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  Building2, 
  FileText, 
  XCircle, 
  AlertCircle,
  ShoppingBag
} from 'lucide-react';

interface OrderItem {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  deliveryType: string;
  deliveryAddress?: string;
  createdAt: string;
  pharmacy?: {
    name: string;
    phone: string;
    city: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    medicine: {
      name: string;
      dosageForm: string;
    };
  }>;
}

export const MedicineOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/marketplace/orders');
      if (res.success && res.orders) {
        setOrders(res.orders);
      } else {
        // Fallback demo orders
        setOrders([
          {
            id: 'ord-1',
            orderNumber: 'ORD-BHC-88129',
            totalAmount: 409.00,
            status: 'CONFIRMED',
            deliveryType: 'DELIVERY',
            deliveryAddress: 'Plot 42, Jubilee Hills Road No. 36, Hyderabad',
            createdAt: new Date().toISOString(),
            pharmacy: { name: 'Sanjeevani MedPlus Pharmacy', phone: '+91 40 2335 1122', city: 'Hyderabad' },
            items: [
              {
                id: 'item-1',
                quantity: 2,
                unitPrice: 204.50,
                medicine: { name: 'Augmentin 625 Duo Tablet', dosageForm: 'Tablet' }
              }
            ]
          },
          {
            id: 'ord-2',
            orderNumber: 'ORD-BHC-77410',
            totalAmount: 142.00,
            status: 'DELIVERED',
            deliveryType: 'DELIVERY',
            deliveryAddress: 'Plot 42, Jubilee Hills Road No. 36, Hyderabad',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            pharmacy: { name: 'Sanjeevani MedPlus Pharmacy', phone: '+91 40 2335 1122', city: 'Hyderabad' },
            items: [
              {
                id: 'item-2',
                quantity: 1,
                unitPrice: 142.00,
                medicine: { name: 'Telma 40mg Tablet', dosageForm: 'Tablet' }
              }
            ]
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-lg uppercase">Pending Review</span>;
      case 'PHARMACY_REVIEW':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-lg uppercase">Under Verification</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 bg-teal-100 text-teal-800 text-[10px] font-bold rounded-lg uppercase">Stock Reserved & Confirmed</span>;
      case 'PREPARING':
        return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-lg uppercase">Packing Medication</span>;
      case 'READY_FOR_PICKUP':
      case 'DISPATCHED':
        return <span className="px-2.5 py-1 bg-cyan-100 text-cyan-800 text-[10px] font-bold rounded-lg uppercase">Out for Delivery</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg uppercase">Delivered</span>;
      case 'REJECTED':
      case 'CANCELLED':
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-lg uppercase">Cancelled & Released</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-[10px] font-bold rounded-lg uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Package className="w-6 h-6 text-teal-600" />
          My Medicine Orders & Live Tracking
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time pharmacy stock reservation, prescription status, and delivery fulfillment updates
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No Orders Placed Yet</h3>
            <p className="text-xs text-slate-400">Order prescribed medications from our verified pharmacy marketplace</p>
          </div>
        ) : (
          orders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card hover:shadow-lg transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">ORDER ID</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{order.orderNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{item.medicine.name}</span>
                      <span className="text-slate-400 text-[11px] ml-2">({item.medicine.dosageForm})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500">{item.quantity} x ₹{item.unitPrice.toFixed(2)}</span>
                      <span className="font-bold text-slate-900 ml-3">₹{(item.quantity * item.unitPrice).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pharmacy & Delivery Info */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">DISPENSING PHARMACY</span>
                  <span className="font-bold text-slate-800">{order.pharmacy?.name || 'Sanjeevani MedPlus'}</span>
                  <span className="text-slate-500 text-[11px] block">{order.pharmacy?.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">DELIVERY ADDRESS</span>
                  <span className="text-slate-700 font-medium truncate block">{order.deliveryAddress || 'Self Pickup at Pharmacy'}</span>
                  <span className="text-teal-700 font-bold text-[11px]">{order.deliveryType}</span>
                </div>
              </div>

              {/* Total Summary */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">Total Billed (Inc. Taxes & Delivery)</span>
                <span className="text-base font-black text-teal-700">₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
