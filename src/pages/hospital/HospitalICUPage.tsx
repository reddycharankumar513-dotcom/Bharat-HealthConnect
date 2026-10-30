import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TiltCard3D } from '../../components/common/TiltCard3D';
import { 
  HeartPulse, 
  Activity, 
  Wind, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Users, 
  Zap, 
  BedDouble,
  Clock
} from 'lucide-react';

interface ICUBed {
  id: string;
  bedNumber: string;
  status: string;
  dailyTariff: number;
  ward: {
    name: string;
  };
  room: {
    roomNumber: string;
  };
  equipment: Array<{
    id: string;
    name: string;
    code: string;
    equipmentType: string;
    status: string;
    notes?: string;
  }>;
  admissions?: Array<{
    id: string;
    admissionNumber: string;
    diagnosis: string;
    admissionDate: string;
    patient: {
      user: {
        fullName: string;
      };
    };
    doctor?: {
      user: {
        fullName: string;
      };
    };
  }>;
}

export const HospitalICUPage: React.FC = () => {
  const [beds, setBeds] = useState<ICUBed[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [nursing, setNursing] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchICUData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/beds/icu-dashboard');
      if (res.success) {
        setBeds(res.beds);
        setEquipment(res.equipment);
        setNursing(res.nursingAssignments);
        setStats(res.icuStats);
      }
    } catch (err) {
      console.error('Failed to get ICU telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchICUData();
    // Simulate real-time telemetry polling every 20 seconds
    const interval = setInterval(fetchICUData, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* 3D Header */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-3d-float border border-red-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/25 text-rose-200 border border-rose-400/30">
            Critical Care & Emergency Resuscitation Deck
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2">ICU & Telemetry Monitoring</h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time mechanical ventilator telemetry, cardiac waveform monitors, central oxygen pressures, and nurse ratios.
          </p>
        </div>

        <button
          onClick={fetchICUData}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ICU Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3d-card">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total ICU Beds</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalIcuBeds}</div>
            <span className="text-xs text-emerald-600 font-bold">{stats.availableIcuBeds} Free for Emergency</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3d-card">
            <span className="text-xs font-semibold text-slate-500 uppercase">Occupied Beds</span>
            <div className="text-2xl font-black text-rose-600 mt-1">{stats.occupiedIcuBeds}</div>
            <span className="text-xs text-slate-500">Critical care monitored</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3d-card">
            <span className="text-xs font-semibold text-slate-500 uppercase">Mechanical Ventilators</span>
            <div className="text-2xl font-black text-indigo-600 mt-1">{stats.ventilatorsInUse} In Use</div>
            <span className="text-xs text-slate-500">{stats.ventilatorsAvailable} Standby calibrated</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3d-card">
            <span className="text-xs font-semibold text-slate-500 uppercase">Telemetry Alarms</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">0 Critical</div>
            <span className="text-xs text-emerald-600 font-bold">All Vitals Stable</span>
          </div>
        </div>
      )}

      {/* ICU Beds Grid with Telemetry Simulation */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">ICU Bedside Telemetry Stations</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {beds.map((bed) => {
            const isOccupied = bed.status === 'OCCUPIED';
            const adm = bed.admissions?.[0];

            return (
              <TiltCard3D key={bed.id} maxTilt={6} scale={1.01} className="rounded-2xl">
                <div className={`p-5 rounded-2xl bg-white border shadow-3d-card space-y-4 ${
                  isOccupied ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-900">{bed.bedNumber}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          Room {bed.room.roomNumber}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">{bed.ward.name}</span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      isOccupied ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isOccupied ? 'Patient Admitted' : 'Available'}
                    </span>
                  </div>

                  {isOccupied && adm ? (
                    <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center text-slate-400 font-sans text-[11px] pb-1 border-b border-slate-800">
                        <span className="font-bold text-white">{adm.patient.user.fullName}</span>
                        <span>Dr: {adm.doctor?.user.fullName || 'Intensivist'}</span>
                      </div>

                      {/* Simulated Vital Telemetry */}
                      <div className="grid grid-cols-3 gap-2 text-center pt-1">
                        <div className="p-1.5 bg-slate-800 rounded-lg">
                          <span className="text-[9px] text-slate-400 block font-sans">HEART RATE</span>
                          <span className="text-emerald-400 font-bold text-sm">74 bpm</span>
                        </div>
                        <div className="p-1.5 bg-slate-800 rounded-lg">
                          <span className="text-[9px] text-slate-400 block font-sans">BLOOD PRESS.</span>
                          <span className="text-indigo-300 font-bold text-sm">124/78</span>
                        </div>
                        <div className="p-1.5 bg-slate-800 rounded-lg">
                          <span className="text-[9px] text-slate-400 block font-sans">SpO2 (O2 SAT)</span>
                          <span className="text-teal-400 font-bold text-sm">99%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-sans">
                        <span>Waveform: <strong>Normal Sinus Rhythm</strong></span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Telemetry Active
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                      Station Standby • Ready for Immediate Emergency Reception
                    </div>
                  )}

                  {/* Connected Equipment */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">Connected Life Support Devices:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {bed.equipment.map((eq) => (
                        <span key={eq.id} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {eq.name} ({eq.status})
                        </span>
                      ))}
                      {bed.equipment.length === 0 && (
                        <span className="text-[10px] text-slate-400 italic">No dedicated equipment attached</span>
                      )}
                    </div>
                  </div>
                </div>
              </TiltCard3D>
            );
          })}
        </div>
      </div>

      {/* Nursing Roster Bar */}
      {nursing.length > 0 && (
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-3d-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Active ICU Nursing Duty Roster</h3>
            <span className="text-xs text-slate-500">Standard 1:2 ICU Nurse-to-Patient Ratio</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {nursing.map((nurse) => (
              <div key={nurse.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="font-bold text-slate-900 block">{nurse.nurseName}</span>
                <span className="text-slate-500 text-[11px]">{nurse.shift}</span>
                <span className="text-indigo-600 block text-[10px] font-semibold">
                  Assigned Beds: {nurse.assignedBeds || 'Floor Rotation'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalICUPage;
