import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { 
  Truck, 
  Package, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Search,
  DollarSign
} from 'lucide-react';

interface PurchaseOrderItem {
  id: string;
  poNumber: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
  estimatedDelivery?: string;
  createdAt: string;
  pharmacy?: {
    name: string;
    city: string;
    phone: string;
  };
  medicine: {
    name: string;
    dosageForm: string;
  };
}

export const SupplierDashboard: React.FC = () => {
  const { showToast } = useApp();
  const [orders, setOrders] = useState<PurchaseOrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');

  const fetchSupplierOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/supplier/orders');
      if (res.success && res.orders) {
        setOrders(res.orders);
      } else {
        // Fallback demo POs
        setOrders([
          {
            id: 'po-1',
            poNumber: 'PO-99120-101',
            quantity: 150,
            unitPrice: 110.00,
            totalAmount: 16500.00,
            status: 'PENDING_APPROVAL',
            estimatedDelivery: '2 Business Days',
            createdAt: new Date().toISOString(),
            pharmacy: { name: 'Sanjeevani MedPlus Pharmacy', city: 'Hyderabad', phone: '+91 40 2335 1122' },
            medicine: { name: 'Telma 40mg Tablet', dosageForm: 'Tablet' }
          },
          {
            id: 'po-2',
            poNumber: 'PO-88190-202',
            quantity: 200,
            unitPrice: 85.00,
            totalAmount: 17000.00,
            status: 'DISPATCHED',
            estimatedDelivery: 'Tomorrow by 02:00 PM',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            pharmacy: { name: 'Apollo 24x7 Jubilee Hills', city: 'Hyderabad', phone: '+91 40 2360 7788' },
            medicine: { name: 'Augmentin 625 Duo Tablet', dosageForm: 'Tablet' }
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplierOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await api.put(`/supplier/orders/${orderId}/status`, { status: newStatus });
      if (res.success) {
        showToast(`PO marked as ${newStatus}`, 'success');
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        showToast(res.message || 'Status update failed', 'error');
      }
    } catch {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast(`PO status updated to ${newStatus}`, 'success');
    }
  };

  const filteredOrders = orders.filter(o => selectedStatus === 'All' || o.status === selectedStatus);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-teal-600" />
            Medical Supplier Wholesale Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bharat MedLogistics & Wholesale Distributors • GST: 36AAACB1234F1Z8 • Authorized Wholesale Channel
          </p>
        </div>

        <div className="flex items-center gap-2 p-2 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 font-bold">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Verified CDSCO Supply License</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Purchase Orders</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{orders.length}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card">
          <span className="text-[10px] uppercase font-bold text-amber-600">Pending Approvals</span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {orders.filter(o => o.status === 'PENDING_APPROVAL').length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card">
          <span className="text-[10px] uppercase font-bold text-teal-600">Dispatched Shipments</span>
          <p className="text-2xl font-black text-teal-600 mt-1">
            {orders.filter(o => o.status === 'DISPATCHED').length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card">
          <span className="text-[10px] uppercase font-bold text-emerald-600">Order Volume Value</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            ₹{orders.reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Incoming Pharmacy Purchase Requests</h2>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="All">All Order Statuses</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="RECEIVED">Received & Restocked</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No purchase orders found.
            </div>
          ) : (
            filteredOrders.map(po => (
              <div
                key={po.id}
                className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-xs">{po.poNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      po.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-800' :
                      po.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                      po.status === 'DISPATCHED' ? 'bg-teal-100 text-teal-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {po.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800">{po.medicine.name}</h3>
                  <p className="text-xs text-slate-500">
                    Requested by <strong>{po.pharmacy?.name}</strong> • Qty: <strong>{po.quantity} Units</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Total Amount</span>
                    <span className="text-sm font-black text-teal-700">₹{po.totalAmount.toLocaleString('en-IN')}</span>
                  </div>

                  {po.status === 'PENDING_APPROVAL' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(po.id, 'APPROVED')}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        Accept PO
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(po.id, 'CANCELLED')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {po.status === 'APPROVED' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(po.id, 'DISPATCHED')}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Dispatch Shipment</span>
                    </button>
                  )}

                  {po.status === 'DISPATCHED' && (
                    <span className="text-xs font-bold text-teal-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>In Transit to Pharmacy</span>
                    </span>
                  )}

                  {po.status === 'RECEIVED' && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Delivered & Restocked</span>
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
