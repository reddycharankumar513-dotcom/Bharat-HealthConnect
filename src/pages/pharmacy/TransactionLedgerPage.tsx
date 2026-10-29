import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ArrowDownRight, 
  ArrowUpRight, 
  QrCode, 
  ShoppingCart, 
  Truck, 
  SlidersHorizontal,
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface TransactionItem {
  id: string;
  transactionRef: string;
  medicineName: string;
  batchNumber: string;
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;
  source: string;
  staffName: string;
  status: string;
  notes?: string;
  timestamp: string;
}

export const TransactionLedgerPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('All');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/pharmacy/transactions?source=${selectedSource}&searchTerm=${searchTerm}`);
      if (res.success && res.transactions) {
        setTransactions(res.transactions);
      } else {
        // Fallback demo data
        setTransactions([
          {
            id: 'tx-1',
            transactionRef: 'TX-QR-1793040001',
            medicineName: 'Augmentin 625 Duo Tablet',
            batchNumber: 'AUG-B2401',
            quantityBefore: 50,
            quantityChange: -2,
            quantityAfter: 48,
            source: 'QR_SALE',
            staffName: 'K. S. Narayanan (Pharmacist)',
            status: 'COMPLETED',
            notes: 'QR Sale Ref: SALE-20261029-4412',
            timestamp: new Date().toISOString()
          },
          {
            id: 'tx-2',
            transactionRef: 'TX-ORD-1793039120',
            medicineName: 'Telma 40mg Tablet',
            batchNumber: 'TEL-T8901',
            quantityBefore: 24,
            quantityChange: -2,
            quantityAfter: 22,
            source: 'ONLINE_ORDER',
            staffName: 'K. S. Narayanan (Pharmacist)',
            status: 'COMPLETED',
            notes: 'Online Order ORD-BHC-88129',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'tx-3',
            transactionRef: 'TX-REC-1793021990',
            medicineName: 'Glycomet-GP 1 Tablet PR',
            batchNumber: 'GLY-G5510',
            quantityBefore: 40,
            quantityChange: 100,
            quantityAfter: 140,
            source: 'SUPPLIER_RECEIPT',
            staffName: 'K. S. Narayanan (Pharmacist)',
            status: 'COMPLETED',
            notes: 'Goods received from Bharat MedLogistics',
            timestamp: new Date(Date.now() - 86400000).toISOString()
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedSource]);

  const handleExportCSV = () => {
    const headers = ['Transaction Ref,Medicine,Batch,Qty Before,Change,Qty After,Source,Staff,Date'];
    const rows = transactions.map(t => 
      `"${t.transactionRef}","${t.medicineName}","${t.batchNumber}",${t.quantityBefore},${t.quantityChange},${t.quantityAfter},"${t.source}","${t.staffName}","${t.timestamp}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bharat_HealthConnect_Inventory_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = transactions.filter(t => {
    const matchesSearch = t.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.transactionRef.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = selectedSource === 'All' || t.source === selectedSource;
    return matchesSearch && matchesSource;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-teal-600" />
            Inventory Stock Movement & Transaction Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident audit trail of all QR sales, stock reservations, manual adjustments, and wholesale supplier receipts
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Ledger (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by transaction reference, medicine name, batch number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={selectedSource}
            onChange={e => setSelectedSource(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:ring-2 focus:ring-teal-500"
          >
            <option value="All">All Movement Sources</option>
            <option value="QR_SALE">QR Scanner Sales</option>
            <option value="ONLINE_ORDER">Online Patient Orders</option>
            <option value="SUPPLIER_RECEIPT">Supplier Receipts (Restock)</option>
            <option value="MANUAL_ADJUSTMENT">Manual Adjustments</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Ref & Source</th>
                <th className="py-3 px-4">Medicine & Formulation</th>
                <th className="py-3 px-4">Batch No.</th>
                <th className="py-3 px-4 text-center">Before</th>
                <th className="py-3 px-4 text-center">Change</th>
                <th className="py-3 px-4 text-center">Remaining</th>
                <th className="py-3 px-4">Authorized Staff</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No transactions matching your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      <div>{tx.transactionRef}</div>
                      <span className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        tx.source === 'QR_SALE' ? 'bg-teal-100 text-teal-800' :
                        tx.source === 'ONLINE_ORDER' ? 'bg-medblue-100 text-medblue-800' :
                        tx.source === 'SUPPLIER_RECEIPT' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {tx.source === 'QR_SALE' && <QrCode className="w-2.5 h-2.5" />}
                        {tx.source === 'ONLINE_ORDER' && <ShoppingCart className="w-2.5 h-2.5" />}
                        {tx.source === 'SUPPLIER_RECEIPT' && <Truck className="w-2.5 h-2.5" />}
                        <span>{tx.source.replace(/_/g, ' ')}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{tx.medicineName}</div>
                      {tx.notes && <div className="text-[10px] text-slate-400 truncate max-w-xs">{tx.notes}</div>}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{tx.batchNumber}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">{tx.quantityBefore}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center font-bold font-mono px-2 py-0.5 rounded-full text-xs ${
                        tx.quantityChange < 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {tx.quantityChange < 0 ? (
                          <ArrowDownRight className="w-3 h-3 mr-0.5" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 mr-0.5" />
                        )}
                        {tx.quantityChange > 0 ? `+${tx.quantityChange}` : tx.quantityChange}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{tx.quantityAfter}</td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]">{tx.staffName}</td>
                    <td className="py-3 px-4 text-right text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(tx.timestamp).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
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
