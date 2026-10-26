import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Calendar, 
  Pill, 
  FlaskConical, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Clock,
  ArrowRight
} from 'lucide-react';

export const NotificationCenterPage: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useApp();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Notifications' },
    { id: 'appointment', label: 'Appointments' },
    { id: 'pharmacy', label: 'Pharmacy & Stock' },
    { id: 'diagnostic', label: 'Diagnostic Reports' },
    { id: 'hospital', label: 'Hospital Ops' },
    { id: 'system', label: 'System & Security' },
  ];

  const filtered = notifications.filter(n => {
    if (activeCategory === 'all') return true;
    return n.category === activeCategory;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'appointment': return <Calendar className="w-4 h-4 text-teal-600" />;
      case 'pharmacy': return <Pill className="w-4 h-4 text-emerald-600" />;
      case 'diagnostic': return <FlaskConical className="w-4 h-4 text-amber-600" />;
      case 'hospital': return <Building2 className="w-4 h-4 text-indigo-600" />;
      default: return <Bell className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-teal-600" />
            Healthcare Notification Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-stakeholder alerts for appointments, pharmacy stock breaches, and verified lab results
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <CheckCheck className="w-4 h-4 text-teal-600" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeCategory === c.id
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs">
            No notifications in this category.
          </div>
        ) : (
          filtered.map(notif => (
            <div
              key={notif.id}
              onClick={() => {
                markAsRead(notif.id);
                if (notif.actionUrl) {
                  navigate(notif.actionUrl);
                }
              }}
              className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                !notif.read
                  ? 'bg-white border-teal-300 shadow-card hover:border-teal-400'
                  : 'bg-slate-50/60 border-slate-200/80 hover:bg-white'
              }`}
            >
              <div className="p-2.5 rounded-2xl bg-slate-100 flex-shrink-0 mt-0.5">
                {getCategoryIcon(notif.category)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{notif.title}</h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-teal-600" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {notif.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                {notif.actionUrl && (
                  <span className="text-[11px] font-semibold text-teal-600 hover:underline inline-flex items-center gap-1 pt-1">
                    <span>View Related Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
