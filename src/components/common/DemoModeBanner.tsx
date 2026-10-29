import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Sparkles, Users, Stethoscope, Building2, Pill, FlaskConical, ShieldCheck, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoModeBanner: React.FC = () => {
  const { currentRole, setRole } = useApp();
  const navigate = useNavigate();

  const roleMeta: Record<UserRole, { label: string; icon: React.ReactNode; path: string; color: string }> = {
    patient: {
      label: 'Patient',
      icon: <Users className="w-3.5 h-3.5" />,
      path: '/patient',
      color: 'bg-teal-500 text-white',
    },
    doctor: {
      label: 'Doctor',
      icon: <Stethoscope className="w-3.5 h-3.5" />,
      path: '/doctor',
      color: 'bg-sky-500 text-white',
    },
    hospital: {
      label: 'Hospital Admin',
      icon: <Building2 className="w-3.5 h-3.5" />,
      path: '/hospital',
      color: 'bg-indigo-500 text-white',
    },
    pharmacy: {
      label: 'Pharmacist',
      icon: <Pill className="w-3.5 h-3.5" />,
      path: '/pharmacy',
      color: 'bg-emerald-500 text-white',
    },
    staff: {
      label: 'Staff Desk',
      icon: <Users className="w-3.5 h-3.5" />,
      path: '/staff/dashboard',
      color: 'bg-indigo-500 text-white',
    },
    laboratory: {
      label: 'Diagnostic Lab',
      icon: <FlaskConical className="w-3.5 h-3.5" />,
      path: '/laboratory',
      color: 'bg-amber-500 text-white',
    },
    lab_staff: {
      label: 'Lab Tech',
      icon: <FlaskConical className="w-3.5 h-3.5" />,
      path: '/laboratory/samples',
      color: 'bg-cyan-500 text-white',
    },
    supplier: {
      label: 'Supplier Hub',
      icon: <Pill className="w-3.5 h-3.5" />,
      path: '/supplier',
      color: 'bg-blue-500 text-white',
    },
    admin: {
      label: 'Central Admin',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      path: '/admin',
      color: 'bg-purple-500 text-white',
    },
  };

  const handleRoleSwitch = (role: UserRole) => {
    setRole(role);
    navigate(roleMeta[role].path);
  };

  return (
    <div className="bg-slate-900 text-white text-xs px-4 py-2 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold text-[10px] tracking-wide uppercase border border-teal-500/30">
            <Sparkles className="w-3 h-3 text-teal-300" />
            Interactive Demo Mode
          </span>
          <span className="text-slate-400 hidden sm:inline">
            Viewing as <strong className="text-white capitalize">{currentRole}</strong> (Simulated data)
          </span>
        </div>

        {/* Role Quick Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0">
          <span className="text-slate-400 text-[11px] font-medium mr-1 hidden lg:inline">Switch Portal:</span>
          {(Object.keys(roleMeta) as UserRole[]).map(r => {
            const isSelected = currentRole === r;
            return (
              <button
                key={r}
                onClick={() => handleRoleSwitch(r)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  isSelected
                    ? `${roleMeta[r].color} shadow-sm font-semibold ring-1 ring-white/30`
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {roleMeta[r].icon}
                <span>{roleMeta[r].label}</span>
              </button>
            );
          })}
          <button
            onClick={() => navigate('/roles')}
            className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold px-1.5 py-1 flex items-center ml-1"
            title="Open Role Hub"
          >
            All Roles <ChevronRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
