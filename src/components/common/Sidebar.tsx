import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  CreditCard, 
  User, 
  Building2, 
  Stethoscope, 
  Clock, 
  Pill, 
  ShoppingCart, 
  FlaskConical, 
  ClipboardCheck, 
  ShieldCheck, 
  FileCheck2, 
  AlertCircle, 
  Bell,
  HeartPulse,
  HelpCircle
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  count?: number;
}

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const { currentRole, notifications, appointments, purchaseOrders, diagnosticBookings, verificationRequests } = useApp();

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const scheduledApts = appointments.filter(a => a.status === 'Scheduled').length;
  const pendingPOs = purchaseOrders.filter(p => p.status === 'Pending Approval').length;
  const activeSamples = diagnosticBookings.filter(b => ['Sample Collected', 'In Transit', 'Processing'].includes(b.status)).length;
  const pendingVerifs = verificationRequests.filter(v => v.status === 'Pending').length;

  const roleNavItems: Record<string, NavItem[]> = {
    patient: [
      { label: 'Patient Dashboard', path: '/patient', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'My Appointments', path: '/patient/appointments', icon: <Calendar className="w-4 h-4" />, count: scheduledApts },
      { label: 'Find Hospitals', path: '/hospitals', icon: <Building2 className="w-4 h-4" /> },
      { label: 'Find Doctors', path: '/doctors', icon: <Stethoscope className="w-4 h-4" /> },
      { label: 'Medical Records', path: '/patient/records', icon: <FileText className="w-4 h-4" /> },
      { label: 'Payments & PM-JAY', path: '/patient/payments', icon: <CreditCard className="w-4 h-4" /> },
      { label: 'Patient Profile & ABHA', path: '/patient/profile', icon: <User className="w-4 h-4" /> },
    ],
    doctor: [
      { label: 'Doctor Dashboard', path: '/doctor', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Appointment Calendar', path: '/doctor/appointments', icon: <Calendar className="w-4 h-4" />, count: scheduledApts },
      { label: 'Slot Availability', path: '/doctor/availability', icon: <Clock className="w-4 h-4" /> },
    ],
    hospital: [
      { label: 'Hospital Operations', path: '/hospital', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Departments & Beds', path: '/hospital/departments', icon: <Building2 className="w-4 h-4" /> },
      { label: 'Doctors & Staff Roster', path: '/hospital/staff', icon: <Stethoscope className="w-4 h-4" /> },
      { label: 'Patient Complaints', path: '/hospital/complaints', icon: <AlertCircle className="w-4 h-4" /> },
    ],
    pharmacy: [
      { label: 'Pharmacy Dashboard', path: '/pharmacy', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Inventory & Alerts', path: '/pharmacy/inventory', icon: <Pill className="w-4 h-4" /> },
      { label: 'Purchase Orders', path: '/pharmacy/orders', icon: <ShoppingCart className="w-4 h-4" />, count: pendingPOs },
    ],
    laboratory: [
      { label: 'Laboratory Dashboard', path: '/laboratory', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Diagnostic Test Catalog', path: '/laboratory/catalog', icon: <FlaskConical className="w-4 h-4" /> },
      { label: 'Sample Tracking', path: '/laboratory/samples', icon: <ClipboardCheck className="w-4 h-4" />, count: activeSamples },
    ],
    admin: [
      { label: 'Central Administration', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Provider Verifications', path: '/admin/verifications', icon: <FileCheck2 className="w-4 h-4" />, count: pendingVerifs },
      { label: 'Audit & Security Logs', path: '/admin/audit', icon: <ShieldCheck className="w-4 h-4" /> },
      { label: 'Dispute Redressal', path: '/admin/disputes', icon: <AlertCircle className="w-4 h-4" /> },
    ]
  };

  const currentNav = roleNavItems[currentRole] || roleNavItems.patient;

  return (
    <aside className={`w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 flex-shrink-0 ${className}`}>
      <div className="space-y-6">
        {/* Active Role Card */}
        <div className="p-3.5 bg-gradient-to-br from-slate-50 to-teal-50/50 rounded-2xl border border-slate-200/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {currentRole[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider block">
                Portal View
              </span>
              <p className="text-sm font-bold text-slate-800 capitalize truncate">
                {currentRole === 'hospital' ? 'Hospital Admin' : currentRole === 'laboratory' ? 'Diagnostic Lab' : currentRole === 'admin' ? 'Central Admin' : currentRole}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>
          {currentNav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/` || item.path === `/${currentRole}`}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-teal-800 shadow-xs">
                  {item.count}
                </span>
              )}
            </NavLink>
          ))}

          {/* Universal Notification Link */}
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </div>
            {unreadNotifs > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-xs">
                {unreadNotifs}
              </span>
            )}
          </NavLink>
        </nav>
      </div>

      {/* Bottom Emergency & Help Box */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <NavLink
          to="/emergency"
          className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-colors"
        >
          <HeartPulse className="w-4 h-4 text-rose-600" />
          <span>Emergency Trauma (112)</span>
        </NavLink>
        <p className="text-[10px] text-slate-400 text-center">
          Bharat HealthConnect v2.4 • Demo System
        </p>
      </div>
    </aside>
  );
};
