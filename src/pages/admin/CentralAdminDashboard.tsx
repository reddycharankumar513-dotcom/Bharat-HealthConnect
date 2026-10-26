import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/common/StatCard';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  FileCheck2, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  Lock,
  ArrowRight
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

export const CentralAdminDashboard: React.FC = () => {
  const { verificationRequests } = useApp();

  const pendingVerifs = verificationRequests.filter(v => v.status === 'Pending').length;

  const platformMonthlyGrowth = [
    { month: 'Jun', patients: 12000, providers: 420 },
    { month: 'Jul', patients: 18500, providers: 510 },
    { month: 'Aug', patients: 24200, providers: 640 },
    { month: 'Sep', patients: 31000, providers: 790 },
    { month: 'Oct', patients: 45000, providers: 980 },
  ];

  const systemIntegrations = [
    { service: 'National Health Authority (ABDM Gateway)', status: 'Operational', latency: '42ms', mode: 'Live ABDM API' },
    { service: 'NPCI UPI 2.0 Healthcare Gateway', status: 'Operational', latency: '88ms', mode: 'Demo Sandbox' },
    { service: 'NABL Diagnostic Telemetry Pipe', status: 'Operational', latency: '120ms', mode: 'HL7 FHIR v4' },
    { service: 'SMS / OTP Gateway (Govt DLT)', status: 'Simulated', latency: '0ms', mode: 'Demo Simulation Mode' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-elevated flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              National Platform Directorate
            </span>
            <span className="text-xs text-purple-200">ABDM Ecosystem Tier-1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Central HealthConnect Administration</h1>
          <p className="text-xs text-slate-300">
            Provider licensing verification, platform-wide audit security trails, and health exchange metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/verifications"
            className="px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Review Verifications ({pendingVerifs})</span>
          </Link>
        </div>
      </div>

      {/* Security Privacy Notice */}
      <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-950 flex items-center gap-2">
        <Lock className="w-4 h-4 text-purple-600 flex-shrink-0" />
        <span>
          <strong>Role Governance:</strong> Platform administrators have governance & auditing authority only. In compliance with DPDP regulations, personal clinical consultation notes and patient diagnoses are strictly end-to-end encrypted and restricted from central admin viewing.
        </span>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Citizens"
          value="45,820"
          subtitle="ABHA Health ID linked"
          icon={<Users className="w-5 h-5 text-teal-600" />}
          iconBgColor="bg-teal-50"
          trend={{ value: '+24% this month', isPositive: true }}
        />
        <StatCard
          title="Verified Physicians"
          value="1,420"
          subtitle="State Council Certified"
          icon={<Stethoscope className="w-5 h-5 text-sky-600" />}
          iconBgColor="bg-sky-50"
        />
        <StatCard
          title="Empanelled Hospitals"
          value="340"
          subtitle="Public & Private Centers"
          icon={<Building2 className="w-5 h-5 text-indigo-600" />}
          iconBgColor="bg-indigo-50"
        />
        <StatCard
          title="Pending Verifications"
          value={pendingVerifs}
          subtitle="Licenses awaiting audit"
          icon={<FileCheck2 className="w-5 h-5 text-purple-600" />}
          iconBgColor="bg-purple-50"
          badge="Action Required"
        />
      </div>

      {/* Platform Analytics Growth Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                Monthly Citizen Adoption & Provider Network Expansion
              </h3>
              <p className="text-xs text-slate-500">Citizen ABHA registrations and empanelled institutions</p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformMonthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="patients" fill="#0d9488" radius={[6, 6, 0, 0]} name="Registered Patients" />
                <Bar dataKey="providers" fill="#7c3aed" radius={[6, 6, 0, 0]} name="Healthcare Providers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Integration Status Table */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-teal-600" />
            Core National Gateway Status
          </h3>

          <div className="space-y-3 pt-1">
            {systemIntegrations.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <strong className="text-slate-800 line-clamp-1">{item.service}</strong>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.status === 'Operational' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{item.mode}</span>
                  <span className="font-mono">{item.latency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
