import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { TiltCard3D } from '../../components/common/TiltCard3D';
import { 
  BedDouble, 
  Activity, 
  Sparkles, 
  Wrench, 
  Ban, 
  Users, 
  Search, 
  Filter, 
  Plus, 
  ArrowRightLeft, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Flame,
  Check,
  X
} from 'lucide-react';

interface Bed {
  id: string;
  bedNumber: string;
  bedCategory: string;
  bedType: string;
  dailyTariff: number;
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'CLEANING_REQUIRED' | 'UNDER_MAINTENANCE' | 'BLOCKED';
  facilities?: string;
  notes?: string;
  ward: {
    id: string;
    name: string;
    wardType: string;
    department: string;
    floor: string;
  };
  room: {
    id: string;
    roomNumber: string;
    roomType: string;
    dailyRate: number;
  };
  equipment?: Array<{
    id: string;
    name: string;
    code: string;
    equipmentType: string;
    status: string;
  }>;
  admissions?: Array<{
    id: string;
    admissionNumber: string;
    diagnosis: string;
    admissionDate: string;
    patient: {
      user: {
        fullName: string;
        phone: string;
      };
    };
    doctor?: {
      user: {
        fullName: string;
      };
    };
  }>;
}

interface Analytics {
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  cleaningBeds: number;
  maintenanceBeds: number;
  blockedBeds: number;
  reservedBeds: number;
  totalWards?: number;
  totalRooms?: number;
  occupancyRate: number;
  activeAdmissions: number;
  pendingCleaningTasks: number;
  activeMaintenanceRequests: number;
  waitingListCount: number;
}

export const HospitalBedDashboard: React.FC = () => {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active modals
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [showCleaningModal, setShowCleaningModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showSmartRecommender, setShowSmartRecommender] = useState(false);
  const [showAddBedModal, setShowAddBedModal] = useState(false);

  // Form states
  const [availableBedsList, setAvailableBedsList] = useState<Bed[]>([]);
  const [admissionsList, setAdmissionsList] = useState<any[]>([]);
  const [wardsList, setWardsList] = useState<any[]>([]);
  const [roomsList, setRoomsList] = useState<any[]>([]);

  // Transfer form
  const [transferTargetBedId, setTransferTargetBedId] = useState('');
  const [transferReason, setTransferReason] = useState('');

  // Discharge form
  const [dischargeDiagnosis, setDischargeDiagnosis] = useState('');
  const [dischargeSummary, setDischargeSummary] = useState('');
  const [dischargeInstructions, setDischargeInstructions] = useState('');
  const [dischargeType, setDischargeType] = useState('NORMAL');

  // Maintenance form
  const [maintenanceIssue, setMaintenanceIssue] = useState('');
  const [maintenancePriority, setMaintenancePriority] = useState('HIGH');
  const [assignedTechnician, setAssignedTechnician] = useState('');

  // Cleaning form
  const [cleaningStaff, setCleaningStaff] = useState('');
  const [cleaningNotes, setCleaningNotes] = useState('');

  // Add Bed form
  const [newBedNumber, setNewBedNumber] = useState('');
  const [newBedWardId, setNewBedWardId] = useState('');
  const [newBedRoomId, setNewBedRoomId] = useState('');
  const [newBedCategory, setNewBedCategory] = useState('STANDARD');
  const [newBedType, setNewBedType] = useState('SEMI_ELECTRIC');
  const [newBedTariff, setNewBedTariff] = useState(1500);

  // Smart Recommender state
  const [reqVentilator, setReqVentilator] = useState(false);
  const [reqOxygen, setReqOxygen] = useState(false);
  const [reqIsolation, setReqIsolation] = useState(false);
  const [reqWardType, setReqWardType] = useState('ICU');
  const [smartRecommendations, setSmartRecommendations] = useState<any[]>([]);
  const [evaluatingSmart, setEvaluatingSmart] = useState(false);

  const fetchBedData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, bedsRes, wardsRes, roomsRes, admissionsRes] = await Promise.all([
        api.get('/beds/analytics'),
        api.get('/beds'),
        api.get('/beds/wards'),
        api.get('/beds/rooms'),
        api.get('/beds/admissions?status=ADMITTED')
      ]);

      if (analyticsRes.success) {
        setAnalytics(analyticsRes.analytics);
      }
      if (bedsRes.success) {
        setBeds(bedsRes.beds);
        setAvailableBedsList(bedsRes.beds.filter((b: Bed) => b.status === 'AVAILABLE'));
      }
      if (wardsRes.success) {
        setWardsList(wardsRes.wards);
        if (wardsRes.wards.length > 0 && !newBedWardId) {
          setNewBedWardId(wardsRes.wards[0].id);
        }
      }
      if (roomsRes.success) {
        setRoomsList(roomsRes.rooms);
        if (roomsRes.rooms.length > 0 && !newBedRoomId) {
          setNewBedRoomId(roomsRes.rooms[0].id);
        }
      }
      if (admissionsRes.success) {
        setAdmissionsList(admissionsRes.admissions);
      }
    } catch (err) {
      console.error('Error fetching bed dashboard data:', err);
      setMessage({ type: 'error', text: 'Failed to load bed management data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBedData();
  }, []);

  // Filtered beds
  const filteredBeds = beds.filter(bed => {
    const matchesSearch = search === '' || 
      bed.bedNumber.toLowerCase().includes(search.toLowerCase()) ||
      bed.ward.name.toLowerCase().includes(search.toLowerCase()) ||
      bed.room.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      (bed.admissions?.[0]?.patient.user.fullName.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchesWard = selectedWard === 'ALL' || bed.ward.wardType === selectedWard;
    const matchesStatus = selectedStatus === 'ALL' || bed.status === selectedStatus;
    const matchesCategory = selectedCategory === 'ALL' || bed.bedCategory === selectedCategory;

    return matchesSearch && matchesWard && matchesStatus && matchesCategory;
  });

  // Handle Transfer
  const handleTransfer = async () => {
    if (!selectedBed || !selectedBed.admissions?.[0] || !transferTargetBedId || !transferReason) {
      setMessage({ type: 'error', text: 'Please select a destination bed and provide transfer reason.' });
      return;
    }

    try {
      const res = await api.post('/beds/transfers', {
        admissionId: selectedBed.admissions[0].id,
        toBedId: transferTargetBedId,
        transferReason
      });

      if (res.success) {
        setMessage({ type: 'success', text: res.message || 'Transfer executed successfully.' });
        setShowTransferModal(false);
        setTransferReason('');
        setTransferTargetBedId('');
        fetchBedData();
      } else {
        setMessage({ type: 'error', text: res.message || 'Transfer failed.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to complete transfer.' });
    }
  };

  // Handle Discharge
  const handleDischarge = async () => {
    if (!selectedBed || !selectedBed.admissions?.[0] || !dischargeDiagnosis || !dischargeSummary) {
      setMessage({ type: 'error', text: 'Diagnosis and treatment summary are mandatory for clinical discharge.' });
      return;
    }

    try {
      const res = await api.post('/beds/discharges', {
        admissionId: selectedBed.admissions[0].id,
        dischargeType,
        finalDiagnosis: dischargeDiagnosis,
        treatmentSummary: dischargeSummary,
        followUpInstructions: dischargeInstructions,
        billingCleared: true
      });

      if (res.success) {
        setMessage({ type: 'success', text: res.message || 'Patient discharged. Bed queued for terminal cleaning.' });
        setShowDischargeModal(false);
        setDischargeDiagnosis('');
        setDischargeSummary('');
        setDischargeInstructions('');
        fetchBedData();
      } else {
        setMessage({ type: 'error', text: res.message || 'Discharge failed.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Discharge operation failed.' });
    }
  };

  // Handle Cleaning Request
  const handleCleaningRequest = async () => {
    if (!selectedBed) return;

    try {
      const res = await api.post('/beds/cleaning', {
        hospitalId: selectedBed.ward.id ? 'hosp-aims-hyd' : 'hosp-aims-hyd',
        bedId: selectedBed.id,
        assignedStaffName: cleaningStaff || 'On-duty Sanitation Team',
        notes: cleaningNotes || 'Routine deep sanitize'
      });

      if (res.success) {
        setMessage({ type: 'success', text: 'Cleaning task assigned. Bed marked for sanitation.' });
        setShowCleaningModal(false);
        setCleaningStaff('');
        setCleaningNotes('');
        fetchBedData();
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to request cleaning.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to assign cleaning.' });
    }
  };

  // Handle Maintenance Request
  const handleMaintenanceReport = async () => {
    if (!selectedBed || !maintenanceIssue) {
      setMessage({ type: 'error', text: 'Issue description is required.' });
      return;
    }

    try {
      const res = await api.post('/beds/maintenance', {
        hospitalId: 'hosp-aims-hyd',
        bedId: selectedBed.id,
        issueDescription: maintenanceIssue,
        priority: maintenancePriority,
        assignedTechnician: assignedTechnician || 'Biomedical Engineering'
      });

      if (res.success) {
        setMessage({ type: 'success', text: 'Maintenance requested. Bed marked UNDER_MAINTENANCE.' });
        setShowMaintenanceModal(false);
        setMaintenanceIssue('');
        setAssignedTechnician('');
        fetchBedData();
      } else {
        setMessage({ type: 'error', text: res.message || 'Maintenance reporting failed.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to report maintenance.' });
    }
  };

  // Handle Add Bed
  const handleAddBed = async () => {
    if (!newBedNumber || !newBedWardId || !newBedRoomId) {
      setMessage({ type: 'error', text: 'Bed Number, Ward, and Room are required.' });
      return;
    }

    try {
      const res = await api.post('/beds', {
        hospitalId: 'hosp-aims-hyd',
        wardId: newBedWardId,
        roomId: newBedRoomId,
        bedNumber: newBedNumber,
        bedCategory: newBedCategory,
        bedType: newBedType,
        dailyTariff: Number(newBedTariff)
      });

      if (res.success) {
        setMessage({ type: 'success', text: `Bed ${newBedNumber} created successfully.` });
        setShowAddBedModal(false);
        setNewBedNumber('');
        fetchBedData();
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to create bed.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create bed.' });
    }
  };

  // Evaluate Smart Bed Recommendations
  const evaluateSmartBedAllocation = async () => {
    setEvaluatingSmart(true);
    try {
      const res = await api.get(`/beds/smart-recommendations?wardType=${reqWardType}&requiresVentilator=${reqVentilator}&requiresOxygen=${reqOxygen}&requiresIsolation=${reqIsolation}`);
      if (res.success) {
        setSmartRecommendations(res.recommendations);
      }
    } catch (err) {
      console.error('Error fetching smart recommendations:', err);
    } finally {
      setEvaluatingSmart(false);
    }
  };

  // Helper for status badge styling
  const getStatusBadge = (status: Bed['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-emerald-500/20',
          dot: 'bg-emerald-500 animate-pulse',
          label: 'Available'
        };
      case 'OCCUPIED':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-300 ring-rose-500/20',
          dot: 'bg-rose-500',
          label: 'Occupied'
        };
      case 'RESERVED':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-300 ring-amber-500/20',
          dot: 'bg-amber-500',
          label: 'Reserved'
        };
      case 'CLEANING_REQUIRED':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-300 ring-orange-500/20',
          dot: 'bg-orange-500 animate-ping',
          label: 'Cleaning Req.'
        };
      case 'UNDER_MAINTENANCE':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300 ring-slate-500/20',
          dot: 'bg-slate-500',
          label: 'Maintenance'
        };
      case 'BLOCKED':
        return {
          bg: 'bg-zinc-800 text-zinc-100 border-zinc-700 ring-zinc-500/20',
          dot: 'bg-zinc-400',
          label: 'Blocked'
        };
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 3D Header Command Deck */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-3d-float border border-indigo-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/25 text-indigo-200 border border-indigo-400/30 backdrop-blur-sm">
                ArogyaCare Bed Command Engine
              </span>
              <span className="text-xs text-indigo-300">Floor Matrix & Telemetry v2.0</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Hospital Bed & Inpatient Management
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Real-time ward telemetry, transactional admission allocation, automated housekeeping workflows, and cross-floor bed transfers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setShowSmartRecommender(true);
                evaluateSmartBedAllocation();
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-semibold text-xs shadow-3d-button hover:shadow-3d-button-hover active:shadow-3d-button-active transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Smart Allocation Engine</span>
            </button>
            <button
              onClick={() => setShowAddBedModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-3d-button hover:shadow-3d-button-hover active:shadow-3d-button-active transition-all border border-indigo-400/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Bed</span>
            </button>
            <button
              onClick={fetchBedData}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
              title="Refresh Floor Matrix"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {message && (
        <div className={`p-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-3 text-sm font-medium">
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:bg-black/5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid with 3D Tilt */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Beds"
            value={analytics.totalBeds}
            icon={<BedDouble className="w-5 h-5" />}
            iconBgColor="bg-blue-50 text-blue-600"
            subtitle={`${analytics.totalWards} Active Wards`}
          />
          <StatCard
            title="Available"
            value={analytics.availableBeds}
            icon={<CheckCircle2 className="w-5 h-5" />}
            iconBgColor="bg-emerald-50 text-emerald-600"
            badge="Ready"
          />
          <StatCard
            title="Occupied"
            value={analytics.occupiedBeds}
            icon={<Users className="w-5 h-5" />}
            iconBgColor="bg-rose-50 text-rose-600"
            subtitle={`${analytics.occupancyRate}% Utilization`}
          />
          <StatCard
            title="Cleaning Req."
            value={analytics.cleaningBeds}
            icon={<Sparkles className="w-5 h-5" />}
            iconBgColor="bg-orange-50 text-orange-600"
            subtitle="Housekeeping Desk"
          />
          <StatCard
            title="Maintenance"
            value={analytics.maintenanceBeds}
            icon={<Wrench className="w-5 h-5" />}
            iconBgColor="bg-slate-100 text-slate-700"
            subtitle="Bio-Medical Dept"
          />
          <StatCard
            title="Blocked / Isol."
            value={analytics.blockedBeds}
            icon={<Ban className="w-5 h-5" />}
            iconBgColor="bg-zinc-100 text-zinc-700"
            subtitle="Disinfection"
          />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-3d-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search bed, patient, room, or ward..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Ward filter */}
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Wards</option>
            <option value="ICU">ICU / Critical Care</option>
            <option value="GENERAL">General Ward</option>
            <option value="EMERGENCY">Emergency Unit</option>
            <option value="MATERNITY">Maternity Wing</option>
            <option value="ISOLATION">Isolation Unit</option>
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Bed Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="CLEANING_REQUIRED">Cleaning Required</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="RESERVED">Reserved</option>
            <option value="BLOCKED">Blocked</option>
          </select>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Categories</option>
            <option value="STANDARD">Standard</option>
            <option value="ICU">ICU Critical</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="MATERNITY">Maternity</option>
            <option value="ISOLATION">Isolation</option>
          </select>
        </div>
      </div>

      {/* Real-Time Visual Floor Bed Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Interactive Floor Bed Grid</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {filteredBeds.length} Beds
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Occupied</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Cleaning</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Maintenance</span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-sm text-slate-500 font-medium">Synchronizing floor bed matrix and telemetry...</p>
          </div>
        ) : filteredBeds.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <BedDouble className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No beds matched your filter criteria</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting the ward or status filter above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBeds.map((bed) => {
              const statusStyle = getStatusBadge(bed.status);
              const admission = bed.admissions?.[0];

              return (
                <TiltCard3D key={bed.id} maxTilt={8} scale={1.02} className="rounded-2xl">
                  <div className={`p-5 rounded-2xl bg-white border shadow-3d-card hover:shadow-3d-float transition-all duration-300 flex flex-col justify-between h-full ${
                    bed.status === 'AVAILABLE' ? 'border-emerald-200' :
                    bed.status === 'OCCUPIED' ? 'border-rose-200' :
                    bed.status === 'CLEANING_REQUIRED' ? 'border-orange-200' : 'border-slate-200'
                  }`}>
                    {/* Top Row: Bed Number & Status */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-slate-900 tracking-tight">{bed.bedNumber}</span>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {bed.bedType}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 block mt-0.5">
                            {bed.ward.name} • Room {bed.room.roomNumber}
                          </span>
                        </div>

                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ring-1 ${statusStyle.bg}`}>
                          <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`}></span>
                          {statusStyle.label}
                        </span>
                      </div>

                      {/* Middle Body: Patient details if occupied, or tariff & features */}
                      {bed.status === 'OCCUPIED' && admission ? (
                        <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{admission.patient.user.fullName}</span>
                            <span className="text-[10px] text-rose-700 font-semibold">{admission.admissionNumber}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-1">
                            <strong>Dx:</strong> {admission.diagnosis}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-rose-200/40">
                            <span>Dr: {admission.doctor?.user.fullName || 'Attending'}</span>
                            <span>Tariff: ₹{bed.dailyTariff}/d</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Daily Tariff:</span>
                            <span className="font-bold text-slate-900">₹{bed.dailyTariff} / day</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-500 text-[11px]">
                            <span>Ward Type:</span>
                            <span className="font-medium text-slate-700">{bed.ward.wardType}</span>
                          </div>
                          {bed.notes && (
                            <p className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200 mt-1">
                              {bed.notes}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Active Equipment Tags */}
                      {bed.equipment && bed.equipment.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {bed.equipment.map((eq) => (
                            <span
                              key={eq.id}
                              className={`text-[9px] font-semibold px-2 py-0.5 rounded-md border ${
                                eq.status === 'IN_USE'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {eq.name.split(' ')[0]} ({eq.code})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      {bed.status === 'OCCUPIED' ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedBed(bed);
                              setShowTransferModal(true);
                            }}
                            className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Transfer</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBed(bed);
                              setDischargeDiagnosis(admission?.diagnosis || '');
                              setShowDischargeModal(true);
                            }}
                            className="flex-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Discharge</span>
                          </button>
                        </>
                      ) : bed.status === 'CLEANING_REQUIRED' ? (
                        <button
                          onClick={() => {
                            setSelectedBed(bed);
                            setShowCleaningModal(true);
                          }}
                          className="w-full py-1.5 px-2 bg-orange-50 hover:bg-orange-100 text-orange-800 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                          <span>Assign / Verify Housekeeping</span>
                        </button>
                      ) : bed.status === 'AVAILABLE' ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedBed(bed);
                              setShowCleaningModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Request Sanitation"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBed(bed);
                              setShowMaintenanceModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Report Fault"
                          >
                            <Wrench className="w-4 h-4" />
                          </button>
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                            Ready for Intake
                          </span>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedBed(bed);
                            setShowMaintenanceModal(true);
                          }}
                          className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Manage Fault</span>
                        </button>
                      )}
                    </div>
                  </div>
                </TiltCard3D>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: BED TRANSFER */}
      {/* ============================================================== */}
      {showTransferModal && selectedBed && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Patient Bed Transfer</h3>
                <p className="text-xs text-slate-500">Atomic relocation with automatic source bed sanitation</p>
              </div>
              <button onClick={() => setShowTransferModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-semibold text-slate-700">Current Occupant:</span>
                <p className="text-slate-900 font-bold">{selectedBed.admissions?.[0]?.patient.user.fullName}</p>
                <p className="text-slate-500">Current Bed: {selectedBed.bedNumber} ({selectedBed.ward.name})</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Destination Bed:</label>
                <select
                  value={transferTargetBedId}
                  onChange={(e) => setTransferTargetBedId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">-- Select Available Destination Bed --</option>
                  {availableBedsList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bedNumber} — {b.ward.name} ({b.bedCategory}, ₹{b.dailyTariff}/d)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Transfer Reason:</label>
                <textarea
                  rows={3}
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="e.g. ICU step-down, patient stability achieved, oxygen weaning protocol complete..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl text-amber-800 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>
                  <strong>Safety Gate:</strong> Bed {selectedBed.bedNumber} will automatically transition to <code>CLEANING_REQUIRED</code> and cannot be reused until verified by housekeeping.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-3d-button"
              >
                Execute Bed Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: PATIENT DISCHARGE */}
      {/* ============================================================== */}
      {showDischargeModal && selectedBed && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Clinical Discharge Protocol</h3>
                <p className="text-xs text-slate-500">Summary generation, billing closure, and bed sterilization release</p>
              </div>
              <button onClick={() => setShowDischargeModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-semibold text-slate-700">Patient:</span>
                <p className="text-slate-900 font-bold">{selectedBed.admissions?.[0]?.patient.user.fullName}</p>
                <p className="text-slate-500">Bed {selectedBed.bedNumber} • Admission #{selectedBed.admissions?.[0]?.admissionNumber}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Discharge Type:</label>
                <select
                  value={dischargeType}
                  onChange={(e) => setDischargeType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="NORMAL">Normal Discharge (Medically Fit)</option>
                  <option value="DAMA">DAMA (Discharge Against Medical Advice)</option>
                  <option value="TRANSFER_HOSPITAL">Transfer to Tertiary Center</option>
                  <option value="EMERGENCY">Emergency Discharge</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Final Diagnosis:</label>
                <input
                  type="text"
                  value={dischargeDiagnosis}
                  onChange={(e) => setDischargeDiagnosis(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  placeholder="Final medical diagnosis upon discharge"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Treatment & Clinical Summary:</label>
                <textarea
                  rows={3}
                  value={dischargeSummary}
                  onChange={(e) => setDischargeSummary(e.target.value)}
                  placeholder="Course of stay, interventions executed, recovery milestones..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Follow-up Instructions & Medicines:</label>
                <textarea
                  rows={2}
                  value={dischargeInstructions}
                  onChange={(e) => setDischargeInstructions(e.target.value)}
                  placeholder="Dietary precautions, review OPD visit in 7 days..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setShowDischargeModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDischarge}
                className="px-5 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-3d-button"
              >
                Confirm Patient Discharge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: HOUSEKEEPING & SANITATION DESK */}
      {/* ============================================================== */}
      {showCleaningModal && selectedBed && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Housekeeping & Sanitization</h3>
                <p className="text-xs text-slate-500">Assign sanitization staff or verify completed cleaning</p>
              </div>
              <button onClick={() => setShowCleaningModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-orange-50 rounded-xl text-orange-900 space-y-0.5">
                <span className="font-bold text-sm">Bed: {selectedBed.bedNumber}</span>
                <p className="text-xs">{selectedBed.ward.name} • Room {selectedBed.room.roomNumber}</p>
                <p className="text-[11px] text-orange-700 pt-1">Current status: <strong>{selectedBed.status}</strong></p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Sanitation Staff:</label>
                <input
                  type="text"
                  value={cleaningStaff}
                  onChange={(e) => setCleaningStaff(e.target.value)}
                  placeholder="e.g. Ravi Kumar (Sanitation Team B)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Housekeeping Protocol Notes:</label>
                <textarea
                  rows={2}
                  value={cleaningNotes}
                  onChange={(e) => setCleaningNotes(e.target.value)}
                  placeholder="Mattress steam disinfect, linen replacement, terminal UV sanitation..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {selectedBed.status === 'CLEANING_REQUIRED' && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Supervisor Direct Verification</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    If cleaning has been physically inspected and certified, verify it now to automatically return bed to <strong>AVAILABLE</strong> status.
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        const res = await api.patch(`/beds/${selectedBed.id}/status`, {
                          status: 'AVAILABLE',
                          notes: 'Supervisor verified sanitation complete.'
                        });
                        if (res.success) {
                          setMessage({ type: 'success', text: `Bed ${selectedBed.bedNumber} certified clean & AVAILABLE!` });
                          setShowCleaningModal(false);
                          fetchBedData();
                        }
                      } catch (err: any) {
                        setMessage({ type: 'error', text: 'Verification failed.' });
                      }
                    }}
                    className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    Certify & Mark Bed AVAILABLE
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setShowCleaningModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleCleaningRequest}
                className="px-5 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-3d-button"
              >
                Queue Cleaning Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: MAINTENANCE REPORTING */}
      {/* ============================================================== */}
      {showMaintenanceModal && selectedBed && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Bed Maintenance & Repair</h3>
                <p className="text-xs text-slate-500">Report faulty motorized mechanism, rails, or biomedical telemetry</p>
              </div>
              <button onClick={() => setShowMaintenanceModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-sm text-slate-900">Bed {selectedBed.bedNumber}</span>
                <p className="text-xs text-slate-500">{selectedBed.ward.name} • {selectedBed.bedType}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue Description:</label>
                <textarea
                  rows={3}
                  value={maintenanceIssue}
                  onChange={(e) => setMaintenanceIssue(e.target.value)}
                  placeholder="e.g. Electric elevation actuator motor failing, side safety rail loose..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority:</label>
                  <select
                    value={maintenancePriority}
                    onChange={(e) => setMaintenancePriority(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Technician:</label>
                  <input
                    type="text"
                    value={assignedTechnician}
                    onChange={(e) => setAssignedTechnician(e.target.value)}
                    placeholder="Biomedical Eng."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {selectedBed.status === 'UNDER_MAINTENANCE' && (
                <button
                  onClick={async () => {
                    try {
                      const res = await api.patch(`/beds/${selectedBed.id}/status`, {
                        status: 'CLEANING_REQUIRED',
                        notes: 'Maintenance completed. Queued for final sanitation.'
                      });
                      if (res.success) {
                        setMessage({ type: 'success', text: `Repairs marked complete. Bed ${selectedBed.bedNumber} moved to cleaning.` });
                        setShowMaintenanceModal(false);
                        fetchBedData();
                      }
                    } catch (err) {
                      setMessage({ type: 'error', text: 'Failed to complete maintenance.' });
                    }
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Mark Repairs Completed & Move to Cleaning
                </button>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setShowMaintenanceModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleMaintenanceReport}
                className="px-5 py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-3d-button"
              >
                Log Maintenance Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: SMART BED ALLOCATION RECOMMENDATION ENGINE */}
      {/* ============================================================== */}
      {showSmartRecommender && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white shadow-md">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Smart Bed Allocation Engine</h3>
                  <p className="text-xs text-slate-500">Heuristic matching across clinical equipment, ward types, and tariffs</p>
                </div>
              </div>
              <button onClick={() => setShowSmartRecommender(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Criteria Controls */}
            <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Clinical Criteria Requirements:</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Ward Specialization:</label>
                  <select
                    value={reqWardType}
                    onChange={(e) => setReqWardType(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                  >
                    <option value="ICU">ICU Critical Care</option>
                    <option value="GENERAL">General Medical</option>
                    <option value="EMERGENCY">Emergency Trauma</option>
                    <option value="MATERNITY">Maternity Wing</option>
                    <option value="ISOLATION">Isolation Unit</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reqVentilator}
                    onChange={(e) => setReqVentilator(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="font-medium text-slate-700">Ventilator</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reqOxygen}
                    onChange={(e) => setReqOxygen(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="font-medium text-slate-700">Central O2</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reqIsolation}
                    onChange={(e) => setReqIsolation(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="font-medium text-slate-700">Negative Pressure</span>
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={evaluateSmartBedAllocation}
                  disabled={evaluatingSmart}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${evaluatingSmart ? 'animate-spin' : ''}`} />
                  <span>Re-Compute Ranking</span>
                </button>
              </div>
            </div>

            {/* Recommendations List */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900">Optimal Bed Recommendations ({smartRecommendations.length} Candidates):</h4>

              {smartRecommendations.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl">
                  No beds currently available matching the exact criteria.
                </div>
              ) : (
                <div className="space-y-2">
                  {smartRecommendations.map((bed, idx) => (
                    <div
                      key={bed.id}
                      className="p-4 rounded-2xl border border-slate-200/90 hover:border-teal-300 hover:shadow-md transition-all flex items-center justify-between gap-4 bg-white"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{bed.bedNumber}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {bed.matchScore}% Match
                          </span>
                          <span className="text-xs text-slate-500">₹{bed.dailyTariff}/day</span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {bed.ward.name} • Room {bed.room.roomNumber} ({bed.ward.wardType})
                        </p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {bed.recommendationReasons?.map((r: string, rIdx: number) => (
                            <span key={rIdx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              ✓ {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setShowSmartRecommender(false);
                          setSelectedBed(bed);
                          // Trigger allocate
                          setMessage({ type: 'success', text: `Selected recommended Bed ${bed.bedNumber}. Ready for patient assignment.` });
                        }}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-sm"
                      >
                        Select Bed
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: ADD NEW BED */}
      {/* ============================================================== */}
      {showAddBedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Add Bed to Inventory</h3>
                <p className="text-xs text-slate-500">Assign unique bed number within ward and room</p>
              </div>
              <button onClick={() => setShowAddBedModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bed Number / Code:</label>
                <input
                  type="text"
                  value={newBedNumber}
                  onChange={(e) => setNewBedNumber(e.target.value)}
                  placeholder="e.g. ICU-104-C, GEN-205-A..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ward:</label>
                <select
                  value={newBedWardId}
                  onChange={(e) => setNewBedWardId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  {wardsList.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.wardType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Room:</label>
                <select
                  value={newBedRoomId}
                  onChange={(e) => setNewBedRoomId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  {roomsList
                    .filter((r) => !newBedWardId || r.wardId === newBedWardId)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNumber} ({r.roomType})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category:</label>
                  <select
                    value={newBedCategory}
                    onChange={(e) => setNewBedCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="ICU">ICU Critical</option>
                    <option value="EMERGENCY">Emergency</option>
                    <option value="MATERNITY">Maternity</option>
                    <option value="ISOLATION">Isolation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bed Mechanism:</label>
                  <select
                    value={newBedType}
                    onChange={(e) => setNewBedType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="FULL_ELECTRIC">Full Electric Motorized</option>
                    <option value="SEMI_ELECTRIC">Semi-Electric</option>
                    <option value="MANUAL">Manual Crank</option>
                    <option value="HYDRAULIC">Hydraulic Stretcher</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Daily Tariff (₹ INR):</label>
                <input
                  type="number"
                  value={newBedTariff}
                  onChange={(e) => setNewBedTariff(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setShowAddBedModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBed}
                className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-3d-button"
              >
                Save New Bed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalBedDashboard;
