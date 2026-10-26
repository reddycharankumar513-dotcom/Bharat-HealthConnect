import React from 'react';
import { mockHospitals } from '../../data/mockHospitals';
import { mockDoctors } from '../../data/mockDoctors';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/common/StatCard';
import { 
  Building2, 
  Users, 
  Calendar, 
  Activity, 
  Bed, 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';

export const HospitalAdminDashboard: React.FC = () => {
  const { appointments } = useApp();
  const hospital = mockHospitals[0]; // Apollo Health City, Jubilee Hills

  const weeklyOPDData = [
    { day: 'Mon', appointments: 124, emergency: 18 },
    { day: 'Tue', appointments: 145, emergency: 22 },
    { day: 'Wed', appointments: 138, emergency: 15 },
    { day: 'Thu', appointments: 160, emergency: 26 },
    { day: 'Fri', appointments: 152, emergency: 20 },
    { day: 'Sat', appointments: 178, emergency: 31 },
    { day: 'Sun', appointments: 88, emergency: 25 },
  ];

  const departmentUtilization = [
    { dept: 'Cardiology', occupancy: 92 },
    { dept: 'Oncology', occupancy: 85 },
    { dept: 'Neurology', occupancy: 78 },
    { dept: 'Orthopedics', occupancy: 88 },
    { dept: 'Pediatrics', occupancy: 65 },
    { dept: 'Trauma & ICU', occupancy: 94 },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-elevated flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Hospital Operations Center
            </span>
            <span className="text-xs text-indigo-200">NABH Accredited • {hospital.type}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{hospital.name}</h1>
          <p className="text-xs text-slate-300">
            {hospital.address}, {hospital.city} • Total Bed Strength: {hospital.bedCapacity}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-300 block">Demostration ICU Status</span>
          <span className="text-xl font-extrabold text-emerald-400">{hospital.icuBedsDemo} / 30 Beds Free</span>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>
          <strong>Operational Notice:</strong> Bed availability and emergency capacity shown on this dashboard are demonstration data points.
        </span>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sanctioned Beds"
          value={hospital.bedCapacity}
          subtitle="650 In-Patient Beds"
          icon={<Bed className="w-5 h-5" />}
          trend={{ value: '88% Occupied', isPositive: true }}
        />
        <StatCard
          title="Today's OPD Queue"
          value={186}
          subtitle="Registered Outpatients"
          icon={<Users className="w-5 h-5 text-indigo-600" />}
          iconBgColor="bg-indigo-50"
          trend={{ value: '+12% vs Yesterday', isPositive: true }}
        />
        <StatCard
          title="Consulting Specialists"
          value={48}
          subtitle="Duty Roster Active"
          icon={<Activity className="w-5 h-5 text-teal-600" />}
          badge="12 On-Call"
        />
        <StatCard
          title="Completion Rate"
          value="94.2%"
          subtitle="OPD Consultation Throughput"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weekly OPD Patient Inflow */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                Weekly Outpatient (OPD) & Emergency Inflow
              </h3>
              <p className="text-xs text-slate-500">Patient footfall analytics across 7 days</p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyOPDData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="appointments" fill="#0d9488" radius={[6, 6, 0, 0]} name="OPD Visits" />
                <Bar dataKey="emergency" fill="#e11d48" radius={[6, 6, 0, 0]} name="Emergency Casualty" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Utilization Progress */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            Department Bed Utilization
          </h3>
          <p className="text-xs text-slate-500">Real-time clinical service load</p>

          <div className="space-y-4 pt-2">
            {departmentUtilization.map(item => (
              <div key={item.dept} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{item.dept}</span>
                  <span className={item.occupancy > 90 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                    {item.occupancy}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.occupancy > 90 ? 'bg-rose-500' : 'bg-teal-600'
                    }`}
                    style={{ width: `${item.occupancy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
