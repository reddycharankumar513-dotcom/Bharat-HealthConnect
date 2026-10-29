import React from 'react';
import { Medicine } from '../../types';
import { X, Printer, QrCode, Download, ShieldCheck } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, medicine }) => {
  if (!isOpen || !medicine) return null;

  const qrValue = `BHC-QR-${medicine.name.slice(0, 3).toUpperCase()}-${medicine.batchNumber}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold">Standard Batch QR Label</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label Area */}
        <div className="p-6 text-center space-y-4">
          <div className="p-5 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 inline-block mx-auto">
            {/* SVG Simulated High-Res QR Code */}
            <div className="w-48 h-48 bg-white p-3 rounded-xl border border-slate-200 mx-auto flex flex-col items-center justify-center shadow-xs">
              <svg viewBox="0 0 100 100" className="w-40 h-40 fill-slate-900">
                {/* 3 Corner Anchor Marks */}
                <rect x="5" y="5" width="25" height="25" fill="#0f172a" />
                <rect x="8" y="8" width="19" height="19" fill="#ffffff" />
                <rect x="12" y="12" width="11" height="11" fill="#0f172a" />

                <rect x="70" y="5" width="25" height="25" fill="#0f172a" />
                <rect x="73" y="8" width="19" height="19" fill="#ffffff" />
                <rect x="77" y="12" width="11" height="11" fill="#0f172a" />

                <rect x="5" y="70" width="25" height="25" fill="#0f172a" />
                <rect x="8" y="73" width="19" height="19" fill="#ffffff" />
                <rect x="12" y="77" width="11" height="11" fill="#0f172a" />

                {/* Randomized QR Data Patterns */}
                <rect x="35" y="10" width="6" height="6" />
                <rect x="45" y="15" width="6" height="6" />
                <rect x="55" y="8" width="6" height="6" />
                <rect x="38" y="25" width="8" height="8" />
                <rect x="50" y="30" width="6" height="6" />
                <rect x="10" y="35" width="6" height="6" />
                <rect x="25" y="45" width="8" height="8" />
                <rect x="40" y="45" width="20" height="20" fill="#0d9488" />
                <circle cx="50" cy="55" r="4" fill="#ffffff" />
                <rect x="70" y="35" width="8" height="8" />
                <rect x="85" y="45" width="6" height="6" />
                <rect x="75" y="55" width="10" height="10" />
                <rect x="35" y="70" width="8" height="8" />
                <rect x="48" y="75" width="6" height="6" />
                <rect x="58" y="85" width="8" height="8" />
                <rect x="70" y="75" width="8" height="8" />
                <rect x="82" y="82" width="8" height="8" />
              </svg>
            </div>

            <div className="mt-3 text-left border-t border-slate-200 pt-2 text-[11px] space-y-1">
              <div className="font-bold text-slate-900 truncate">{medicine.name}</div>
              <div className="text-slate-500 font-mono text-[10px]">QR Code: {qrValue}</div>
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>Batch: <strong>{medicine.batchNumber}</strong></span>
                <span>Exp: <strong>{medicine.expiryDate}</strong></span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>MRP: <strong>₹{medicine.unitPrice.toFixed(2)}</strong></span>
                <span>SKU: {medicine.sku}</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Attach this QR label to the medicine carton or shelf bin. When scanned, Bharat HealthConnect automatically resolves batch validity, stock levels, and prevents expired dispensing.
          </p>

          <div className="flex gap-2 justify-center pt-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Shelf Label</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
