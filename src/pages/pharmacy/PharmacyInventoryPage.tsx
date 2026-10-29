import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Medicine } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PurchaseOrderModal } from './PurchaseOrderModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { QRScannerModal } from '../../components/pharmacy/QRScannerModal';
import { QRCodeModal } from '../../components/pharmacy/QRCodeModal';
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
  SlidersHorizontal,
  QrCode,
  History,
  Camera
} from 'lucide-react';

export const PharmacyInventoryPage: React.FC = () => {
  const { medicines, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const [reorderMedicine, setReorderMedicine] = useState<Medicine | null>(null);
  const [adjustMedicine, setAdjustMedicine] = useState<Medicine | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [qrCodeMedicine, setQrCodeMedicine] = useState<Medicine | null>(null);

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
      {/* Header with QR Scanner Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Pill className="w-6 h-6 text-teal-600" />
            Pharmacy Inventory & Automated Threshold Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time formulary stock levels, batch expiry tracking, and QR barcode sales deduction
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* CRITICAL FEATURE: QR Scanner Action */}
          <button
            type="button"
            onClick={() => setIsQRScannerOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-medblue-700 hover:from-teal-700 hover:to-medblue-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Camera className="w-4 h-4 text-teal-200" />
            <span>Scan Medicine QR Code</span>
          </button>

          <Link
            to="/pharmacy/transactions"
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Stock Ledger</span>
          </Link>

          <button
            onClick={() => showToast('Demo: Formulary registration window', 'info')}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Drug</span>
          </button>
        </div>
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
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Medicine & Formulation</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">SKU & Batch</th>
                <th className="p-3.5 text-center">Available Stock</th>
                <th className="p-3.5 text-center">Min Threshold</th>
                <th className="p-3.5 text-center">Suggested Reorder</th>
                <th className="p-3.5">Expiry Date</th>
                <th className="p-3.5">Supplier</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.map(med => {
                const isBreached = med.quantity <= med.minThreshold;

                return (
                  <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Medicine Name & Details */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{med.name}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{med.genericName}</div>
                      <span className="text-[10px] text-teal-700 font-medium">₹{med.unitPrice.toFixed(2)}/unit</span>
                    </td>

                    {/* Category */}
                    <td className="p-3.5 text-slate-700">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium">
                        {med.category}
                      </span>
                    </td>

                    {/* SKU & Batch */}
                    <td className="p-3.5 font-mono text-[11px] text-slate-600">
                      <div>{med.sku}</div>
                      <div className="text-slate-400">Batch: {med.batchNumber}</div>
                    </td>

                    {/* Available Stock */}
                    <td className="p-3.5 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full font-bold font-mono text-xs ${
                        isBreached ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {med.quantity}
                      </span>
                    </td>

                    {/* Threshold */}
                    <td className="p-3.5 text-center font-mono text-slate-500">
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
                        {/* Print / View QR Label */}
                        <button
                          type="button"
                          onClick={() => setQrCodeMedicine(med)}
                          className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl transition-colors"
                          title="Generate & Print Standard Batch QR Label"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

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

      {/* QR Scanner Modal for Live Scanning & Confirmed Stock Deduction */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
      />

      {/* QR Label Print Modal */}
      <QRCodeModal
        isOpen={!!qrCodeMedicine}
        onClose={() => setQrCodeMedicine(null)}
        medicine={qrCodeMedicine}
      />

      {/* Purchase Order Reorder Modal */}
      <PurchaseOrderModal
        isOpen={!!reorderMedicine}
        onClose={() => setReorderMedicine(null)}
        medicine={reorderMedicine}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={!!adjustMedicine}
        onClose={() => setAdjustMedicine(null)}
        medicine={adjustMedicine}
      />
    </div>
  );
};
