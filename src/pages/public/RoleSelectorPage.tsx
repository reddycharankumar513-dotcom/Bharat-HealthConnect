import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  Users, 
  Stethoscope, 
  Building2, 
  Pill, 
  FlaskConical, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Lock
} from 'lucide-react';

interface RoleCard {
  role: UserRole;
  title: string;
  badge: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  persona: string;
  features: string[];
  themeColor: string;
  borderAccent: string;
}

export const RoleSelectorPage: React.FC = () => {
  const { setRole } = useApp();
  const navigate = useNavigate();

  const roles: RoleCard[] = [
    {
      role: 'patient',
      title: 'Patient Portal',
      badge: 'Citizen Access',
      description: 'Manage upcoming appointments, explore nearby empanelled hospitals, download verified lab reports, and manage ABHA health IDs.',
      path: '/patient',
      icon: <Users className="w-6 h-6 text-teal-600" />,
      persona: 'Demo: Ramesh Sharma (Hyderabad • ABHA: 91-4589-2341-9920)',
      features: ['Appointment Scheduling & Rescheduling', 'Unified Medical Records & Allergies', 'Ayushman Bharat PM-JAY Invoices', 'Emergency Trauma Locator'],
      themeColor: 'bg-teal-50',
      borderAccent: 'hover:border-teal-400',
    },
    {
      role: 'doctor',
      title: 'Doctor Portal',
      badge: 'Clinician Workspace',
      description: 'Review daily OPD queue, inspect authorized patient history, write digital prescriptions, and refer diagnostic blood tests.',
      path: '/doctor',
      icon: <Stethoscope className="w-6 h-6 text-sky-600" />,
      persona: 'Demo: Dr. Rajeshwar Rao, MD, DM (Cardiology • Apollo Jubilee Hills)',
      features: ['Real-time OPD Consultation Queue', 'Digital Prescription Writer', 'Diagnostic Referral Interface', 'Slot Availability Calendar'],
      themeColor: 'bg-sky-50',
      borderAccent: 'hover:border-sky-400',
    },
    {
      role: 'hospital',
      title: 'Hospital Administrator',
      badge: 'Institution Management',
      description: 'Monitor hospital operations, emergency bed capacity, department performance, doctor duty rosters, and patient grievances.',
      path: '/hospital',
      icon: <Building2 className="w-6 h-6 text-indigo-600" />,
      persona: 'Demo: Apollo Health City (650 Beds • 24x7 Trauma & Critical Care)',
      features: ['Bed Occupancy & Emergency Capacity', 'Department & Specialty Config', 'Duty Rosters & Staff Access Control', 'Patient Feedback Redressal'],
      themeColor: 'bg-indigo-50',
      borderAccent: 'hover:border-indigo-400',
    },
    {
      role: 'pharmacy',
      title: 'Pharmacist Portal',
      badge: 'Smart Supply Chain',
      description: 'Smart medicine inventory management with low-stock alerts, automated reorder calculations, supplier PO approval, and stock updates upon goods receipt.',
      path: '/pharmacy',
      icon: <Pill className="w-6 h-6 text-emerald-600" />,
      persona: 'Demo: Central Hospital Pharmacy (V. Satyanarayana, Pharmacist)',
      features: ['Threshold-based Low Stock Alerts', 'Automated Lead-Time Reorder Calculations', 'Simulated Goods-Received Restocking', 'Batch Expiry & Cold-Chain Tracking'],
      themeColor: 'bg-emerald-50',
      borderAccent: 'hover:border-emerald-400',
    },
    {
      role: 'laboratory',
      title: 'Diagnostic Laboratory',
      badge: 'NABL Bio-Path',
      description: 'Manage diagnostic test bookings, phlebotomy sample collections, barcode tracking through 5 stages, and report verification & delivery.',
      path: '/laboratory',
      icon: <FlaskConical className="w-6 h-6 text-amber-600" />,
      persona: 'Demo: Bharat Diagnostic Hub (Dr. Neha Agarwal, MD Pathologist)',
      features: ['INR Test Catalog & Preparation Guidelines', 'Phlebotomy Sample Stage Tracking', 'Pathologist Report Digital Approval', 'Direct Patient Report Delivery'],
      themeColor: 'bg-amber-50',
      borderAccent: 'hover:border-amber-400',
    },
    {
      role: 'admin',
      title: 'Central Platform Administrator',
      badge: 'National Governance',
      description: 'National overview of registered healthcare providers, review and approve doctor and hospital licensing, audit security logs, and resolve platform disputes.',
      path: '/admin',
      icon: <ShieldCheck className="w-6 h-6 text-purple-600" />,
      persona: 'Demo: Central Directorate of Health Services (Govt. of India Demo)',
      features: ['Provider Licensing & Empanelment Approvals', 'System-wide Security Audit Trails', 'Multi-stakeholder Dispute Mediation', 'Digital Health Infrastructure Analytics'],
      themeColor: 'bg-purple-50',
      borderAccent: 'hover:border-purple-400',
    },
  ];

  const handleSelectRole = (r: RoleCard) => {
    setRole(r.role);
    navigate(r.path);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 text-slate-800 text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Interactive Role Previewer & Demo Login</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Choose a Healthcare Portal to Preview
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Bharat HealthConnect features dedicated interfaces tailored for each stakeholder in India's healthcare system. Select any role below to launch its interactive functional dashboard with realistic simulated data.
        </p>
      </div>

      {/* 6 Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map(r => (
          <div
            key={r.role}
            className={`bg-white rounded-3xl border border-slate-200/90 p-6 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between ${r.borderAccent} group`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${r.themeColor}`}>
                  {r.icon}
                </div>
                <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {r.badge}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  {r.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {r.description}
                </p>
              </div>

              {/* Persona Pill */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-medium text-slate-700">
                {r.persona}
              </div>

              {/* Key Features List */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Interactive Features:
                </span>
                {r.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Button */}
            <div className="pt-6">
              <button
                onClick={() => handleSelectRole(r)}
                className="w-full py-2.5 px-4 bg-slate-900 group-hover:bg-teal-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <span>Launch {r.title}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Security notice */}
      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-center max-w-xl mx-auto text-xs text-slate-500 flex items-center justify-center gap-2">
        <Lock className="w-4 h-4 text-slate-400" />
        <span>Demo mode active. Simulated authentication does not require credentials or transmit private medical records.</span>
      </div>
    </div>
  );
};
