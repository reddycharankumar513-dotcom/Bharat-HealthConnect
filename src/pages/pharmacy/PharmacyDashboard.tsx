import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/common/StatCard';
import { PurchaseOrderModal } from './PurchaseOrderModal';
import { Medicine } from '../../types';
import { 
  Pill, 
  AlertTriangle, 
  ShoppingCart, 
  Truck, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  TrendingUp, 
  Package, 
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const PharmacyDashboard: React.FC = () => {
  const { medicines, purchaseOrders, receiveGoods, showToast } = useApp();

  const [reorderMedicine, setReorderMedicine] = useState<Medicine | null>(null);

  const totalMedicines = medicines.length;
  const lowStockMeds = medicines.filter(m => m.status === 'Low Stock' || m.quantity <= m.minThreshold);
  const expiringMeds = medicines.filter(m => m.expiryDate.startsWith('2026')); // relative to 2026
  const pendingOrders = purchaseOrders.filter(po => po.status === 'Pending Approval');
  const dispatchedOrders = purchaseOrders.filter(po => po.status === 'Dispatched');

  const categoryData = [
    { name: 'Antibiotics', value: 35, color: '#0d9488' },
    { name: 'Anti-Diabetic', value: 28, color: '#0284c7' },
    { name: 'Cardiovascular', value: 24, color: '#6366f1' },
    { name: 'Respiratory', value: 13, color: '#10b981' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-elevated flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Smart Pharmacy & Procurement Console
            </span>
            <span className="text-xs text-emerald-200">License: FDA-TS-RTL-8812</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Central Hospital Pharmacy</h1>
          <p className="text-xs text-slate-300">
            Automated threshold triggers, registered pharmaceutical distributors, and batch cold-chain tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/pharmacy/inventory"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <Pill className="w-4 h-4" />
            <span>Manage Inventory ({totalMedicines})</span>
          </Link>
        </div>
      </div>

      {/* SMART INVENTORY ALERT: When stock falls below threshold */}
      {lowStockMeds.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <h3 className="font-bold text-sm text-rose-950 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Critical Low-Stock Automated Alerts ({lowStockMeds.length} items below minimum safety buffer)
              </h3>
            </div>
            <Link to="/pharmacy/inventory" className="text-xs font-bold text-rose-700 hover:underline">
              View All in Inventory →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {lowStockMeds.map(med => (
              <div
                key={med.id}
                className="p-3.5 bg-white rounded-2xl border border-rose-200 shadow-2xs flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                      {med.sku}
                    </span>
                    <span className="text-xs font-bold text-rose-600">
                      {med.quantity} / {med.minThreshold} left
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 mt-1 line-clamp-1">{med.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Lead time: 2 days • Suggested reorder: <strong>{med.suggestedReorderQty} units</strong>
                  </p>
                </div>

                <button
                  onClick={() => setReorderMedicine(med)}
                  className="w-full py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center justify-center gap-1"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Review & Approve Reorder</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Formulations"
          value={totalMedicines}
          subtitle="Active SKUs in Catalog"
          icon={<Pill className="w-5 h-5 text-teal-600" />}
          iconBgColor="bg-teal-50"
        />
        <StatCard
          title="Low Stock Flags"
          value={lowStockMeds.length}
          subtitle="Threshold breach alert"
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          iconBgColor="bg-rose-50"
          badge="Urgent Reorder"
        />
        <StatCard
          title="Expiring Within 90 Days"
          value={expiringMeds.length}
          subtitle="Batch rotation required"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-50"
        />
        <StatCard
          title="Active Purchase Orders"
          value={purchaseOrders.filter(p => p.status !== 'Delivered' && p.status !== 'Cancelled').length}
          subtitle="Supplier fulfillment pipeline"
          icon={<ShoppingCart className="w-5 h-5 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
        />
      </div>

      {/* Goods Received Simulation Box: Dispatched Orders ready to replenish stock */}
      {dispatchedOrders.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              Incoming Shipments (Dispatched from Suppliers)
            </h3>
            <span className="text-xs text-emerald-700 font-semibold">Simulate Goods Receipt to Restock</span>
          </div>

          <div className="space-y-2">
            {dispatchedOrders.map(po => (
              <div
                key={po.id}
                className="p-3.5 bg-white rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-emerald-800">{po.poNumber}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                      Dispatched
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mt-0.5">{po.medicineName}</h4>
                  <p className="text-xs text-slate-500">
                    Supplier: <strong>{po.supplierName}</strong> • {po.quantity} Units (₹{po.totalAmount})
                  </p>
                </div>

                <button
                  onClick={() => receiveGoods(po.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Goods Received (+{po.quantity} Units)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inventory Category Breakdown */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-teal-600" />
            Inventory Volume by Therapeutic Category
          </h3>
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={110} />
                <Tooltip />
                <Bar dataKey="value" fill="#0d9488" radius={[0, 6, 6, 0]} name="Stock Units %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent PO pipeline list */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-teal-600" />
              Recent Procurement Pipeline
            </h3>
            <Link to="/pharmacy/orders" className="text-xs font-semibold text-teal-600 hover:underline">
              All Orders ({purchaseOrders.length})
            </Link>
          </div>

          <div className="space-y-3">
            {purchaseOrders.slice(0, 3).map(po => (
              <div key={po.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono text-[10px] text-slate-400 block">{po.poNumber}</span>
                  <h4 className="font-bold text-slate-900">{po.medicineName}</h4>
                  <span className="text-slate-500 text-[11px]">{po.supplierName} • {po.quantity} Units</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">₹{po.totalAmount}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-slate-200 inline-block mt-0.5">
                    {po.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PurchaseOrderModal
        isOpen={!!reorderMedicine}
        onClose={() => setReorderMedicine(null)}
        medicine={reorderMedicine}
      />
    </div>
  );
};
