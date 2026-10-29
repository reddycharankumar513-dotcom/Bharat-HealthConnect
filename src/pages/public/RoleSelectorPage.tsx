import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Lock,
  Truck,
  UserCheck
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
      description: 'Book doctor appointments, order verified medications, track prescriptions, and download encrypted diagnostic lab reports.',
      path: '/patient',
      icon: <Users className="w-6 h-6 text-teal-600" />,
      persona: 'Charan Kumar (Hyderabad • ABHA: ABHA-2491-9988-7711)',
      features: ['Symptom-based Doctor Booking', 'Medicine Marketplace & Orders', 'Download Verified Lab Reports', 'Ayushman Bharat ABHA Health Records'],
      themeColor: 'bg-teal-50',
      borderAccent: 'hover:border-teal-400',
    },
    {
      role: 'doctor',
      title: 'Doctor Portal',
      badge: 'Clinician Workspace',
      description: 'Review daily OPD queue, write digital prescriptions, refer diagnostic blood tests, and inspect patient clinical records with consent.',
      path: '/doctor',
      icon: <Stethoscope className="w-6 h-6 text-sky-600" />,
      persona: 'Dr. Arvind Swaminathan (Cardiology • AIIMS Hyderabad)',
      features: ['Real-time OPD Consultation Queue', 'Digital Prescription Writer', 'Diagnostic Test Referral', 'Slot Availability Calendar'],
      themeColor: 'bg-sky-50',
      borderAccent: 'hover:border-sky-400',
    },
    {
      role: 'hospital',
      title: 'Hospital Administrator',
      badge: 'Facility Operations',
      description: 'Monitor hospital operations, ICU & trauma bed capacity, department performance, doctor duty rosters, and patient grievances.',
      path: '/hospital',
      icon: <Building2 className="w-6 h-6 text-indigo-600" />,
      persona: 'AIIMS Hyderabad Super Speciality (500 Beds • 24x7 Trauma)',
      features: ['Live Bed Occupancy & ICU Readiness', 'Doctor & Staff Duty Rosters', 'Department Utilization Metrics', 'Grievance Redressal'],
      themeColor: 'bg-indigo-50',
      borderAccent: 'hover:border-indigo-400',
    },
    {
      role: 'staff',
      title: 'Hospital Staff & Triage',
      badge: 'Admission Desk',
      description: 'Manage outpatient admission desk, mark patient arrival check-in, coordinate triage queue, and assist doctor consultation queues.',
      path: '/staff/dashboard',
      icon: <UserCheck className="w-6 h-6 text-indigo-600" />,
      persona: 'Priya Sundaram (Head Receptionist & Admission Desk)',
      features: ['Patient Physical Check-In', 'Outpatient Queue Management', 'Emergency Walk-in Intake', 'Bed Allocation Coordination'],
      themeColor: 'bg-indigo-50',
      borderAccent: 'hover:border-indigo-400',
    },
    {
      role: 'pharmacy',
      title: 'Pharmacist Portal',
      badge: 'QR Stock & Dispensing',
      description: 'Camera QR barcode scanner, automatic stock deduction, low-stock threshold alerts, wholesale reorders, and goods-received restocking.',
      path: '/pharmacy',
      icon: <Pill className="w-6 h-6 text-emerald-600" />,
      persona: 'Sanjeevani MedPlus (K. S. Narayanan, Chief Pharmacist)',
      features: ['Camera QR & Barcode Scanner', 'Concurrency-Safe Stock Deduction', 'Searchable Inventory Ledger', 'Wholesale Supplier Reorders'],
      themeColor: 'bg-emerald-50',
      borderAccent: 'hover:border-emerald-400',
    },
    {
      role: 'laboratory',
      title: 'Diagnostic Lab Administrator',
      badge: 'NABL Bio-Path',
      description: 'Diagnostic catalog, 6-stage phlebotomy sample tracking, secure PDF report upload, pathologist digital approval, and patient notification.',
      path: '/laboratory',
      icon: <FlaskConical className="w-6 h-6 text-amber-600" />,
      persona: 'Vijaya Bio-Diagnostics (Dr. Sunita Kulkarni, Pathologist)',
      features: ['Pathology Test Catalog & INR Pricing', 'Phlebotomy Sample Stage Tracking', 'Secure Encrypted Report Upload', 'Direct Patient Report Delivery'],
      themeColor: 'bg-amber-50',
      borderAccent: 'hover:border-amber-400',
    },
    {
      role: 'lab_staff',
      title: 'Diagnostic Lab Technician',
      badge: 'Testing & Phlebotomy',
      description: 'Sample collection barcoding, centrifugation, biochemical assay tracking, and uploading verified clinical findings.',
      path: '/laboratory/samples',
      icon: <FlaskConical className="w-6 h-6 text-cyan-600" />,
      persona: 'Ramesh Naidu (Senior Medical Laboratory Technician)',
      features: ['Sample Collection Barcode Scan', 'Assay Processing Milestones', 'Diagnostic Report Upload', 'Quality Control Logs'],
      themeColor: 'bg-cyan-50',
      borderAccent: 'hover:border-cyan-400',
    },
    {
      role: 'supplier',
      title: 'Medical Supplier Hub',
      badge: 'Wholesale Distribution',
      description: 'Manage pharmaceutical wholesale supply, approve purchase orders from licensed pharmacies, and update dispatch shipments.',
      path: '/supplier',
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      persona: 'Bharat MedLogistics (Mahesh Singhal, Director)',
      features: ['Incoming Pharmacy Purchase Requests', 'Order Acceptance & Wholesale Pricing', 'Shipment Dispatch Tracking', 'Delivery Receipts'],
      themeColor: 'bg-blue-50',
      borderAccent: 'hover:border-blue-400',
    },
    {
      role: 'admin',
      title: 'Central Platform Administrator',
      badge: 'National Governance',
      description: 'Pan-India oversight of healthcare providers, review and approve doctor and hospital licenses, audit security logs, and monitor uptime.',
      path: '/admin',
      icon: <ShieldCheck className="w-6 h-6 text-purple-600" />,
      persona: 'Ministry & Central Health Directorate Oversight',
      features: ['Provider Credential Verification', 'Security Audit Trail & Telemetry', 'Dispute Redressal Console', 'National Health Telemetry'],
      themeColor: 'bg-purple-50',
      borderAccent: 'hover:border-purple-400',
    },
  ];

  const handleSelectRole = (card: RoleCard) => {
    setRole(card.role);
    navigate(card.path);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Interactive Role Preview Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Experience Bharat HealthConnect
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Select any of the 9 authorized healthcare workspaces below to preview role-tailored dashboards, live clinical workflows, and data interactions.
        </p>
        <div className="pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Go to Full Authentication Login Screen</span>
          </Link>
        </div>
      </div>

      {/* Grid of 9 Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map(card => (
          <div
            key={card.role}
            onClick={() => handleSelectRole(card)}
            className={`bg-white rounded-3xl border border-slate-200/90 p-6 shadow-card hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group ${card.borderAccent}`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl ${card.themeColor} flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                  {card.badge}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Persona Pill */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 font-medium">
                {card.persona}
              </div>

              {/* Features List */}
              <div className="space-y-1.5 pt-1">
                {card.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-bold text-teal-700 group-hover:translate-x-1 transition-transform">
              <span>Launch {card.title}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
