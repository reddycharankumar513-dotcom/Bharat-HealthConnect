import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Medicine, Supplier } from '../../types';
import { mockSuppliers } from '../../data/mockMedicines';
import { Modal } from '../../components/common/Modal';
import { 
  ShoppingCart, 
  Pill, 
  Building2, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
}

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  medicine,
}) => {
  const { createPurchaseOrder, purchaseOrders } = useApp();

  const [quantity, setQuantity] = useState<number>(100);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(mockSuppliers[0].id);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (medicine) {
      setQuantity(medicine.suggestedReorderQty || 100);
      setSelectedSupplierId(medicine.supplierId || mockSuppliers[0].id);
      setNotes(`Urgent replenishment for low-stock medicine: ${medicine.name}`);
    }
  }, [medicine, isOpen]);

  if (!medicine) return null;

  const supplier = mockSuppliers.find(s => s.id === selectedSupplierId) || mockSuppliers[0];
  const unitDiscountedPrice = Math.round(medicine.unitPrice * 0.85);
  const totalAmount = unitDiscountedPrice * quantity;

  // Check if active order already exists
  const hasExistingActiveOrder = purchaseOrders.some(
    po => po.medicineId === medicine.id && 
          ['Pending Approval', 'Approved', 'Ordered', 'Dispatched'].includes(po.status)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createPurchaseOrder(medicine.id, quantity, selectedSupplierId, notes);
    if (res.success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Procurement Purchase Order"
      subtitle={`Automated stock replenishment for ${medicine.name}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {hasExistingActiveOrder && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              An active purchase order already exists for this medicine. Duplicate orders are restricted.
            </span>
          </div>
        )}

        {/* Medicine Overview Card */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900">{medicine.name}</h4>
            <span className="font-mono text-xs text-slate-500">{medicine.sku}</span>
          </div>
          <p className="text-xs text-slate-600 italic">{medicine.genericName}</p>
          <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Current Stock</span>
              <strong className="text-rose-600 font-bold">{medicine.quantity} Units</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Min. Threshold</span>
              <strong className="text-slate-800">{medicine.minThreshold} Units</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Batch No</span>
              <strong className="text-slate-800">{medicine.batchNumber}</strong>
            </div>
          </div>
        </div>

        {/* Registered Supplier Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            Registered Pharmaceutical Supplier
          </label>
          <select
            value={selectedSupplierId}
            onChange={e => setSelectedSupplierId(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-teal-500"
          >
            {mockSuppliers.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.city}) • Lead Time: {s.leadTimeDays} Days • GST: {s.gstNumber}
              </option>
            ))}
          </select>
        </div>

        {/* Reorder Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reorder Quantity (Units)
            </label>
            <input
              type="number"
              min={10}
              step={10}
              value={quantity}
              onChange={e => setQuantity(Math.max(10, Number(e.target.value)))}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-bold"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Suggested: {medicine.suggestedReorderQty} units based on monthly consumption
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estimated Delivery
            </label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>{supplier.leadTimeDays} business days ({new Date(Date.now() + supplier.leadTimeDays * 86400000).toLocaleDateString('en-IN')})</span>
            </div>
          </div>
        </div>

        {/* Price calculation */}
        <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block">Unit Cost: ₹{unitDiscountedPrice} (Institutional Discount)</span>
            <span className="text-[10px] text-teal-800 font-medium">Payment terms: 30 days credit</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Estimated Cost</span>
            <strong className="text-base font-bold text-teal-900">₹{totalAmount.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Procurement Notes / Batch Instructions
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={hasExistingActiveOrder}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Generate & Approve Purchase Order</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
