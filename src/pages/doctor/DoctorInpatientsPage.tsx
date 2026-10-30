import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TiltCard3D } from '../../components/common/TiltCard3D';
import { 
  Users, 
  Stethoscope, 
  BedDouble, 
  FileText, 
  ArrowRightLeft, 
  LogOut, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  HeartPulse, 
  Clock,
  Sparkles
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
  dailyProgressNotes?: string;
  patient: {
    id: string;
    bloodGroup?: string;
    user: {
      fullName: string;
      phone: string;
      email: string;
    };
  };
  bed?: {
    id: string;
    bedNumber: string;
    dailyTariff: number;
    ward: {
      name: string;
      wardType: string;
      floor: string;
    };
    room: {
      roomNumber: string;
    };
  };
}

export const DoctorInpatientsPage: React.FC = () => {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [availableBeds, setAvailableBeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active Modals
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);

  // Note form
  const [progressNote, setProgressNote] = useState('');

  // Transfer form
  const [targetBedId, setTargetBedId] = useState('');
  const [transferReason, setTransferReason] = useState('');

  // Discharge form
  const [dischargeDiagnosis, setDischargeDiagnosis] = useState('');
  const [dischargeSummary, setDischargeSummary] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');

  const fetchDoctorInpatients = async () => {
    setLoading(true);
    try {
      const [admRes, bedsRes] = await Promise.all([
        api.get('/beds/admissions?status=ADMITTED'),
        api.get('/beds?status=AVAILABLE')
      ]);

      if (admRes.success) setAdmissions(admRes.admissions);
      if (bedsRes.success) setAvailableBeds(bedsRes.beds);
    } catch (err) {
      console.error('Error fetching doctor inpatients:', err);
      setMessage({ type: 'error', text: 'Failed to load admitted patients.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorInpatients();
  }, []);

  const handleAddProgressNote = async () => {
    if (!selectedAdmission || !progressNote) {
      setMessage({ type: 'error', text: 'Note content cannot be empty.' });
      return;
    }

    try {
      const res = await api.post(`/beds/admissions/${selectedAdmission.id}/progress-notes`, {
        note: progressNote
      });

      if (res.success) {
        setMessage({ type: 'success', text: 'Daily clinical progress note recorded successfully.' });
        setShowNoteModal(false);
        setProgressNote('');
        fetchDoctorInpatients();
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to record note.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error recording progress note.' });
    }
  };

  const handleExecuteTransfer = async () => {
    if (!selectedAdmission || !targetBedId || !transferReason) {
      setMessage({ type: 'error', text: 'Target bed and clinical reason required.' });
      return;
    }

    try {
      const res = await api.post('/beds/transfers', {
        admissionId: selectedAdmission.id,
        toBedId: targetBedId,
        transferReason,
        doctorApproval: 'Consulting Physician Order'
      });

      if (res.success) {
        setMessage({ type: 'success', text: res.message || 'Transfer order executed.' });
        setShowTransferModal(false);
        setTargetBedId('');
        setTransferReason('');
        fetchDoctorInpatients();
      } else {
        setMessage({ type: 'error', text: res.message || 'Transfer failed.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Transfer failed.' });
    }
  };

  const handleExecuteDischarge = async () => {
    if (!selectedAdmission || !dischargeDiagnosis || !dischargeSummary) {
      setMessage({ type: 'error', text: 'Diagnosis and clinical summary are required.' });
      return;
    }

    try {
      const res = await api.post('/beds/discharges', {
        admissionId: selectedAdmission.id,
        dischargeType: 'NORMAL',
        finalDiagnosis: dischargeDiagnosis,
        treatmentSummary: dischargeSummary,
        followUpInstructions: followUpNotes,
        billingCleared: true
      });

      if (res.success) {
        setMessage({ type: 'success', text: res.message || 'Patient discharged.' });
        setShowDischargeModal(false);
        fetchDoctorInpatients();
      } else {
        setMessage({ type: 'error', text: res.message || 'Discharge failed.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error executing discharge.' });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Deck */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-3d-float border border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/25 text-blue-200 border border-blue-400/30">
            Physician Ward Rounds & Inpatient Desk
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2">Inpatients & Clinical Rounds</h1>
          <p className="text-xs text-slate-300 mt-1">
            Review active inpatients under your clinical charge, append daily progress notes, order bed step-down transfers, and author discharge summaries.
          </p>
        </div>

        <button
          onClick={fetchDoctorInpatients}
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

      {/* Inpatients Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Current Inpatients ({admissions.length})</h3>
          <span className="text-xs text-slate-500">Live Ward Roster</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading admitted patient profiles...</div>
        ) : admissions.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No active inpatients currently assigned to your care.
          </div>
        ) : (
          admissions.map((adm) => (
            <TiltCard3D key={adm.id} maxTilt={4} scale={1.01} className="rounded-2xl">
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-3d-card space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-900">{adm.patient.user.fullName}</span>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {adm.admissionNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        adm.priority === 'EMERGENCY' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {adm.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Primary Diagnosis: <strong className="text-slate-900">{adm.diagnosis}</strong>
                    </p>
                  </div>

                  {adm.bed && (
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 block bg-blue-50 text-blue-700 px-3 py-1 rounded-xl">
                        Bed {adm.bed.bedNumber} ({adm.bed.ward.name})
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Room {adm.bed.room.roomNumber} • {adm.bed.ward.floor}
                      </span>
                    </div>
                  )}
                </div>

                {/* Clinical Notes & Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinical Progress Log</h4>
                    <button
                      onClick={() => {
                        setSelectedAdmission(adm);
                        setShowNoteModal(true);
                      }}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Progress Note</span>
                    </button>
                  </div>

                  {adm.dailyProgressNotes ? (
                    <div className="space-y-2">
                      {(() => {
                        try {
                          const notes = JSON.parse(adm.dailyProgressNotes);
                          return notes.slice(0, 3).map((n: any, idx: number) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                              <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                                <span>{n.author || n.doctor || 'Physician'}</span>
                                <span>{n.date}</span>
                              </div>
                              <p className="text-slate-800">{n.note}</p>
                            </div>
                          ));
                        } catch (e) {
                          return <p className="text-xs text-slate-600">{adm.dailyProgressNotes}</p>;
                        }
                      })()}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No daily round notes recorded yet.</p>
                  )}
                </div>

                {/* Actions Bar */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setSelectedAdmission(adm);
                      setShowTransferModal(true);
                    }}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Order Bed Transfer / Step-down</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedAdmission(adm);
                      setDischargeDiagnosis(adm.diagnosis);
                      setShowDischargeModal(true);
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-3d-button flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Initiate Discharge Order</span>
                  </button>
                </div>
              </div>
            </TiltCard3D>
          ))
        )}
      </div>

      {/* Progress Note Modal */}
      {showNoteModal && selectedAdmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Ward Round Clinical Note</h3>
                <p className="text-xs text-slate-500">Patient: {selectedAdmission.patient.user.fullName}</p>
              </div>
              <button onClick={() => setShowNoteModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Observation & Plan:</label>
              <textarea
                rows={4}
                value={progressNote}
                onChange={(e) => setProgressNote(e.target.value)}
                placeholder="Vitals stable, SpO2 98% on room air, oral fluids tolerated, wound dressing clean..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setShowNoteModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
              <button onClick={handleAddProgressNote} className="px-5 py-2.5 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-3d-button">
                Save Note to EHR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Order Modal */}
      {showTransferModal && selectedAdmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Order Bed Transfer</h3>
                <p className="text-xs text-slate-500">Move patient to another ward or step-down bed</p>
              </div>
              <button onClick={() => setShowTransferModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Target Bed:</label>
                <select
                  value={targetBedId}
                  onChange={(e) => setTargetBedId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="">-- Choose Target Bed --</option>
                  {availableBeds.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bedNumber} — {b.ward.name} ({b.bedCategory})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Transfer Order Reason:</label>
                <textarea
                  rows={3}
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="e.g. ICU step-down to Semi-Private room; hemodynamic stability verified..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setShowTransferModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
              <button onClick={handleExecuteTransfer} className="px-5 py-2.5 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-3d-button">
                Sign Transfer Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discharge Order Modal */}
      {showDischargeModal && selectedAdmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Author Discharge Order</h3>
                <p className="text-xs text-slate-500">Clinical summary and release authorization</p>
              </div>
              <button onClick={() => setShowDischargeModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Final Diagnosis:</label>
                <input
                  type="text"
                  value={dischargeDiagnosis}
                  onChange={(e) => setDischargeDiagnosis(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Treatment & Clinical Summary:</label>
                <textarea
                  rows={3}
                  value={dischargeSummary}
                  onChange={(e) => setDischargeSummary(e.target.value)}
                  placeholder="Patient recovered satisfactorily..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Follow-up Instructions:</label>
                <textarea
                  rows={2}
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="Review after 1 week with fasting blood sugar..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setShowDischargeModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
              <button onClick={handleExecuteDischarge} className="px-5 py-2.5 text-xs font-bold bg-rose-600 text-white rounded-xl shadow-3d-button">
                Sign & Authorize Discharge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorInpatientsPage;
