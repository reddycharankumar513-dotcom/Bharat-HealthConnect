import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TiltCard3D } from '../../components/common/TiltCard3D';
import { 
  Users, 
  BedDouble, 
  Plus, 
  Calendar, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  RefreshCw, 
  X, 
  Stethoscope, 
  Sparkles,
  ArrowRight
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
  requestedWardType: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  patient: {
    id: string;
    bloodGroup?: string;
    user: {
      fullName: string;
      phone: string;
      email: string;
      abhaId?: string;
    };
  };
  doctor?: {
    user: {
      fullName: string;
    };
  };
  bed?: {
    id: string;
    bedNumber: string;
    dailyTariff: number;
    ward: {
      name: string;
      wardType: string;
    };
    room: {
      roomNumber: string;
    };
  };
}

interface WaitlistEntry {
  id: string;
  patientId: string;
  requestedWardType: string;
  bedCategory: string;
  priority: string;
  isolationRequired: boolean;
  oxygenRequired: boolean;
  ventilatorRequired: boolean;
  status: string;
  waitingSince: string;
  notes?: string;
  patient: {
    user: {
      fullName: string;
      phone: string;
    };
  };
}

export const HospitalAdmissionsPage: React.FC = () => {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [availableBeds, setAvailableBeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [selectedBedId, setSelectedBedId] = useState('');

  // Request Form
  const [patientId, setPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [admissionType, setAdmissionType] = useState('EMERGENCY');
  const [priority, setPriority] = useState('EMERGENCY');
  const [department, setDepartment] = useState('Cardiology');
  const [requestedWard, setRequestedWard] = useState('ICU');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const fetchAdmissionsData = async () => {
    setLoading(true);
    try {
      const [admRes, waitRes, bedsRes] = await Promise.all([
        api.get('/beds/admissions'),
        api.get('/beds/waiting-list'),
        api.get('/beds?status=AVAILABLE')
      ]);

      if (admRes.success) setAdmissions(admRes.admissions);
      if (waitRes.success) setWaitlist(waitRes.list);
      if (bedsRes.success) setAvailableBeds(bedsRes.beds);
    } catch (err) {
      console.error('Error fetching admissions:', err);
      setMessage({ type: 'error', text: 'Failed to load admissions and waitlist.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissionsData();
  }, []);

  const handleCreateAdmissionRequest = async () => {
    if (!diagnosis) {
      setMessage({ type: 'error', text: 'Diagnosis is mandatory for admission.' });
      return;
    }

    try {
      const res = await api.post('/beds/admissions/request', {
        hospitalId: 'hosp-aims-hyd',
        patientId: patientId || 'demo-pt', // Defaults or selected
        admissionType,
        priority,
        department,
        requestedWardType: requestedWard,
        diagnosis,
        clinicalNotes
      });

      if (res.success) {
        setMessage({ type: 'success', text: `Admission request ${res.admission.admissionNumber} created successfully.` });
        setShowRequestModal(false);
        setDiagnosis('');
        setClinicalNotes('');
        fetchAdmissionsData();
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to request admission.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error creating admission.' });
    }
  };

  const handleAllocateBed = async () => {
    if (!selectedAdmission || !selectedBedId) {
      setMessage({ type: 'error', text: 'Please select an available bed.' });
      return;
    }

    try {
      const res = await api.post(`/beds/admissions/${selectedAdmission.id}/allocate`, {
        bedId: selectedBedId,
        notes: 'Assigned via Inpatient Desk'
      });

      if (res.success) {
        setMessage({ type: 'success', text: res.message || 'Bed allocated successfully!' });
        setShowAllocateModal(false);
        setSelectedAdmission(null);
        setSelectedBedId('');
        fetchAdmissionsData();
      } else {
        setMessage({ type: 'error', text: res.message || 'Allocation failed.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Allocation transaction failed.' });
    }
  };

  const filteredAdmissions = admissions.filter(adm => {
    const matchesSearch = search === '' ||
      adm.admissionNumber.toLowerCase().includes(search.toLowerCase()) ||
      adm.patient.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      adm.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
      (adm.bed?.bedNumber.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchesStatus = statusFilter === 'ALL' || adm.admissionStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header Deck */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-3d-float border border-indigo-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/25 text-indigo-200 border border-indigo-400/30">
            Patient Intake & Floor Desk
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2">Inpatient Admissions Desk</h1>
          <p className="text-xs text-slate-300 mt-1">
            Manage planned & emergency admissions, priority triage queues, and transactional bed allocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-3d-button"
          >
            <Plus className="w-4 h-4" />
            <span>New Admission Intake</span>
          </button>
          <button
            onClick={fetchAdmissionsData}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center justify-between border ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <span className="text-sm font-medium">{message.text}</span>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Priority Waiting List Queue */}
      {waitlist.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
              <h3 className="text-sm font-bold text-amber-900">Priority Waiting List Queue ({waitlist.length} Waiting)</h3>
            </div>
            <span className="text-xs text-amber-700 font-medium">Beds matched as they become verified clean</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {waitlist.map((item) => (
              <div key={item.id} className="p-3.5 bg-white rounded-xl border border-amber-200/60 shadow-sm text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{item.patient.user.fullName}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    item.priority === 'EMERGENCY' ? 'bg-rose-100 text-rose-800' :
                    item.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.priority}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Needs: <strong>{item.requestedWardType}</strong> ({item.bedCategory})
                </p>
                {item.notes && <p className="text-[10px] text-slate-500 italic">{item.notes}</p>}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                  <span>Queued: {new Date(item.waitingSince).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-indigo-600 font-semibold">{availableBeds.length} Available Beds</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admissions Table & Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-3d-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search admission, patient, or diagnosis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Admission States</option>
              <option value="ADMITTED">Admitted (Active Inpatient)</option>
              <option value="REQUESTED">Admission Requested</option>
              <option value="DISCHARGED">Discharged</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3 font-bold">Admission Ref</th>
                <th className="p-3 font-bold">Patient Details</th>
                <th className="p-3 font-bold">Diagnosis & Dept</th>
                <th className="p-3 font-bold">Bed Allocated</th>
                <th className="p-3 font-bold">Priority / Type</th>
                <th className="p-3 font-bold">Status</th>
                <th className="p-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No admission records match current query.
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-700">
                      {adm.admissionNumber}
                      <span className="block text-[10px] text-slate-400 font-sans font-normal">
                        {new Date(adm.admissionDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{adm.patient.user.fullName}</span>
                      <span className="text-[11px] text-slate-500">{adm.patient.user.phone} • Blood: {adm.patient.bloodGroup || 'N/A'}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800 line-clamp-1">{adm.diagnosis}</span>
                      <span className="text-[10px] text-slate-500">{adm.department} • Dr: {adm.doctor?.user.fullName || 'Consultant'}</span>
                    </td>
                    <td className="p-3">
                      {adm.bed ? (
                        <div>
                          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {adm.bed.bedNumber}
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {adm.bed.ward.name} • Rm {adm.bed.room.roomNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-1 rounded font-semibold text-[10px]">
                          Unassigned Bed
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        adm.priority === 'EMERGENCY' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        adm.priority === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {adm.priority}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">{adm.admissionType}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        adm.admissionStatus === 'ADMITTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        adm.admissionStatus === 'DISCHARGED' ? 'bg-slate-100 text-slate-700' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {adm.admissionStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {adm.admissionStatus === 'REQUESTED' ? (
                        <button
                          onClick={() => {
                            setSelectedAdmission(adm);
                            setShowAllocateModal(true);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg shadow-sm"
                        >
                          Allocate Bed
                        </button>
                      ) : adm.admissionStatus === 'ADMITTED' ? (
                        <span className="text-[11px] font-semibold text-emerald-600">Active Inpatient</span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocate Bed Modal */}
      {showAllocateModal && selectedAdmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Allocate Bed to Admission</h3>
                <p className="text-xs text-slate-500">Atomic allocation & lock</p>
              </div>
              <button onClick={() => setShowAllocateModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-semibold text-slate-600">Patient:</span>
                <p className="text-sm font-bold text-slate-900">{selectedAdmission.patient.user.fullName}</p>
                <p className="text-slate-500">Diagnosis: {selectedAdmission.diagnosis}</p>
                <p className="text-indigo-600 font-semibold">Requested: {selectedAdmission.requestedWardType} Ward</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Available Bed:</label>
                <select
                  value={selectedBedId}
                  onChange={(e) => setSelectedBedId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="">-- Choose Available Bed --</option>
                  {availableBeds.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bedNumber} — {b.ward.name} ({b.bedCategory}, ₹{b.dailyTariff}/d)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setShowAllocateModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
              <button onClick={handleAllocateBed} className="px-5 py-2.5 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-3d-button">
                Confirm Bed Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Intake Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">New Admission Intake Request</h3>
                <p className="text-xs text-slate-500">Register inpatient clinical recommendation</p>
              </div>
              <button onClick={() => setShowRequestModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admission Diagnosis:</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute myocardial infarction, Left femur fracture..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Admission Type:</label>
                  <select
                    value={admissionType}
                    onChange={(e) => setAdmissionType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="EMERGENCY">Emergency Triage</option>
                    <option value="PLANNED">Planned Surgery / Procedure</option>
                    <option value="DIRECT">Direct Outpatient Admission</option>
                    <option value="REFERRAL">External Hospital Referral</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority:</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="EMERGENCY">Emergency (Immediate)</option>
                    <option value="HIGH">High Priority</option>
                    <option value="NORMAL">Normal Priority</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Clinical Department:</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Ward Type:</label>
                  <select
                    value={requestedWard}
                    onChange={(e) => setRequestedWard(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="ICU">ICU Critical Care</option>
                    <option value="GENERAL">General Ward</option>
                    <option value="EMERGENCY">Emergency Ward</option>
                    <option value="MATERNITY">Maternity Wing</option>
                    <option value="ISOLATION">Isolation Unit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Notes & Physician Remarks:</label>
                <textarea
                  rows={3}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Vital baseline, oxygen saturation, initial emergency interventions..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
              <button onClick={handleCreateAdmissionRequest} className="px-5 py-2.5 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-3d-button">
                Submit Admission Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalAdmissionsPage;
