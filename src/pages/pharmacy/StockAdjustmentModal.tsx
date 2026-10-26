import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Medicine } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Pill, CheckCircle2, AlertTriangle, ArrowUpDown } from 'lucide-react';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  medicine,
}) => {
  const { adjustStock } = useApp();

  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState<string>('Physical Inventory Audit');

  useEffect(() => {
    if (medicine) {
      setQuantity(medicine.quantity);
    }
  }, [medicine, isOpen]);

  if (!medicine) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adjustStock(medicine.id, quantity);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Physical Stock Adjustment"
      subtitle={`Adjust shelf count for ${medicine.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Medicine:</span>
            <strong className="text-slate-900">{medicine.name}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Batch Number:</span>
            <span className="font-mono">{medicine.batchNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">System Count:</span>
            <strong className="text-slate-800">{medicine.quantity} Units</strong>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            New Verified Physical Count (Units)
          </label>
          <input
            type="number"
            min={0}
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reason for Adjustment
          </label>
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
          >
            <option>Physical Inventory Audit Reconcile</option>
            <option>Damaged Packaging Write-Off</option>
            <option>Expired Batch Quarantine</option>
            <option>Inter-Department Hospital Transfer</option>
          </select>
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
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            Update Inventory Count
          </button>
        </div>
      </form>
    </Modal>
  );
};
