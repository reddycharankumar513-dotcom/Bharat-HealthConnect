import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Medicine } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PurchaseOrderModal } from './PurchaseOrderModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { 
  Pill, 
  Search, 
  Filter, 
  ShoppingCart, 
  ArrowUpDown, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Building2,
  SlidersHorizontal
} from 'lucide-react';

export const PharmacyInventoryPage: React.FC = () => {
  const { medicines, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const [reorderMedicine, setReorderMedicine] = useState<Medicine | null>(null);
  const [adjustMedicine, setAdjustMedicine] = useState<Medicine | null>(null);

  const categories = ['All', 'Antibiotic', 'Anti-Diabetic', 'Cardiovascular', 'Gastrointestinal', 'Respiratory & Anti-Allergic'];
  const statuses = ['All', 'In Stock', 'Low Stock', 'Expiring Soon'];

  const filteredMedicines = medicines.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          med.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          med.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          med.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || med.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || med.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Pill className="w-6 h-6 text-teal-600" />
            Pharmacy Inventory & Automated Threshold Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time formulary stock levels, batch expiry tracking, and direct supplier procurement
          </p>
        </div>

        <button
          onClick={() => showToast('Demo: Open Formulary Addition Form', 'info')}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Formulation</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by brand name, generic salt, SKU, batch..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:ring-2 focus:ring-teal-500"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:ring-2 focus:ring-teal-500"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Stock Statuses' : s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Found <strong>{filteredMedicines.length}</strong> formulation records</span>
          {(searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedStatus('All');
              }}
              className="text-teal-600 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Inventory Table with All Required Fields */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Medicine Name & Generic</th>
                <th className="p-3.5">SKU & Batch</th>
                <th className="p-3.5 text-center">Available Stock</th>
                <th className="p-3.5 text-center">Threshold</th>
                <th className="p-3.5 text-center">Suggested Reorder</th>
                <th className="p-3.5">Expiry Date</th>
                <th className="p-3.5">Registered Supplier</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.map(med => {
                const isBreached = med.quantity <= med.minThreshold;

                return (
                  <tr
                    key={med.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isBreached ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    {/* Medicine name & Generic */}
                    <td className="p-3.5">
                      <strong className="block text-slate-900 font-bold text-xs sm:text-sm">
                        {med.name}
                      </strong>
                      <span className="text-[11px] text-slate-500 italic line-clamp-1">
                        {med.genericName}
                      </span>
                    </td>

                    {/* SKU & Batch */}
                    <td className="p-3.5">
                      <span className="font-mono text-slate-700 block font-semibold">{med.sku}</span>
                      <span className="font-mono text-[10px] text-slate-400">Batch: {med.batchNumber}</span>
                    </td>

                    {/* Current Quantity */}
                    <td className="p-3.5 text-center">
                      <span className={`inline-block font-extrabold text-sm ${
                        isBreached ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200' : 'text-slate-900'
                      }`}>
                        {med.quantity}
                      </span>
                      <span className="block text-[10px] text-slate-400">units</span>
                    </td>

                    {/* Minimum Threshold */}
                    <td className="p-3.5 text-center font-semibold text-slate-700">
                      {med.minThreshold}
                    </td>

                    {/* Suggested Reorder Qty */}
                    <td className="p-3.5 text-center font-bold text-teal-700">
                      {med.suggestedReorderQty}
                    </td>

                    {/* Expiry Date */}
                    <td className="p-3.5">
                      <span className={`font-medium ${
                        med.expiryDate.startsWith('2026') ? 'text-amber-700 font-bold' : 'text-slate-700'
                      }`}>
                        {med.expiryDate}
                      </span>
                    </td>

                    {/* Supplier */}
                    <td className="p-3.5 text-slate-700 font-medium max-w-[140px] truncate">
                      {med.supplierName}
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <StatusBadge status={med.status} />
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setReorderMedicine(med)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors ${
                            isBreached
                              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs font-bold'
                              : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
                          }`}
                          title="Generate Purchase Order"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Reorder</span>
                        </button>

                        <button
                          onClick={() => setAdjustMedicine(med)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                          title="Adjust Physical Count"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <PurchaseOrderModal
        isOpen={!!reorderMedicine}
        onClose={() => setReorderMedicine(null)}
        medicine={reorderMedicine}
      />

      <StockAdjustmentModal
        isOpen={!!adjustMedicine}
        onClose={() => setAdjustMedicine(null)}
        medicine={adjustMedicine}
      />
    </div>
  );
};
