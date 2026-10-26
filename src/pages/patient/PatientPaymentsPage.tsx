import React, { useState } from 'react';
import { mockInvoices, mockGovernmentSchemes } from '../../data/mockBilling';
import { Invoice } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useApp } from '../../context/AppContext';
import { 
  CreditCard, 
  FileText, 
  ShieldCheck, 
  Download, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Receipt
} from 'lucide-react';

export const PatientPaymentsPage: React.FC = () => {
  const { showToast } = useApp();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const totalSpent = mockInvoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-teal-600" />
          Payments, Invoices & Health Insurance Schemes
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review digital consultation invoices, diagnostic receipts, and national health coverage claims
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Billed (Demo)</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">₹{totalSpent.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-emerald-600 font-medium">All settled digitally via UPI/ABHA</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Ayushman PM-JAY Coverage</span>
          <div className="text-2xl font-bold text-teal-700 mt-2">₹5,00,000</div>
          <span className="text-[11px] text-teal-600 font-medium">Active Family Empanelled Limit</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Claims</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">1 Claim Processing</div>
          <span className="text-[11px] text-amber-600 font-medium">HbA1c Diagnostic Panel Reimbursement</span>
        </div>
      </div>

      {/* Government Health Schemes Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              National & State Healthcare Schemes
            </h3>
            <p className="text-xs text-slate-500">Zero paperwork, digital pre-authorization through your ABHA identity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockGovernmentSchemes.map(scheme => (
            <div
              key={scheme.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 inline-block mb-1.5">
                  {scheme.status}
                </span>
                <h4 className="font-bold text-sm text-slate-900">{scheme.name}</h4>
                <p className="text-xs font-semibold text-slate-700 mt-1">{scheme.coverageAmount}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{scheme.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <button
                  onClick={() => showToast(`Linked with ABHA for ${scheme.name}`, 'success')}
                  className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 text-teal-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <span>Verify Card Status</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-teal-600" />
          Recent Invoices & Transactions
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Invoice Number</th>
                <th className="p-3">Date</th>
                <th className="p-3">Description</th>
                <th className="p-3">Category</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{inv.invoiceNumber}</td>
                  <td className="p-3 text-slate-500">{inv.date}</td>
                  <td className="p-3 font-medium text-slate-800 max-w-xs truncate">{inv.description}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 font-medium text-slate-700">
                      {inv.category}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-900">₹{inv.amount}</td>
                  <td className="p-3">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => showToast(`Invoice ${inv.invoiceNumber} downloaded`, 'info')}
                      className="px-2.5 py-1 text-xs font-semibold text-teal-600 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-colors inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
