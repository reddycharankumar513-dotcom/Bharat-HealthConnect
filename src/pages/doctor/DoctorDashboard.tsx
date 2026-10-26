import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { mockDoctors } from '../../data/mockDoctors';
import { Appointment } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DoctorConsultationModal } from './DoctorConsultationModal';
import { 
  Users, 
  Calendar, 
  Clock, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Activity, 
  Play, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { appointments, updateAppointmentStatus } = useApp();

  const doctor = mockDoctors[0]; // Dr. Rajeshwar Rao (Cardiology)

  const [activeConsultation, setActiveConsultation] = useState<Appointment | null>(null);

  // Appointments for this doctor
  const doctorAppointments = appointments.filter(a => a.doctorId === doctor.id || a.doctorName.includes('Rajeshwar'));

  const scheduledCount = doctorAppointments.filter(a => a.status === 'Scheduled').length;
  const inConsultationCount = doctorAppointments.filter(a => a.status === 'In Consultation' || a.status === 'Checked In').length;
  const completedCount = doctorAppointments.filter(a => a.status === 'Completed').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-elevated flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={doctor.avatar}
            alt={doctor.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 border border-white/20">
                Clinician OPD Console
              </span>
              <span className="text-xs text-sky-200">MCI-REG: 44102</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mt-1">{doctor.name}</h1>
            <p className="text-xs text-sky-100">
              Senior Consultant - {doctor.specialty} • {doctor.hospitalName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/doctor/appointments"
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Open OPD Queue ({doctorAppointments.length})</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scheduled Today</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{scheduledCount}</div>
          <span className="text-[10px] text-teal-600 font-medium">Pending consultations</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Waiting in OPD</span>
          <div className="text-2xl font-bold text-sky-600 mt-1">{inConsultationCount}</div>
          <span className="text-[10px] text-sky-600 font-medium">Checked in at reception</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{completedCount}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Prescriptions signed</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">OPD Slot Utilization</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">92%</div>
          <span className="text-[10px] text-slate-500 font-medium">High patient demand</span>
        </div>
      </div>

      {/* OPD Patient Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              Today's Patient Queue & OPD Appointments
            </h2>
            <p className="text-xs text-slate-500">Live consultation queue for Apollo Health City</p>
          </div>
          <Link
            to="/doctor/appointments"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>Full Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {doctorAppointments.map(apt => (
            <div
              key={apt.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-50/70 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">{apt.patientName}</h3>
                  <StatusBadge status={apt.status} />
                  <span className="text-xs text-slate-400">({apt.type})</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    Slot: <strong>{apt.timeSlot}</strong>
                  </span>
                  <span>•</span>
                  <span>Date: {apt.date}</span>
                </div>
                <p className="text-xs text-slate-600 pt-0.5">
                  <span className="font-semibold text-slate-500">Chief Complaint:</span> {apt.symptoms || 'Routine follow-up'}
                </p>
              </div>

              {/* Action */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                {apt.status !== 'Completed' ? (
                  <button
                    onClick={() => setActiveConsultation(apt)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start Consultation</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Signed & Finished
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consultation Modal */}
      <DoctorConsultationModal
        isOpen={!!activeConsultation}
        onClose={() => setActiveConsultation(null)}
        appointment={activeConsultation}
      />
    </div>
  );
};
