import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PurchaseOrder, PurchaseOrderStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  ShoppingCart, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Calendar, 
  DollarSign, 
  AlertCircle,
  FileText
} from 'lucide-react';

export const PharmacyOrdersPage: React.FC = () => {
  const { purchaseOrders, updatePOStatus, receiveGoods, showToast } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('All');

  const filteredOrders = purchaseOrders.filter(po => {
    if (filterStatus === 'All') return true;
    return po.status === filterStatus;
  });

  const statuses: (PurchaseOrderStatus | 'All')[] = [
    'All',
    'Pending Approval',
    'Approved',
    'Ordered',
    'Dispatched',
    'Delivered',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-teal-600" />
          Procurement Purchase Orders & Supply Chain Tracker
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review automated PO approvals, dispatch logistics from registered suppliers, and confirm goods receipts to restock inventory
        </p>
      </div>

      {/* Disclaimed notice */}
      <div className="p-3 bg-slate-100 border border-slate-200 rounded-2xl text-xs text-slate-600 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span>
          <strong>Simulated Supply Chain:</strong> All purchase orders, vendor invoices, and delivery dispatches are conducted in demo mode. Inventory is automatically updated only upon confirming goods received.
        </span>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {statuses.map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === st
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders List / Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">PO Number & Date</th>
                <th className="p-4">Formulation / Medicine</th>
                <th className="p-4">Supplier Partner</th>
                <th className="p-4 text-center">Quantity</th>
                <th className="p-4">Total Value</th>
                <th className="p-4">Est. Delivery</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Workflow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-slate-400">
                    No purchase orders found matching "{filterStatus}"
                  </td>
                </tr>
              ) : (
                filteredOrders.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <strong className="block font-mono font-bold text-slate-900">{po.poNumber}</strong>
                      <span className="text-[10px] text-slate-400">{po.createdAt}</span>
                    </td>

                    <td className="p-4">
                      <strong className="block text-slate-900 font-bold">{po.medicineName}</strong>
                      {po.notes && <span className="text-[11px] text-slate-500 line-clamp-1">{po.notes}</span>}
                    </td>

                    <td className="p-4 text-slate-700 font-medium">
                      {po.supplierName}
                    </td>

                    <td className="p-4 text-center">
                      <span className="font-bold text-slate-900 text-sm">{po.quantity}</span>
                      <span className="block text-[10px] text-slate-400">units</span>
                    </td>

                    <td className="p-4 font-bold text-slate-900">
                      ₹{po.totalAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4 text-slate-600">
                      {po.estimatedDelivery}
                    </td>

                    <td className="p-4">
                      <StatusBadge status={po.status} />
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      {/* Stepwise lifecycle actions */}
                      {po.status === 'Pending Approval' && (
                        <button
                          onClick={() => updatePOStatus(po.id, 'Approved')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
                        >
                          Approve PO
                        </button>
                      )}

                      {po.status === 'Approved' && (
                        <button
                          onClick={() => updatePOStatus(po.id, 'Dispatched')}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Simulate Dispatch</span>
                        </button>
                      )}

                      {po.status === 'Dispatched' && (
                        <button
                          onClick={() => receiveGoods(po.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-1 ml-auto"
                          title="Confirm Goods Received & Restock"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm Goods Received</span>
                        </button>
                      )}

                      {po.status === 'Delivered' && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          Restocked on {po.receivedAt?.split(',')[0] || 'Today'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
