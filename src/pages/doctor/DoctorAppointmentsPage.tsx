import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { mockDoctors } from '../../data/mockDoctors';
import { Appointment, AppointmentStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DoctorConsultationModal } from './DoctorConsultationModal';
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  Play, 
  CheckCircle2, 
  User, 
  FileText,
  AlertCircle
} from 'lucide-react';

export const DoctorAppointmentsPage: React.FC = () => {
  const { appointments, updateAppointmentStatus } = useApp();
  const doctor = mockDoctors[0];

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [activeConsultation, setActiveConsultation] = useState<Appointment | null>(null);

  const doctorAppointments = appointments.filter(a => a.doctorId === doctor.id || a.doctorName.includes('Rajeshwar'));

  const filtered = doctorAppointments.filter(apt => {
    if (activeFilter === 'All') return true;
    return apt.status === activeFilter;
  });

  const statuses: (AppointmentStatus | 'All')[] = [
    'All',
    'Scheduled',
    'Checked In',
    'In Consultation',
    'Completed',
    'Cancelled'
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Calendar className="w-6 h-6 text-teal-600" />
          OPD Appointments Roster & Patient Schedule
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review patient appointments, mark patient check-in statuses, write notes, and sign digital prescriptions
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {statuses.map(st => (
          <button
            key={st}
            onClick={() => setActiveFilter(st)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === st
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Appointments Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>Patient Name & Demographic</span>
          <div className="hidden sm:flex items-center gap-16 mr-20">
            <span>Slot & Date</span>
            <span>Status</span>
          </div>
          <span>Actions</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No appointments found matching "{activeFilter}"
            </div>
          ) : (
            filtered.map(apt => (
              <div
                key={apt.id}
                className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{apt.patientName}</span>
                    <span className="text-xs text-slate-400">({apt.patientAge || 48} Yrs)</span>
                    <StatusBadge status={apt.status} />
                  </div>
                  <p className="text-xs text-slate-500">
                    Phone: {apt.patientPhone} • {apt.type} • Fee: ₹{apt.fee} ({apt.paymentStatus})
                  </p>
                  <p className="text-xs text-slate-600 italic">
                    Chief Complaint: "{apt.symptoms || 'General Checkup'}"
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto justify-end">
                  <div className="text-left sm:text-right text-xs">
                    <strong className="block text-slate-800">{apt.timeSlot}</strong>
                    <span className="text-slate-400 text-[11px]">{apt.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {apt.status === 'Scheduled' && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'Checked In')}
                        className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold rounded-lg border border-sky-200 transition-colors"
                      >
                        Check In
                      </button>
                    )}

                    {apt.status !== 'Completed' && (
                      <button
                        onClick={() => setActiveConsultation(apt)}
                        className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Consult</span>
                      </button>
                    )}

                    {apt.status === 'Completed' && (
                      <button
                        onClick={() => setActiveConsultation(apt)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Notes</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <DoctorConsultationModal
        isOpen={!!activeConsultation}
        onClose={() => setActiveConsultation(null)}
        appointment={activeConsultation}
      />
    </div>
  );
};
