import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TiltCard3D } from '../../components/common/TiltCard3D';
import { 
  BedDouble, 
  CreditCard, 
  FileText, 
  Calendar, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Clock, 
  HeartPulse, 
  X,
  Receipt
} from 'lucide-react';

interface Admission {
  id: string;
  admissionNumber: string;
  admissionType: string;
  admissionStatus: string;
  priority: string;
  diagnosis: string;
  clinicalNotes?: string;
  department: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  actualDischargeDate?: string;
  dailyProgressNotes?: string;
  doctor?: {
    user: {
      fullName: string;
      phone: string;
    };
  };
  bed?: {
    bedNumber: string;
    dailyTariff: number;
    ward: {
      name: string;
      wardType: string;
      floor: string;
    };
    room: {
      roomNumber: string;
      roomType: string;
    };
  };
  inpatientInvoice?: {
    id: string;
    invoiceNumber: string;
    bedCharges: number;
    roomCharges: number;
    icuCharges: number;
    nursingCharges: number;
    doctorCharges: number;
    labCharges: number;
    pharmacyCharges: number;
    procedureCharges: number;
    totalAmount: number;
    insuranceClaimAmount: number;
    paidAmount: number;
    outstandingBalance: number;
    status: string;
  };
  discharge?: {
    dischargeDate: string;
    dischargeType: string;
    finalDiagnosis: string;
    treatmentSummary: string;
    prescribedMedicines?: string;
    followUpInstructions?: string;
    authorizedBy: string;
  };
}

export const PatientAdmissionsPage: React.FC = () => {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState('UPI');

  const fetchPatientAdmissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/beds/admissions');
      if (res.success) {
        setAdmissions(res.admissions);
      }
    } catch (err) {
      console.error('Error fetching patient admissions:', err);
      setMessage({ type: 'error', text: 'Failed to retrieve inpatient records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientAdmissions();
  }, []);

  const handleMakePayment = async () => {
    if (!selectedAdmission || payAmount <= 0) {
      setMessage({ type: 'error', text: 'Enter a valid payment amount.' });
      return;
    }

    try {
      const res = await api.post(`/beds/billing/${selectedAdmission.id}/payment`, {
        amount: payAmount,
        paymentMethod: payMethod,
        referenceNumber: `UPI-BHC-${Date.now()}`
      });

      if (res.success) {
        setMessage({ type: 'success', text: `Payment of ₹${payAmount} processed successfully! Receipt generated.` });
        setShowPaymentModal(false);
        fetchPatientAdmissions();
      } else {
        setMessage({ type: 'error', text: res.message || 'Payment processing failed.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Payment failed.' });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Deck */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-3d-float border border-teal-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-500/25 text-teal-200 border border-teal-400/30">
            Patient Health Records
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2">Inpatient Stay & Bed Allocations</h1>
          <p className="text-xs text-slate-300 mt-1">
            Track current hospital admission, allocated ward & bed number, daily clinical progress notes, and inpatient bill receipts.
          </p>
        </div>

        <button
          onClick={fetchPatientAdmissions}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center justify-between border ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <span className="text-sm font-medium">{message.text}</span>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Admissions List */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-20 text-center text-slate-500">Retrieving inpatient history...</div>
        ) : admissions.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
            <BedDouble className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No Inpatient Admissions Found</h3>
            <p className="text-xs text-slate-500">You do not have any active or past hospital bed admissions recorded.</p>
          </div>
        ) : (
          admissions.map((adm) => {
            const isCurrent = adm.admissionStatus === 'ADMITTED';
            const inv = adm.inpatientInvoice;

            return (
              <TiltCard3D key={adm.id} maxTilt={4} scale={1.01} className="rounded-2xl">
                <div className={`bg-white rounded-2xl border p-6 space-y-6 shadow-3d-card ${
                  isCurrent ? 'border-teal-300 ring-2 ring-teal-500/20' : 'border-slate-200'
                }`}>
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-black text-slate-900">{adm.admissionNumber}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                          isCurrent ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {adm.admissionStatus}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">({adm.admissionType} Intake)</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Primary Diagnosis: <strong className="text-slate-900">{adm.diagnosis}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Admission Date</span>
                      <span className="text-sm font-bold text-slate-800">
                        {new Date(adm.admissionDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Bed & Room Location Badge */}
                  {adm.bed ? (
                    <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-teal-600 text-white rounded-xl shadow-sm">
                          <BedDouble className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 block">Allocated Bed Position</span>
                          <span className="text-lg font-extrabold text-slate-900">Bed {adm.bed.bedNumber}</span>
                          <span className="text-xs text-teal-900 block font-medium">
                            {adm.bed.ward.name} • Room {adm.bed.room.roomNumber} ({adm.bed.ward.floor})
                          </span>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <span className="text-xs text-slate-500 block">Attending Consultant</span>
                        <span className="text-sm font-bold text-slate-900">
                          {adm.doctor?.user.fullName || 'Department Senior Consultant'}
                        </span>
                        <span className="text-xs text-teal-700 block font-semibold">
                          ₹{adm.bed.dailyTariff} / day tariff
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 rounded-xl text-amber-800 text-xs">
                      Admission requested. Floor staff is preparing bed assignment.
                    </div>
                  )}

                  {/* Daily Progress Notes */}
                  {adm.dailyProgressNotes && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Physician Daily Ward Rounds & Clinical Notes</h4>
                      <div className="space-y-2">
                        {(() => {
                          try {
                            const notes = JSON.parse(adm.dailyProgressNotes);
                            return notes.map((n: any, idx: number) => (
                              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                                <div className="flex justify-between text-[11px] text-slate-500">
                                  <strong className="text-slate-800">{n.doctor || n.author || 'Attending Doctor'}</strong>
                                  <span>{n.date}</span>
                                </div>
                                <p className="text-slate-700">{n.note}</p>
                              </div>
                            ));
                          } catch (e) {
                            return <p className="text-xs text-slate-600">{adm.dailyProgressNotes}</p>;
                          }
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Inpatient Billing Summary */}
                  {inv && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-indigo-600" />
                          <span className="font-bold text-sm text-slate-900">Inpatient Invoice #{inv.invoiceNumber}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 block">Bed Charges:</span>
                          <span className="font-bold text-slate-800">₹{inv.bedCharges}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">ICU / Nursing:</span>
                          <span className="font-bold text-slate-800">₹{inv.icuCharges + inv.nursingCharges}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Procedures & Labs:</span>
                          <span className="font-bold text-slate-800">₹{inv.procedureCharges + inv.labCharges + inv.pharmacyCharges}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Total Hospital Bill:</span>
                          <span className="font-bold text-indigo-700 text-sm">₹{inv.totalAmount}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-200 text-xs">
                        <div className="text-slate-600">
                          Insurance Covered: <strong className="text-emerald-700">₹{inv.insuranceClaimAmount}</strong> • Paid: <strong>₹{inv.paidAmount}</strong>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs text-slate-500 block">Outstanding Balance</span>
                            <span className="text-base font-black text-rose-600">₹{inv.outstandingBalance}</span>
                          </div>

                          {inv.outstandingBalance > 0 && (
                            <button
                              onClick={() => {
                                setSelectedAdmission(adm);
                                setPayAmount(inv.outstandingBalance);
                                setShowPaymentModal(true);
                              }}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-3d-button flex items-center gap-1.5"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay Balance</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Discharge Summary if discharged */}
                  {adm.discharge && (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900 text-sm">Official Discharge Summary</span>
                        <span className="text-emerald-700 text-[11px]">
                          Discharged on: {new Date(adm.discharge.dischargeDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-emerald-800"><strong>Final Diagnosis:</strong> {adm.discharge.finalDiagnosis}</p>
                      <p className="text-slate-700"><strong>Course Summary:</strong> {adm.discharge.treatmentSummary}</p>
                      {adm.discharge.followUpInstructions && (
                        <p className="text-slate-700"><strong>Instructions:</strong> {adm.discharge.followUpInstructions}</p>
                      )}
                      <span className="text-[10px] text-slate-500 block pt-1 border-t border-emerald-200/60">
                        Authorized Physician: {adm.discharge.authorizedBy}
                      </span>
                    </div>
                  )}
                </div>
              </TiltCard3D>
            );
          })
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedAdmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Inpatient Bill Payment</h3>
                <p className="text-xs text-slate-500">Secure digital settlement & receipt generation</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-500 block">Admission Ref:</span>
                <span className="font-bold text-slate-900 text-sm">{selectedAdmission.admissionNumber}</span>
                <p className="text-slate-600">Bed: {selectedAdmission.bed?.bedNumber} ({selectedAdmission.bed?.ward.name})</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Amount (₹ INR):</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Gateway / Method:</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="NETBANKING">Net Banking (NEFT/RTGS)</option>
                  <option value="PMJAY">Ayushman Bharat (PM-JAY Cashless Voucher)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setShowPaymentModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
              <button onClick={handleMakePayment} className="px-5 py-2.5 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-3d-button">
                Authorize Payment of ₹{payAmount}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAdmissionsPage;
