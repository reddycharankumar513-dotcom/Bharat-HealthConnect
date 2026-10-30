import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TiltCard3D } from '../../components/common/TiltCard3D';
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
  QrCode, 
  Wallet, 
  Building2,
  FileText,
  RotateCcw
} from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  serviceCategory: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
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
  items: InvoiceItem[];
  hospital?: {
    name: string;
    city: string;
  };
  doctor?: {
    user: {
      fullName: string;
    };
  };
  payments?: Array<{
    id: string;
    paymentReference: string;
    amount: number;
    paymentMethod: string;
    status: string;
    paidAt: string;
  }>;
}

interface InsurancePolicy {
  id: string;
  providerName: string;
  policyNumber: string;
  policyHolderName: string;
  coverageAmount: number;
  remainingAmount: number;
  coPayPercentage: number;
  validTill: string;
  status: string;
}

interface InsuranceClaim {
  id: string;
  claimNumber: string;
  claimAmount: number;
  approvedAmount: number;
  status: string;
  createdAt: string;
  policy: {
    providerName: string;
  };
  invoice: {
    invoiceNumber: string;
  };
}

export const PatientPaymentsPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'INVOICES' | 'INSURANCE' | 'HISTORY'>('INVOICES');

  // Checkout modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY_UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Claim modal
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimPolicyId, setClaimPolicyId] = useState('');
  const [claimAmount, setClaimAmount] = useState<number>(0);
  const [claimRemarks, setClaimRemarks] = useState('');

  // Refund request modal
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundPaymentId, setRefundPaymentId] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const [invRes, polRes, clmRes] = await Promise.all([
        api.get('/billing'),
        api.get('/insurance/policies'),
        api.get('/insurance/claims')
      ]);

      if (invRes.success) setInvoices(invRes.invoices);
      if (polRes.success) {
        setPolicies(polRes.policies);
        if (polRes.policies.length > 0 && !claimPolicyId) {
          setClaimPolicyId(polRes.policies[0].id);
        }
      }
      if (clmRes.success) setClaims(clmRes.claims);
    } catch (err) {
      console.error('Error fetching financial records:', err);
      setMessage({ type: 'error', text: 'Failed to retrieve billing and insurance records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  // Aggregated totals
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.outstandingBalance, 0);
  const totalInsuranceCovered = invoices.reduce((sum, inv) => sum + inv.insuranceCovered, 0);

  // Razorpay Checkout Execution
  const handleInitiatePayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.outstandingBalance);
    setShowCheckoutModal(true);
  };

  const handleExecutePayment = async () => {
    if (!selectedInvoice || paymentAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid payment amount.' });
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Step 1: Create Order on Backend
      const orderRes = await api.post('/payments/create-order', {
        invoiceId: selectedInvoice.id,
        amount: paymentAmount,
        idempotencyKey: `IDEMP-${Date.now()}-${selectedInvoice.id}`
      });

      if (!orderRes.success) {
        setMessage({ type: 'error', text: orderRes.message || 'Order creation failed.' });
        setIsProcessingPayment(false);
        return;
      }

      const { id: orderId } = orderRes.order;

      // Step 2: Simulate Razorpay Gateway client response & HMAC Signature
      const mockPaymentId = `pay_${Date.now()}`;
      const mockSignature = `sig_mock_verified_${Date.now()}`;

      // Step 3: Verify Signature on Backend
      const verifyRes = await api.post('/payments/verify', {
        invoiceId: selectedInvoice.id,
        razorpayOrderId: orderId,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: mockSignature,
        paymentMethod
      });

      if (verifyRes.success) {
        setMessage({
          type: 'success',
          text: `Payment of ₹${paymentAmount.toLocaleString('en-IN')} verified & settled! Invoice status updated.`
        });
        setShowCheckoutModal(false);
        setSelectedInvoice(null);
        fetchFinancialData();
      } else {
        setMessage({ type: 'error', text: verifyRes.message || 'Payment signature verification failed.' });
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setMessage({ type: 'error', text: err.message || 'Payment transaction encountered an error.' });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Submit Insurance Claim
  const handleFileClaim = async () => {
    if (!selectedInvoice || !claimPolicyId || claimAmount <= 0) {
      setMessage({ type: 'error', text: 'Policy selection and valid claim amount required.' });
      return;
    }

    try {
      const res = await api.post('/insurance/claims', {
        policyId: claimPolicyId,
        invoiceId: selectedInvoice.id,
        claimAmount,
        remarks: claimRemarks || 'Cashless pre-auth reimbursement request'
      });

      if (res.success) {
        setMessage({
          type: 'success',
          text: `Insurance claim ${res.claim.claimNumber} submitted for TPA pre-authorization.`
        });
        setShowClaimModal(false);
        setClaimRemarks('');
        fetchFinancialData();
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to file claim.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Claim submission error.' });
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* 3D Header Command Deck */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-3d-float border border-teal-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-500/25 text-teal-200 border border-teal-400/30 backdrop-blur-sm">
                National Health Claims Exchange (NHCX)
              </span>
              <span className="text-xs text-teal-300">ABHA Digital Settlement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Patient Billing, Payments & Health Insurance
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Pay OPD consultations, diagnostic lab panels, inpatient bed stays, and pharmacy orders securely via Razorpay UPI, cards, net banking, or Ayushman Bharat PM-JAY.
            </p>
          </div>

          <button
            onClick={fetchFinancialData}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 self-start md:self-auto transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {message && (
        <div className={`p-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-3 text-sm font-medium">
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:bg-black/5 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TiltCard3D maxTilt={6} scale={1.02} className="rounded-2xl">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3d-card">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Total Billed</span>
            <div className="text-2xl font-black text-slate-900 mt-2">₹{totalBilled.toLocaleString('en-IN')}</div>
            <span className="text-[11px] text-slate-500">{invoices.length} Registered Invoices</span>
          </div>
        </TiltCard3D>

        <TiltCard3D maxTilt={6} scale={1.02} className="rounded-2xl">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3d-card">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Paid & Settled</span>
            <div className="text-2xl font-black text-emerald-600 mt-2">₹{totalPaid.toLocaleString('en-IN')}</div>
            <span className="text-[11px] text-emerald-700 font-semibold">Instant Razorpay UPI & Cards</span>
          </div>
        </TiltCard3D>

        <TiltCard3D maxTilt={6} scale={1.02} className="rounded-2xl">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3d-card">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Insurance Cashless</span>
            <div className="text-2xl font-black text-teal-700 mt-2">₹{totalInsuranceCovered.toLocaleString('en-IN')}</div>
            <span className="text-[11px] text-teal-700 font-semibold">TPA Direct Approvals</span>
          </div>
        </TiltCard3D>

        <TiltCard3D maxTilt={6} scale={1.02} className="rounded-2xl">
          <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-3d-card bg-rose-50/20">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-500 block">Outstanding Due</span>
            <div className="text-2xl font-black text-rose-600 mt-2">₹{totalOutstanding.toLocaleString('en-IN')}</div>
            <span className="text-[11px] text-rose-700 font-medium">Pending Settlement</span>
          </div>
        </TiltCard3D>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-sm font-bold">
        <button
          onClick={() => setActiveTab('INVOICES')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'INVOICES'
              ? 'border-teal-600 text-teal-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>My Invoices ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('INSURANCE')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'INSURANCE'
              ? 'border-teal-600 text-teal-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Health Insurance Policies ({policies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'HISTORY'
              ? 'border-teal-600 text-teal-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Claims & Refund Tracker</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: INVOICES LIST & ITEMIZATION */}
      {/* ============================================================== */}
      {activeTab === 'INVOICES' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center text-slate-500">Synchronizing billing records...</div>
          ) : invoices.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
              <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Invoices on File</h3>
              <p className="text-xs text-slate-500">Your hospital consultations, pharmacy orders, and diagnostic tests will generate invoices here.</p>
            </div>
          ) : (
            invoices.map((inv) => {
              const isPaid = inv.status === 'PAID';
              const isPartiallyPaid = inv.status === 'PARTIALLY_PAID';

              return (
                <TiltCard3D key={inv.id} maxTilt={3} scale={1.01} className="rounded-2xl">
                  <div className={`p-6 bg-white rounded-2xl border shadow-3d-card space-y-5 transition-all ${
                    isPaid ? 'border-emerald-200' : isPartiallyPaid ? 'border-amber-200' : 'border-slate-200'
                  }`}>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg font-black text-slate-900">{inv.invoiceNumber}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                            isPaid ? 'bg-emerald-100 text-emerald-800' :
                            isPartiallyPaid ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {inv.status}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {inv.category}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 block mt-1">
                          Hospital: {inv.hospital?.name || 'AIIMS Hyderabad Super Speciality'} • Billed: {new Date(inv.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Total Amount</span>
                          <span className="text-xl font-extrabold text-slate-900">₹{inv.totalAmount.toLocaleString('en-IN')}</span>
                        </div>

                        {inv.outstandingBalance > 0 && (
                          <button
                            onClick={() => handleInitiatePayment(inv)}
                            className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-3d-button flex items-center gap-2"
                          >
                            <Wallet className="w-4 h-4" />
                            <span>Pay Balance (₹{inv.outstandingBalance})</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Itemized Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold">
                          <tr>
                            <th className="p-2.5">Itemized Service Description</th>
                            <th className="p-2.5">Category</th>
                            <th className="p-2.5 text-center">Qty</th>
                            <th className="p-2.5 text-right">Unit Price</th>
                            <th className="p-2.5 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {inv.items.map((it) => (
                            <tr key={it.id}>
                              <td className="p-2.5 font-semibold text-slate-800">{it.description}</td>
                              <td className="p-2.5 text-slate-500">{it.serviceCategory}</td>
                              <td className="p-2.5 text-center">{it.quantity}</td>
                              <td className="p-2.5 text-right text-slate-600">₹{it.unitPrice.toLocaleString('en-IN')}</td>
                              <td className="p-2.5 text-right font-bold text-slate-900">₹{it.totalPrice.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Breakdown & Actions Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
                      <div className="text-slate-600 space-x-3">
                        <span>Paid: <strong className="text-emerald-700">₹{inv.paidAmount.toLocaleString('en-IN')}</strong></span>
                        {inv.insuranceCovered > 0 && (
                          <span>Insurance: <strong className="text-teal-700">₹{inv.insuranceCovered.toLocaleString('en-IN')}</strong></span>
                        )}
                        <span>Balance: <strong className="text-rose-600">₹{inv.outstandingBalance.toLocaleString('en-IN')}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`/api/billing/${inv.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Tax Invoice (PDF)</span>
                        </a>

                        {inv.outstandingBalance > 0 && policies.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setClaimAmount(inv.outstandingBalance);
                              setShowClaimModal(true);
                            }}
                            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Claim Insurance</span>
                          </button>
                        )}

                        {inv.paidAmount > 0 && inv.payments?.[0] && (
                          <a
                            href={`/api/payments/${inv.payments[0].id}/receipt`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Payment Receipt</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </TiltCard3D>
              );
            })
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: HEALTH INSURANCE POLICIES */}
      {/* ============================================================== */}
      {activeTab === 'INSURANCE' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Linked Insurance & National Health Schemes</h3>
            <span className="text-xs text-slate-500">Instant Cashless Verification via ABHA ID</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {policies.map((pol) => (
              <TiltCard3D key={pol.id} maxTilt={6} scale={1.01} className="rounded-2xl">
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-3d-card space-y-4 flex flex-col justify-between h-full">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                        {pol.status}
                      </span>
                      <span className="text-xs text-slate-400">Valid: {new Date(pol.validTill).toLocaleDateString()}</span>
                    </div>

                    <h4 className="font-bold text-base text-slate-900">{pol.providerName}</h4>
                    <p className="font-mono text-xs text-slate-600 font-semibold">{pol.policyNumber}</p>
                    <p className="text-xs text-slate-500">Policy Holder: {pol.policyHolderName}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Coverage:</span>
                      <strong className="text-slate-900">₹{pol.coverageAmount.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Remaining Balance:</span>
                      <strong className="text-emerald-700 font-bold">₹{pol.remainingAmount.toLocaleString('en-IN')}</strong>
                    </div>
                    {pol.coPayPercentage > 0 && (
                      <div className="flex justify-between text-[11px] text-amber-700">
                        <span>Co-Pay:</span>
                        <span>{pol.coPayPercentage}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </TiltCard3D>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CLAIMS & REFUND TRACKER */}
      {/* ============================================================== */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-3d-card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span>Filed Insurance Claims ({claims.length})</span>
            </h3>

            {claims.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No claims filed yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold">
                    <tr>
                      <th className="p-2.5">Claim Ref</th>
                      <th className="p-2.5">Insurance Provider</th>
                      <th className="p-2.5">Invoice</th>
                      <th className="p-2.5">Claim Amount</th>
                      <th className="p-2.5">Approved Amount</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {claims.map((clm) => (
                      <tr key={clm.id}>
                        <td className="p-2.5 font-mono font-bold text-slate-900">{clm.claimNumber}</td>
                        <td className="p-2.5 text-slate-700">{clm.policy.providerName}</td>
                        <td className="p-2.5 text-slate-600">{clm.invoice.invoiceNumber}</td>
                        <td className="p-2.5 font-bold text-slate-900">₹{clm.claimAmount.toLocaleString('en-IN')}</td>
                        <td className="p-2.5 font-bold text-emerald-700">₹{clm.approvedAmount.toLocaleString('en-IN')}</td>
                        <td className="p-2.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            clm.status === 'APPROVED' || clm.status === 'SETTLED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {clm.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: RAZORPAY CHECKOUT */}
      {/* ============================================================== */}
      {showCheckoutModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  ₹
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Razorpay Secure Checkout</h3>
                  <p className="text-xs text-slate-500">256-Bit Encrypted Healthcare Settlement</p>
                </div>
              </div>
              <button onClick={() => setShowCheckoutModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-1 text-slate-700">
                <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Invoice Reference:</span>
                <span className="font-mono font-bold text-sm text-slate-900">{selectedInvoice.invoiceNumber}</span>
                <p className="text-slate-500">Category: {selectedInvoice.category}</p>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-900 text-sm">
                  <span>Outstanding Balance:</span>
                  <span className="text-rose-600">₹{selectedInvoice.outstandingBalance.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount to Pay (₹ INR):</label>
                <input
                  type="number"
                  value={paymentAmount}
                  max={selectedInvoice.outstandingBalance}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Payment Method:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'RAZORPAY_UPI', label: 'UPI (GPay/PhonePe)', icon: '📱' },
                    { id: 'RAZORPAY_CARD', label: 'Credit / Debit Card', icon: '💳' },
                    { id: 'RAZORPAY_NETBANKING', label: 'Net Banking', icon: '🏛️' },
                    { id: 'PMJAY_VOUCHER', label: 'Ayushman PM-JAY', icon: '🇮🇳' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        paymentMethod === m.id
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base">{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl text-[11px] text-blue-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Zero gateway surcharge. Instant digital receipt will be generated automatically.</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleExecutePayment}
                disabled={isProcessingPayment}
                className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-3d-button flex items-center gap-2"
              >
                {isProcessingPayment ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying with Bank...</span>
                  </>
                ) : (
                  <span>Authorize Payment of ₹{paymentAmount.toLocaleString('en-IN')}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: FILE INSURANCE CLAIM */}
      {/* ============================================================== */}
      {showClaimModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">File Cashless Insurance Claim</h3>
                <p className="text-xs text-slate-500">TPA pre-authorization submission</p>
              </div>
              <button onClick={() => setShowClaimModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Invoice:</span>
                <span className="font-bold text-slate-900">{selectedInvoice.invoiceNumber}</span>
                <p className="text-slate-500">Total Billed: ₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Insurance Policy:</label>
                <select
                  value={claimPolicyId}
                  onChange={(e) => setClaimPolicyId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  {policies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.providerName} ({p.policyNumber}) — Bal: ₹{p.remainingAmount}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Claim Amount (₹ INR):</label>
                <input
                  type="number"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks & Pre-Auth Code:</label>
                <textarea
                  rows={2}
                  value={claimRemarks}
                  onChange={(e) => setClaimRemarks(e.target.value)}
                  placeholder="Admission diagnosis, treatment details..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setShowClaimModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
              <button onClick={handleFileClaim} className="px-5 py-2.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-3d-button">
                Submit Claim to TPA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientPaymentsPage;
