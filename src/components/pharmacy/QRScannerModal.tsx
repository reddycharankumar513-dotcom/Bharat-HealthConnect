import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { 
  Camera, 
  QrCode, 
  Search, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Pill, 
  Receipt, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleSuccess?: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onSaleSuccess }) => {
  const { showToast, adjustStock } = useApp();

  const [activeMode, setActiveMode] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);

  // Scanned Medicine Details
  const [scannedItem, setScannedItem] = useState<{
    batchId: string;
    batchNumber: string;
    qrCodeValue: string;
    sku: string;
    name: string;
    genericName: string;
    category: string;
    dosageForm: string;
    requiresPrescription: boolean;
    unitPrice: number;
    availableQuantity: number;
    expiryDate: string;
    isExpired: boolean;
    isRecalled: boolean;
    pharmacyName: string;
  } | null>(null);

  // Sale form states
  const [quantitySold, setQuantitySold] = useState(1);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'CASH' | 'CARD'>('UPI');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [prescriptionVerified, setPrescriptionVerified] = useState(false);
  const [saleError, setSaleError] = useState('');
  const [completedSale, setCompletedSale] = useState<{
    saleRef: string;
    totalAmount: number;
    remainingStock: number;
    isLowStock: boolean;
    suggestedReorderQty?: number;
  } | null>(null);

  const sampleTestCodes = [
    { code: 'BHC-QR-AUG-B2401', label: 'Augmentin 625 (Batch B2401)' },
    { code: 'BHC-QR-TEL-T8901', label: 'Telma 40mg (Batch T8901 - Low Stock)' },
    { code: 'BHC-QR-GLY-G5510', label: 'Glycomet-GP 1 (Batch G5510)' },
    { code: 'BHC-QR-DOL-D9001', label: 'Dolo 650 (Batch D9001)' }
  ];

  const handleLookup = async (codeToLookup: string) => {
    if (!codeToLookup.trim()) return;

    setLoading(true);
    setSaleError('');
    setScannedItem(null);
    setCompletedSale(null);

    try {
      const res = await api.get(`/pharmacy/qr/lookup?code=${encodeURIComponent(codeToLookup.trim())}`);

      if (res.success && res.data) {
        setScannedItem(res.data);
        setQuantitySold(1);
        setPrescriptionVerified(!res.data.requiresPrescription);
        showToast(`Identified: ${res.data.name} (Batch ${res.data.batchNumber})`, 'success');
      } else {
        setSaleError(res.message || 'Product identifier not recognized.');
      }
    } catch (err: any) {
      setSaleError('Lookup failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedItem) return;

    if (scannedItem.isExpired) {
      setSaleError('Cannot dispense expired medication.');
      return;
    }

    if (scannedItem.isRecalled) {
      setSaleError('Cannot dispense recalled batch.');
      return;
    }

    if (scannedItem.requiresPrescription && !prescriptionVerified) {
      setSaleError('Pharmacist prescription verification is mandatory for Schedule H/X drugs.');
      return;
    }

    if (quantitySold > scannedItem.availableQuantity) {
      setSaleError(`Insufficient stock. Available: ${scannedItem.availableQuantity}`);
      return;
    }

    setLoading(true);
    setSaleError('');

    try {
      const res = await api.post('/pharmacy/sale', {
        batchId: scannedItem.batchId,
        quantitySold,
        paymentMode,
        customerName: customerName || 'Walk-in Patient',
        customerPhone,
        prescriptionVerified
      });

      if (res.success && res.data) {
        setCompletedSale(res.data);
        showToast(`Sale confirmed! Reference: ${res.data.saleRef}`, 'success');
        
        // Also sync local state if needed
        adjustStock(scannedItem.batchId, res.data.remainingStock);

        if (onSaleSuccess) {
          onSaleSuccess();
        }
      } else {
        setSaleError(res.message || 'Sale deduction transaction failed.');
      }
    } catch (err: any) {
      setSaleError(err.message || 'Error processing sale transaction.');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setScannedItem(null);
    setCompletedSale(null);
    setManualCode('');
    setSaleError('');
    setQuantitySold(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-teal-700 to-medblue-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-300">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">QR Code Medicine Stock Scanner</h2>
              <p className="text-xs text-teal-100">Live barcode scanning, batch verification & instant stock deduction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {completedSale ? (
            /* Digital Sale Receipt Screen */
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase">
                  Transaction Verified & Stock Deducted
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  Sale Reference: {completedSale.saleRef}
                </h3>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs text-xs space-y-2 text-left max-w-md mx-auto">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Dispensed Medication</span>
                  <span className="font-bold text-slate-800">{scannedItem?.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Batch Number</span>
                  <span className="font-bold text-slate-800">{scannedItem?.batchNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Quantity Sold</span>
                  <span className="font-bold text-slate-800">{quantitySold} Units</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Total Billed (INR)</span>
                  <span className="font-black text-teal-700 text-sm">₹{completedSale.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Remaining Batch Stock</span>
                  <span className="font-bold text-slate-900">{completedSale.remainingStock} Units</span>
                </div>
              </div>

              {completedSale.isLowStock && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong>Low Stock Alert:</strong> Batch remaining is below minimum threshold. Suggested reorder: {completedSale.suggestedReorderQty || 100} units.
                  </span>
                </div>
              )}

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={resetAll}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Scan Another Product
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Close & View Inventory
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Scan Mode Switcher */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveMode('camera')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeMode === 'camera' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Camera Scanner</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMode('manual')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeMode === 'manual' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Manual Code / Barcode</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 font-medium">Pharmacist Station 1</span>
              </div>

              {/* Camera Scanner Viewfinder */}
              {activeMode === 'camera' ? (
                <div className="relative rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[220px] text-center">
                  {/* Scanner Graphic Simulation */}
                  <div className="relative w-48 h-48 border-2 border-teal-400/60 rounded-2xl flex items-center justify-center overflow-hidden">
                    {/* Animated scanning laser line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-bounce" />
                    
                    <QrCode className="w-24 h-24 text-teal-400/40" />

                    {/* Corner Reticles */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-teal-400" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-teal-400" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-teal-400" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-teal-400" />
                  </div>

                  <p className="text-xs text-slate-300 mt-3 font-medium">
                    Point camera at packaging QR code or click a test QR code below
                  </p>

                  {/* Quick Click Demo Barcodes */}
                  <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                    {sampleTestCodes.map(item => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => handleLookup(item.code)}
                        className="px-2.5 py-1 bg-teal-950/80 hover:bg-teal-900 border border-teal-600/50 text-teal-200 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-teal-400" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Manual Input Form */
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    Enter QR Code String, Batch Number, or SKU
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. BHC-QR-AUG-B2401 or AUG-B2401"
                      value={manualCode}
                      onChange={e => setManualCode(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleLookup(manualCode)}
                      className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      disabled={loading || !manualCode.trim()}
                      onClick={() => handleLookup(manualCode)}
                      className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
                    >
                      Lookup
                    </button>
                  </div>
                </div>
              )}

              {/* Sale Error Notification */}
              {saleError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{saleError}</span>
                </div>
              )}

              {/* Scanned Medicine Preview & Confirmed Sale Form */}
              {scannedItem && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-bold rounded-md uppercase">
                          {scannedItem.category}
                        </span>
                        {scannedItem.requiresPrescription && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-md uppercase">
                            Prescription (Rx) Required
                          </span>
                        )}
                        {scannedItem.isExpired && (
                          <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-md uppercase">
                            EXPIRED
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">{scannedItem.name}</h4>
                      <p className="text-xs text-slate-500">{scannedItem.genericName} • {scannedItem.dosageForm}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-medium">Unit Price</span>
                      <p className="text-base font-black text-teal-700">₹{scannedItem.unitPrice.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Batch Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-white rounded-xl border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Batch Number</span>
                      <strong className="text-slate-800 font-mono">{scannedItem.batchNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Expiry Date</span>
                      <strong className={`font-mono ${scannedItem.isExpired ? 'text-rose-600' : 'text-slate-800'}`}>
                        {scannedItem.expiryDate}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Stock in Batch</span>
                      <strong className="text-emerald-700 font-mono font-bold">{scannedItem.availableQuantity} Units</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">SKU</span>
                      <strong className="text-slate-800 font-mono">{scannedItem.sku}</strong>
                    </div>
                  </div>

                  {/* Sale Confirmation Form */}
                  <form onSubmit={handleConfirmSale} className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Dispense Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={scannedItem.availableQuantity}
                          value={quantitySold}
                          onChange={e => setQuantitySold(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Payment Mode
                        </label>
                        <select
                          value={paymentMode}
                          onChange={e => setPaymentMode(e.target.value as any)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="UPI">UPI / QR Payment</option>
                          <option value="CASH">Cash in Hand</option>
                          <option value="CARD">Credit/Debit Card</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Total Amount (INR)
                        </label>
                        <div className="p-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-teal-700 flex items-center justify-between">
                          <span>₹{(quantitySold * scannedItem.unitPrice).toFixed(2)}</span>
                          <span className="text-[10px] text-slate-400 font-normal">Inc. GST</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Customer Name (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Walk-in Patient"
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Phone Number (Optional)
                        </label>
                        <input
                          type="tel"
                          placeholder="+91 98765 00000"
                          value={customerPhone}
                          onChange={e => setCustomerPhone(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    {scannedItem.requiresPrescription && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prescriptionVerified}
                            onChange={e => setPrescriptionVerified(e.target.checked)}
                            className="rounded border-rose-300 text-rose-600 focus:ring-rose-500 w-4 h-4"
                          />
                          <span className="text-xs font-bold text-rose-800">
                            I verify that a valid medical prescription from a registered medical practitioner has been inspected.
                          </span>
                        </label>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || scannedItem.isExpired || scannedItem.isRecalled || (scannedItem.requiresPrescription && !prescriptionVerified)}
                      className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Deducting Stock & Recording Transaction...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm Sale & Deduct Stock ({quantitySold} Units)</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
