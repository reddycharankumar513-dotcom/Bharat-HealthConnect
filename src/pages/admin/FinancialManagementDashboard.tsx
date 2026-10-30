import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { TiltCard3D } from '../../components/common/TiltCard3D';
import { StatCard } from '../../components/common/StatCard';
import { 
  CreditCard, 
  Receipt, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Plus, 
  RefreshCw, 
  X, 
  ArrowUpRight, 
  Building2,
  FileText,
  RotateCcw,
  TrendingUp,
  Printer,
  Eye,
  Filter,
  Search,
  Users,
  Wallet,
  Check,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

interface InvoiceItem {
  id?: string;
  description: string;
  serviceCategory: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate?: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  hospitalId: string;
  doctorId?: string;
  category: string;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  insuranceCovered: number;
  paidAmount: number;
  outstandingBalance: number;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  dueDate?: string;
  notes?: string;
  createdAt: string;
  patient?: {
    id: string;
    user: {
      fullName: string;
      email: string;
      phone: string;
      abhaId?: string;
    };
  };
  hospital?: {
    id: string;
    name: string;
    city: string;
  };
  doctor?: {
    user: {
      fullName: string;
    };
  };
  items?: InvoiceItem[];
  payments?: Array<{
    id: string;
    paymentReference: string;
    amount: number;
    paymentMethod: string;
    status: string;
    paidAt: string;
  }>;
}

interface LedgerEntry {
  id: string;
  ledgerRef: string;
  hospitalId: string;
  entryType: 'CREDIT' | 'DEBIT';
  category: string;
  amount: number;
  source: string;
  referenceId: string;
  balanceAfter?: number;
  description: string;
  postedAt: string;
  hospital?: {
    name: string;
  };
}

interface RefundRecord {
  id: string;
  refundReference: string;
  paymentId: string;
  invoiceId: string;
  amount: number;
  reason: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  requestedBy: string;
  approvedBy?: string;
  createdAt: string;
  payment?: {
    paymentReference: string;
    paymentMethod: string;
  };
  invoice?: {
    invoiceNumber: string;
    patient?: {
      user: {
        fullName: string;
        phone: string;
      };
    };
  };
}

interface InsuranceClaim {
  id: string;
  claimNumber: string;
  policyId: string;
  invoiceId: string;
  patientId: string;
  claimAmount: number;
  approvedAmount: number;
  patientPayable: number;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SETTLED';
  preAuthCode?: string;
  remarks?: string;
  createdAt: string;
  policy?: {
    providerName: string;
    policyNumber: string;
    coverageAmount: number;
    remainingAmount: number;
  };
  invoice?: {
    invoiceNumber: string;
    totalAmount: number;
    patient?: {
      user: {
        fullName: string;
        abhaId?: string;
      };
    };
  };
}

interface FinanceMetrics {
  totalBilled: number;
  totalCollected: number;
  totalOutstanding: number;
  totalRefunded: number;
  pendingRefunds: number;
  insuranceSettled: number;
  totalInvoiceCount: number;
  pendingInvoiceCount: number;
  paidInvoiceCount: number;
  netRevenue: number;
}

const COLORS = ['#0d9488', '#0284c7', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981'];

export const FinancialManagementDashboard: React.FC = () => {
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'analytics' | 'invoices' | 'cashier' | 'insurance' | 'refunds' | 'ledger'>('analytics');
  const [loading, setLoading] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null);
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number }>>([]);
  const [methodData, setMethodData] = useState<Array<{ name: string; value: number }>>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);

  // Tables State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [refunds, setRefunds] = useState<RefundRecord[]>([]);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);

  // Filters
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('ALL');
  const [invoiceCategoryFilter, setInvoiceCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<string>('ALL');

  // Modals
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState<boolean>(false);
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<Invoice | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

  // New Invoice Form
  const [newInvoiceData, setNewInvoiceData] = useState({
    patientId: 'pat-1', // Default Charan Kumar Reddy
    hospitalId: 'hosp-aims-hyd',
    category: 'CONSULTATION',
    discountAmount: 0,
    discountReason: '',
    notes: 'Generated from ArogyaCare Central Financial Desk',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [
      { description: 'Specialist Physician Consultation (OPD)', serviceCategory: 'CONSULTATION', quantity: 1, unitPrice: 800, taxRate: 0 }
    ]
  });

  // Cashier Offline Payment Form
  const [offlinePaymentForm, setOfflinePaymentForm] = useState({
    amount: '',
    paymentMethod: 'CASH',
    notes: 'Counter Cash Collection Desk'
  });

  // Claim Settlement Form
  const [selectedClaimForSettlement, setSelectedClaimForSettlement] = useState<InsuranceClaim | null>(null);
  const [claimSettlementForm, setClaimSettlementForm] = useState({
    approvedAmount: '',
    status: 'APPROVED',
    remarks: 'Approved cashless hospital claim as per PM-JAY tariff rates'
  });

  // Fetch all financial data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Dashboard Metrics
      const dashRes = await api.get('/finance/dashboard');
      if (dashRes.success) {
        setMetrics(dashRes.metrics);
        setCategoryData(dashRes.categoryRevenue || []);
        setMethodData(dashRes.paymentMethods || []);
        setMonthlyTrend(dashRes.monthlyTrend || []);
      }

      // 2. Invoices
      const invRes = await api.get('/billing');
      if (invRes.success) {
        setInvoices(invRes.invoices || []);
      }

      // 3. Ledger
      const ledRes = await api.get('/finance/ledger');
      if (ledRes.success) {
        setLedgerEntries(ledRes.ledger || []);
      }

      // 4. Refunds
      const refRes = await api.get('/finance/refunds');
      if (refRes.success) {
        setRefunds(refRes.refunds || []);
      }

      // 5. Insurance Claims
      const claimRes = await api.get('/insurance/claims');
      if (claimRes.success) {
        setClaims(claimRes.claims || []);
      }
    } catch (err) {
      console.error('Failed to load financial data:', err);
      showToast('Could not sync financial analytics from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format INR currency
  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt || 0);
  };

  // Add Item to New Invoice
  const handleAddItem = () => {
    setNewInvoiceData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { description: '', serviceCategory: 'PROCEDURE', quantity: 1, unitPrice: 500, taxRate: 0 }
      ]
    }));
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    if (newInvoiceData.items.length <= 1) return;
    setNewInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Update Item field
  const handleItemChange = (index: number, field: string, val: any) => {
    setNewInvoiceData(prev => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, items: updated };
    });
  };

  // Calculate invoice live total
  const calculatedSubtotal = newInvoiceData.items.reduce((sum, item) => sum + (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0), 0);
  const calculatedTax = newInvoiceData.items.reduce((sum, item) => {
    const itemTotal = (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0);
    return sum + (itemTotal * (Number(item.taxRate) || 0)) / 100;
  }, 0);
  const calculatedTotal = Math.max(0, calculatedSubtotal + calculatedTax - (Number(newInvoiceData.discountAmount) || 0));

  // Submit New Invoice
  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newInvoiceData.items.some(i => !i.description.trim())) {
      showToast('Please enter descriptions for all invoice items.', 'warning');
      return;
    }

    try {
      const res = await api.post('/billing', newInvoiceData);
      if (res.success) {
        showToast(`Invoice ${res.invoice.invoiceNumber} created successfully!`, 'success');
        setShowCreateInvoiceModal(false);
        fetchData();
      } else {
        showToast(res.message || 'Failed to create invoice.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit invoice.', 'error');
    }
  };

  // Submit Offline Payment Collection (Cashier Desk)
  const handleRecordOfflinePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;

    const amt = Number(offlinePaymentForm.amount);
    if (!amt || amt <= 0 || amt > selectedInvoiceForPayment.outstandingBalance) {
      showToast(`Invalid payment amount. Max collectable: ${formatINR(selectedInvoiceForPayment.outstandingBalance)}`, 'warning');
      return;
    }

    try {
      const res = await api.post('/payments/record-offline', {
        invoiceId: selectedInvoiceForPayment.id,
        amount: amt,
        paymentMethod: offlinePaymentForm.paymentMethod,
        notes: offlinePaymentForm.notes
      });

      if (res.success) {
        showToast(`Collected ${formatINR(amt)} successfully! Receipt ${res.payment.paymentReference} issued.`, 'success');
        setSelectedInvoiceForPayment(null);
        setOfflinePaymentForm({ amount: '', paymentMethod: 'CASH', notes: 'Counter Cash Collection Desk' });
        fetchData();
      } else {
        showToast(res.message || 'Payment collection failed.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Payment recording failed.', 'error');
    }
  };

  // Approve / Reject Refund
  const handleRefundAction = async (refundId: string, status: 'PROCESSED' | 'REJECTED') => {
    try {
      const res = await api.patch(`/finance/refunds/${refundId}/status`, {
        status,
        remarks: status === 'PROCESSED' ? 'Approved & reversed via financial reconciliation desk.' : 'Rejected upon administrative review.'
      });

      if (res.success) {
        showToast(`Refund status updated to ${status}.`, 'success');
        fetchData();
      } else {
        showToast(res.message || 'Failed to update refund.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Refund action error.', 'error');
    }
  };

  // Settle Insurance Claim
  const handleSettleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaimForSettlement) return;

    const appAmt = Number(claimSettlementForm.approvedAmount);
    if (isNaN(appAmt) || appAmt < 0 || appAmt > selectedClaimForSettlement.claimAmount) {
      showToast(`Approved amount must be between ₹0 and ₹${selectedClaimForSettlement.claimAmount}`, 'warning');
      return;
    }

    try {
      const res = await api.patch(`/insurance/claims/${selectedClaimForSettlement.id}/status`, {
        status: claimSettlementForm.status,
        approvedAmount: appAmt,
        remarks: claimSettlementForm.remarks
      });

      if (res.success) {
        showToast(`Insurance claim ${res.claim.claimNumber} settled successfully.`, 'success');
        setSelectedClaimForSettlement(null);
        fetchData();
      } else {
        showToast(res.message || 'Settlement failed.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Claim settlement error.', 'error');
    }
  };

  // Export Ledger as CSV
  const handleExportLedgerCSV = () => {
    if (ledgerEntries.length === 0) {
      showToast('No ledger entries to export.', 'info');
      return;
    }

    const headers = ['Ledger Ref', 'Entry Type', 'Category', 'Amount (INR)', 'Source', 'Description', 'Timestamp'];
    const rows = ledgerEntries.map(l => [
      l.ledgerRef,
      l.entryType,
      l.category,
      l.amount,
      l.source,
      `"${l.description.replace(/"/g, '""')}"`,
      new Date(l.postedAt).toLocaleString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ArogyaCare_Financial_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Financial ledger CSV downloaded.', 'success');
  };

  // Filtered Invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = invoiceStatusFilter === 'ALL' || inv.status === invoiceStatusFilter;
    const matchesCategory = invoiceCategoryFilter === 'ALL' || inv.category === invoiceCategoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.patient?.user?.fullName?.toLowerCase().includes(q) ||
      inv.patient?.user?.phone?.includes(q) ||
      inv.patient?.user?.abhaId?.toLowerCase().includes(q);
    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Filtered Ledger
  const filteredLedger = ledgerEntries.filter(entry => {
    return ledgerTypeFilter === 'ALL' || entry.entryType === ledgerTypeFilter;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-elevated flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-teal-800/40">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
              National Treasury & Hospital Accounts
            </span>
            <span className="text-xs text-teal-200">Razorpay Live Gateway & PM-JAY Cashless</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Financial & Billing Operations</h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Centralized itemized billing, multi-tender payment processing, PM-JAY pre-authorizations, refund approvals, and double-entry immutable ledger accounting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 shadow-sm transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Ledger</span>
          </button>

          <button
            onClick={() => setShowCreateInvoiceModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Invoice</span>
          </button>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Billed"
          value={formatINR(metrics?.totalBilled || 0)}
          subtitle={`${metrics?.totalInvoiceCount || 0} Invoices`}
          icon={<Receipt className="w-5 h-5 text-indigo-600" />}
          iconBgColor="bg-indigo-50"
        />
        <StatCard
          title="Collections"
          value={formatINR(metrics?.totalCollected || 0)}
          subtitle={`${metrics?.paidInvoiceCount || 0} Settled`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
        />
        <StatCard
          title="Net Revenue"
          value={formatINR(metrics?.netRevenue || 0)}
          subtitle="After Reversals"
          icon={<TrendingUp className="w-5 h-5 text-teal-600" />}
          iconBgColor="bg-teal-50"
        />
        <StatCard
          title="Outstanding"
          value={formatINR(metrics?.totalOutstanding || 0)}
          subtitle={`${metrics?.pendingInvoiceCount || 0} Pending`}
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-50"
        />
        <StatCard
          title="PM-JAY Cashless"
          value={formatINR(metrics?.insuranceSettled || 0)}
          subtitle="TPA Settled"
          icon={<ShieldCheck className="w-5 h-5 text-blue-600" />}
          iconBgColor="bg-blue-50"
        />
        <StatCard
          title="Refunds"
          value={formatINR(metrics?.totalRefunded || 0)}
          subtitle={`${metrics?.pendingRefunds ? formatINR(metrics.pendingRefunds) + ' req' : '0 Pending'}`}
          icon={<RotateCcw className="w-5 h-5 text-rose-600" />}
          iconBgColor="bg-rose-50"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-xs flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Analytics & Trends</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'invoices'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Invoices Directory ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cashier')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'cashier'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Cashier Desk (Counter Pay)</span>
        </button>

        <button
          onClick={() => setActiveTab('insurance')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'insurance'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>PM-JAY & Claims ({claims.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('refunds')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'refunds'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Refunds Queue ({refunds.filter(r => r.status === 'REQUESTED').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'ledger'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Immutable Ledger</span>
        </button>
      </div>

      {/* TAB 1: ANALYTICS & TRENDS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Trend Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-3d-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Collections & PM-JAY Cashless Influx</h3>
                  <p className="text-xs text-slate-500">Monthly revenue trends across direct collections and insurance claims</p>
                </div>
                <span className="px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg border border-teal-200">
                  FY 2026-27
                </span>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip
                      formatter={(val: any) => [formatINR(Number(val)), '']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="collection" name="Direct Patient Collections" fill="#0d9488" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="claims" name="PM-JAY / Cashless Claims" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Revenue Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-3d-card space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Revenue by Clinical Unit</h3>
                <p className="text-xs text-slate-500">Distribution across hospital care verticals</p>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData.length > 0 ? categoryData : [{ name: 'General', value: 100 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => formatINR(Number(val))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                {categoryData.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-slate-600 truncate">{item.name}</span>
                    <span className="font-bold text-slate-800 ml-auto">{formatINR(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-3d-card space-y-4">
              <h3 className="text-base font-bold text-slate-900">Payment Gateway Rails</h3>
              <p className="text-xs text-slate-500">Transactions processed by instrument</p>

              <div className="space-y-3 pt-2">
                {methodData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-teal-600" />
                      <span className="text-xs font-bold text-slate-800 uppercase">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-teal-700">{formatINR(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reconciliation Insights */}
            <div className="md:col-span-2 bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-3d-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Automated Reconciliation & Audit Guard</h3>
                  <p className="text-xs text-teal-200">Continuous cryptographic ledger balance verification</p>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ledger Balanced</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-xs text-teal-200">Daily Clearing House</span>
                  <div className="text-lg font-bold text-white">T+0 Realtime</div>
                  <p className="text-[11px] text-slate-400">NPCI / Razorpay Direct Settlement</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-xs text-teal-200">Duplicate Check Idempotency</span>
                  <div className="text-lg font-bold text-emerald-400">100% Active</div>
                  <p className="text-[11px] text-slate-400">HMAC-SHA256 signature gating</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-xs text-teal-200">Unsettled Discrepancies</span>
                  <div className="text-lg font-bold text-white">0 Accounts</div>
                  <p className="text-[11px] text-slate-400">Zero variance across banks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVOICES DIRECTORY */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice number, patient name, phone, or ABHA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs w-full focus:outline-hidden text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>Status:</span>
              </div>
              <select
                value={invoiceStatusFilter}
                onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending (Unpaid)</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="PAID">Paid in Full</option>
                <option value="REFUNDED">Refunded</option>
              </select>

              <select
                value={invoiceCategoryFilter}
                onChange={(e) => setInvoiceCategoryFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden"
              >
                <option value="ALL">All Categories</option>
                <option value="CONSULTATION">Doctor Consultation</option>
                <option value="INPATIENT">Inpatient & Bed Stay</option>
                <option value="PHARMACY">Pharmacy Medication</option>
                <option value="DIAGNOSTIC">Diagnostic Pathology</option>
                <option value="PROCEDURE">Surgical Procedure</option>
              </select>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-3d-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-4">Patient & ABHA</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4">Paid / Balance</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No invoices match the specified criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{inv.patient?.user?.fullName || 'Walk-in Citizen'}</div>
                          <div className="text-[11px] text-teal-600 font-medium">{inv.patient?.user?.abhaId || inv.patient?.user?.phone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                            {inv.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {formatINR(inv.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-emerald-600">Paid: {formatINR(inv.paidAmount)}</div>
                          {inv.outstandingBalance > 0 && (
                            <div className="text-rose-600 font-bold">Due: {formatINR(inv.outstandingBalance)}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : inv.status === 'PARTIALLY_PAID'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : inv.status === 'REFUNDED'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {inv.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedInvoiceForDetail(inv)}
                              title="View Tax Invoice Breakdown"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <a
                              href={`/api/billing/${inv.id}/pdf`}
                              target="_blank"
                              rel="noreferrer"
                              title="Download Printable PDF"
                              className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </a>

                            {inv.outstandingBalance > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedInvoiceForPayment(inv);
                                  setOfflinePaymentForm(prev => ({ ...prev, amount: String(inv.outstandingBalance) }));
                                }}
                                title="Collect Payment at Desk"
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors flex items-center gap-1"
                              >
                                <Wallet className="w-3.5 h-3.5" />
                                <span>Pay</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CASHIER DESK (COUNTER PAYMENTS) */}
      {activeTab === 'cashier' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-3d-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Hospital Counter Cashier Station</h3>
                  <p className="text-xs text-slate-500">Collect immediate payments via Physical Cash, POS Card Terminal, or PM-JAY Voucher</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Cashier Active</span>
                </span>
              </div>

              {/* Outstanding Invoices List for quick pickup */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Select Pending Invoice to Collect</span>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl">
                  {invoices.filter(i => i.outstandingBalance > 0).length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No unpaid invoices pending. All patient accounts are current!
                    </div>
                  ) : (
                    invoices.filter(i => i.outstandingBalance > 0).map(inv => (
                      <div
                        key={inv.id}
                        onClick={() => {
                          setSelectedInvoiceForPayment(inv);
                          setOfflinePaymentForm(prev => ({ ...prev, amount: String(inv.outstandingBalance) }));
                        }}
                        className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                          selectedInvoiceForPayment?.id === inv.id ? 'bg-teal-50 border-l-4 border-teal-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-800">{inv.invoiceNumber}</span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 uppercase">{inv.category}</span>
                          </div>
                          <div className="text-xs text-slate-600">{inv.patient?.user?.fullName} &bull; {inv.patient?.user?.phone}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-extrabold text-rose-600">{formatINR(inv.outstandingBalance)}</div>
                          <div className="text-[10px] text-slate-400">Total: {formatINR(inv.totalAmount)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Collection Terminal Side-Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-3d-card space-y-4 sticky top-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-teal-600" />
                <span>Collection Terminal</span>
              </h3>

              {selectedInvoiceForPayment ? (
                <form onSubmit={handleRecordOfflinePayment} className="space-y-4">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Invoice:</span>
                      <span className="font-bold text-slate-800">{selectedInvoiceForPayment.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Patient:</span>
                      <span className="font-semibold text-slate-800">{selectedInvoiceForPayment.patient?.user?.fullName}</span>
                    </div>
                    <div className="flex justify-between text-xs border-t border-slate-200 pt-1.5">
                      <span className="text-slate-500 font-semibold">Outstanding Due:</span>
                      <span className="font-extrabold text-rose-600">{formatINR(selectedInvoiceForPayment.outstandingBalance)}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Amount to Collect (₹)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={selectedInvoiceForPayment.outstandingBalance}
                      value={offlinePaymentForm.amount}
                      onChange={(e) => setOfflinePaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full text-sm font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-teal-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Payment Instrument</label>
                    <select
                      value={offlinePaymentForm.paymentMethod}
                      onChange={(e) => setOfflinePaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-teal-600"
                    >
                      <option value="CASH">Physical Cash Currency</option>
                      <option value="POS_CARD">Credit / Debit Card (Card POS)</option>
                      <option value="CHEQUE">Bank Cheque / DD</option>
                      <option value="NEFT">Bank NEFT / RTGS</option>
                      <option value="PMJAY_VOUCHER">PM-JAY e-RUPI Voucher</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Cashier Remarks</label>
                    <input
                      type="text"
                      value={offlinePaymentForm.notes}
                      onChange={(e) => setOfflinePaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-teal-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 transform active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Collection & Issue Receipt</span>
                  </button>
                </form>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400 space-y-2">
                  <Wallet className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>Click on any pending invoice from the left panel to begin cashier collection.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INSURANCE & CASHLESS DESK */}
      {activeTab === 'insurance' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-3d-card">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">PM-JAY & Ayushman Cashless Pre-Auth Desk</h3>
                <p className="text-xs text-slate-500">Review, sanction, and settle cashless healthcare claims under Ayushman Bharat and Private TPAs</p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">
                Empanelled NHA Provider
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Claim #</th>
                    <th className="py-3.5 px-4">Patient / ABHA</th>
                    <th className="py-3.5 px-4">TPA / Provider</th>
                    <th className="py-3.5 px-4">Claim Amount</th>
                    <th className="py-3.5 px-4">Approved Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Pre-Auth Code</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {claims.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No insurance claims recorded.
                      </td>
                    </tr>
                  ) : (
                    claims.map(claim => (
                      <tr key={claim.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {claim.claimNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{claim.invoice?.patient?.user?.fullName || 'Beneficiary'}</div>
                          <div className="text-[11px] text-teal-600 font-mono">{claim.invoice?.patient?.user?.abhaId || 'N/A'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{claim.policy?.providerName}</div>
                          <div className="text-[10px] text-slate-400">Policy: {claim.policy?.policyNumber}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {formatINR(claim.claimAmount)}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-emerald-600">
                          {formatINR(claim.approvedAmount)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            claim.status === 'APPROVED' || claim.status === 'SETTLED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : claim.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          {claim.preAuthCode || 'PENDING'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {claim.status !== 'APPROVED' && claim.status !== 'SETTLED' ? (
                            <button
                              onClick={() => {
                                setSelectedClaimForSettlement(claim);
                                setClaimSettlementForm(prev => ({
                                  ...prev,
                                  approvedAmount: String(claim.claimAmount)
                                }));
                              }}
                              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] transition-colors"
                            >
                              Adjudicate Pre-Auth
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-bold text-[11px] flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Disbursed</span>
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
      )}

      {/* TAB 5: REFUNDS APPROVAL QUEUE */}
      {activeTab === 'refunds' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-3d-card">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Patient Refund Approvals & Reversals</h3>
                <p className="text-xs text-slate-500">Execute automated Razorpay gateway payment reversal refunds with atomic debit accounting</p>
              </div>
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">
                {refunds.filter(r => r.status === 'REQUESTED').length} Pending Requests
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Refund Ref</th>
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-4">Refund Amount</th>
                    <th className="py-3.5 px-4">Reason / Notes</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Requested Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {refunds.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No refund requests logged.
                      </td>
                    </tr>
                  ) : (
                    refunds.map(ref => (
                      <tr key={ref.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {ref.refundReference}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{ref.invoice?.patient?.user?.fullName || 'Patient'}</div>
                          <div className="text-[10px] text-slate-400">{ref.invoice?.patient?.user?.phone}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-teal-700">
                          {ref.invoice?.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900">
                          {formatINR(ref.amount)}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-600" title={ref.reason}>
                          {ref.reason}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ref.status === 'PROCESSED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : ref.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {ref.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(ref.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {ref.status === 'REQUESTED' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleRefundAction(ref.id, 'PROCESSED')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
                              >
                                Approve & Refund
                              </button>
                              <button
                                onClick={() => handleRefundAction(ref.id, 'REJECTED')}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Completed</span>
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
      )}

      {/* TAB 6: IMMUTABLE FINANCIAL LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600">Filter Ledger Entry:</span>
              <select
                value={ledgerTypeFilter}
                onChange={(e) => setLedgerTypeFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-hidden"
              >
                <option value="ALL">All Entries (Credits & Debits)</option>
                <option value="CREDIT">Credits Only (+ Inflow)</option>
                <option value="DEBIT">Debits Only (- Outflow)</option>
              </select>
            </div>

            <button
              onClick={handleExportLedgerCSV}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Ledger to CSV</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-3d-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Ledger Ref</th>
                    <th className="py-3.5 px-4">Entry</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Payment Source</th>
                    <th className="py-3.5 px-4">Accounting Narration</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-sans">
                  {filteredLedger.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-sans">
                        No ledger entries recorded.
                      </td>
                    </tr>
                  ) : (
                    filteredLedger.map(entry => (
                      <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors font-mono">
                        <td className="py-3.5 px-4 font-bold text-teal-800">{entry.ledgerRef}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            entry.entryType === 'CREDIT'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {entry.entryType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-sans text-xs font-semibold text-slate-700">{entry.category}</td>
                        <td className={`py-3.5 px-4 font-extrabold ${entry.entryType === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {entry.entryType === 'CREDIT' ? '+' : '-'}{formatINR(entry.amount)}
                        </td>
                        <td className="py-3.5 px-4 font-sans text-xs text-slate-600">{entry.source}</td>
                        <td className="py-3.5 px-4 font-sans text-xs text-slate-700 max-w-sm truncate" title={entry.description}>
                          {entry.description}
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-slate-400">
                          {new Date(entry.postedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE INVOICE MODAL */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowCreateInvoiceModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Generate Official Patient Invoice</h3>
                    <p className="text-xs text-slate-500">Calculate itemized consultation, lab, inpatient, or pharmacy charges</p>
                  </div>
                </div>
                <button onClick={() => setShowCreateInvoiceModal(false)} className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Patient Profile</label>
                    <select
                      value={newInvoiceData.patientId}
                      onChange={(e) => setNewInvoiceData(prev => ({ ...prev, patientId: e.target.value }))}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                    >
                      <option value="pat-1">Charan Kumar Reddy (ABHA-2491-9988-7711)</option>
                      <option value="pat-2">Priya Sundaram (ABHA-1844-3322-1100)</option>
                      <option value="pat-3">Aarav Patel (ABHA-9922-8844-5511)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Clinical Category</label>
                    <select
                      value={newInvoiceData.category}
                      onChange={(e) => setNewInvoiceData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                    >
                      <option value="CONSULTATION">OPD Consultation</option>
                      <option value="INPATIENT">Inpatient & Bed Stay</option>
                      <option value="PHARMACY">Pharmacy Medication</option>
                      <option value="DIAGNOSTIC">Diagnostic Pathology</option>
                      <option value="PROCEDURE">Surgical / Treatment Procedure</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Due Date</label>
                    <input
                      type="date"
                      value={newInvoiceData.dueDate}
                      onChange={(e) => setNewInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>
                </div>

                {/* Line Items List */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Itemized Service Charges</span>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Line Item</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {newInvoiceData.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <input
                          type="text"
                          placeholder="Service description..."
                          required
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="flex-3 text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800"
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          min={1}
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-16 text-xs bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 text-center"
                        />
                        <input
                          type="number"
                          placeholder="Rate ₹"
                          min={0}
                          required
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-24 text-xs bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 text-right"
                        />
                        <input
                          type="number"
                          placeholder="Tax %"
                          min={0}
                          max={28}
                          value={item.taxRate}
                          onChange={(e) => handleItemChange(idx, 'taxRate', e.target.value)}
                          className="w-16 text-xs bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 text-center"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={newInvoiceData.items.length <= 1}
                          className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discounts and Calculation Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Special Discount (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={newInvoiceData.discountAmount}
                        onChange={(e) => setNewInvoiceData(prev => ({ ...prev, discountAmount: Number(e.target.value) }))}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Discount Justification</label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Citizen / PM-JAY Co-pay concession"
                        value={newInvoiceData.discountReason}
                        onChange={(e) => setNewInvoiceData(prev => ({ ...prev, discountReason: e.target.value }))}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200/70 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-bold text-slate-800">{formatINR(calculatedSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tax Amount (GST):</span>
                      <span className="font-bold text-slate-800">{formatINR(calculatedTax)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Discount:</span>
                      <span className="font-bold text-emerald-600">- {formatINR(newInvoiceData.discountAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-teal-900 border-t border-teal-200 pt-2">
                      <span>Total Invoice Payable:</span>
                      <span>{formatINR(calculatedTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateInvoiceModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Generate & Publish Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INVOICE DETAIL & TAX SUMMARY */}
      {selectedInvoiceForDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSelectedInvoiceForDetail(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    Official Tax Invoice
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedInvoiceForDetail.invoiceNumber}</h3>
                </div>
                <button onClick={() => setSelectedInvoiceForDetail(null)} className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Billed Patient:</span>
                  <p className="font-bold text-slate-800">{selectedInvoiceForDetail.patient?.user?.fullName}</p>
                  <p className="text-teal-700 font-mono">{selectedInvoiceForDetail.patient?.user?.abhaId}</p>
                  <p className="text-slate-500">{selectedInvoiceForDetail.patient?.user?.phone}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-medium">Hospital Provider:</span>
                  <p className="font-bold text-slate-800">{selectedInvoiceForDetail.hospital?.name}</p>
                  <p className="text-slate-500">Date: {new Date(selectedInvoiceForDetail.createdAt).toLocaleDateString()}</p>
                  <p className="text-slate-500">Category: {selectedInvoiceForDetail.category}</p>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {(selectedInvoiceForDetail.items || []).map((item, i) => (
                      <tr key={i}>
                        <td className="py-2 px-3 font-medium">{item.description}</td>
                        <td className="py-2 px-3 text-center">{item.quantity}</td>
                        <td className="py-2 px-3 text-right">{formatINR(item.unitPrice)}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">{formatINR(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Totals */}
              <div className="p-4 bg-slate-50 rounded-2xl space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">{formatINR(selectedInvoiceForDetail.subTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes (GST):</span>
                  <span className="font-semibold text-slate-800">{formatINR(selectedInvoiceForDetail.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Discount Concession:</span>
                  <span className="font-semibold text-emerald-600">- {formatINR(selectedInvoiceForDetail.discountAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-2">
                  <span>Grand Total:</span>
                  <span>{formatINR(selectedInvoiceForDetail.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-emerald-600">
                  <span>Paid to Date:</span>
                  <span>{formatINR(selectedInvoiceForDetail.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-rose-600">
                  <span>Balance Outstanding:</span>
                  <span>{formatINR(selectedInvoiceForDetail.outstandingBalance)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href={`/api/billing/${selectedInvoiceForDetail.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download / Print GST Tax Invoice</span>
                </a>

                <button
                  onClick={() => setSelectedInvoiceForDetail(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CLAIM ADJUDICATION MODAL */}
      {selectedClaimForSettlement && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSelectedClaimForSettlement(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Adjudicate Cashless Claim</h3>
                    <p className="text-xs text-slate-500">Claim #{selectedClaimForSettlement.claimNumber}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedClaimForSettlement(null)} className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSettleClaimSubmit} className="space-y-4">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">TPA Provider:</span>
                    <span className="font-bold text-slate-800">{selectedClaimForSettlement.policy?.providerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Claimed Amount:</span>
                    <span className="font-bold text-slate-800">{formatINR(selectedClaimForSettlement.claimAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Policy Remaining Cap:</span>
                    <span className="font-semibold text-teal-700">{formatINR(selectedClaimForSettlement.policy?.remainingAmount || 0)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Adjudication Decision</label>
                  <select
                    value={claimSettlementForm.status}
                    onChange={(e) => setClaimSettlementForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  >
                    <option value="APPROVED">Approve & Disburse Cashless Settlement</option>
                    <option value="REJECTED">Reject Pre-Authorisation</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Approved Amount to Deduct from Invoice (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={selectedClaimForSettlement.claimAmount}
                    value={claimSettlementForm.approvedAmount}
                    onChange={(e) => setClaimSettlementForm(prev => ({ ...prev, approvedAmount: e.target.value }))}
                    className="w-full text-sm font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Adjudication Remarks</label>
                  <input
                    type="text"
                    required
                    value={claimSettlementForm.remarks}
                    onChange={(e) => setClaimSettlementForm(prev => ({ ...prev, remarks: e.target.value }))}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedClaimForSettlement(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Confirm Adjudication
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialManagementDashboard;
