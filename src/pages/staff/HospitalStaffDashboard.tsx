import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Bed, 
  AlertTriangle, 
  UserPlus, 
  Search,
  Calendar,
  Activity
} from 'lucide-react';

export const HospitalStaffDashboard: React.FC = () => {
  const { appointments, updateAppointmentStatus, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const scheduledApts = appointments.filter(a => a.status === 'Scheduled');
  const checkedInApts = appointments.filter(a => a.status === 'Checked In');

  const handleCheckIn = (aptId: string, patientName: string) => {
    updateAppointmentStatus(aptId, 'Checked In', 'Patient physically checked in at Outpatient Admission Desk');
    showToast(`${patientName} marked as Checked In for doctor consultation`, 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            Hospital Staff & Admission Desk Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            AIIMS Hyderabad Outpatient Desk • Head Receptionist: Priya Sundaram • Morning Shift (08:00 AM - 04:00 PM)
          </p>
        </div>

        <button
          type="button"
          onClick={() => showToast('Demo: Walk-in emergency intake logged', 'info')}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <Activity className="w-4 h-4" />
          <span>Walk-in Triage Intake</span>
        </button>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Today's Consultations</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{appointments.length}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card">
          <span className="text-[10px] uppercase font-bold text-amber-600">Awaiting Check-in</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{scheduledApts.length}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card">
          <span className="text-[10px] uppercase font-bold text-teal-600">In Waiting Area</span>
          <p className="text-2xl font-black text-teal-600 mt-1">{checkedInApts.length}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card">
          <span className="text-[10px] uppercase font-bold text-emerald-600">Available General Beds</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">112 / 500</p>
        </div>
      </div>

      {/* Patient Intake Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Today's Patient Admission & Check-in Queue</h2>
            <p className="text-xs text-slate-400">Verify patient identity and move patients to consultation queue</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search patient name, phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          {appointments
            .filter(a => a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || a.patientPhone.includes(searchTerm))
            .map(apt => (
              <div
                key={apt.id}
                className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{apt.patientName}</span>
                    <span className="text-xs text-slate-400 font-mono">({apt.patientPhone})</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      apt.status === 'Checked In' ? 'bg-teal-100 text-teal-800' :
                      apt.status === 'In Consultation' ? 'bg-indigo-100 text-indigo-800' :
                      apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {apt.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    Consultation with <strong>{apt.doctorName}</strong> ({apt.doctorSpecialty}) • Time Slot: <strong>{apt.timeSlot}</strong>
                  </p>
                  {apt.symptoms && (
                    <span className="text-[11px] text-teal-700 font-medium">Chief Complaint: {apt.symptoms}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {apt.status === 'Scheduled' && (
                    <button
                      type="button"
                      onClick={() => handleCheckIn(apt.id, apt.patientName)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Patient Checked In</span>
                    </button>
                  )}

                  {apt.status === 'Checked In' && (
                    <span className="text-xs font-bold text-teal-700 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-teal-600" />
                      <span>Waiting for Doctor</span>
                    </span>
                  )}

                  {apt.status === 'In Consultation' && (
                    <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-indigo-600" />
                      <span>Inside Examination Room</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
