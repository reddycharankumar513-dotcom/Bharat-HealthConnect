import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AppointmentBookingModal } from '../../components/patient/AppointmentBookingModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { 
  Calendar, 
  Clock, 
  Building2, 
  Stethoscope, 
  Plus, 
  RotateCcw, 
  X, 
  FileText, 
  CreditCard,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const PatientAppointmentsPage: React.FC = () => {
  const { appointments, cancelAppointment, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<Appointment | undefined>(undefined);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const filteredAppointments = appointments.filter(apt => {
    if (activeTab === 'upcoming') {
      return apt.status === 'Scheduled' || apt.status === 'Rescheduled' || apt.status === 'In Consultation' || apt.status === 'Checked In';
    }
    if (activeTab === 'completed') {
      return apt.status === 'Completed';
    }
    if (activeTab === 'cancelled') {
      return apt.status === 'Cancelled';
    }
    return true;
  });

  const handleOpenReschedule = (apt: Appointment) => {
    setRescheduleData(apt);
    setBookingModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (cancelId) {
      cancelAppointment(cancelId, 'Patient requested cancellation');
      setCancelId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-600" />
            My Consultation Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your scheduled hospital OPD visits, tele-consultations, and review clinical summaries
          </p>
        </div>

        <button
          onClick={() => {
            setRescheduleData(undefined);
            setBookingModalOpen(true);
          }}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-2xs transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'upcoming', label: 'Upcoming Consultations' },
          { id: 'all', label: 'All Appointments' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled & Refunded' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointment Cards List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No appointments found in this view</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              You do not have any appointments under this tab. You can schedule a visit with any doctor.
            </p>
            <button
              onClick={() => {
                setRescheduleData(undefined);
                setBookingModalOpen(true);
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl"
            >
              Book an Appointment
            </button>
          </div>
        ) : (
          filteredAppointments.map(apt => (
            <div
              key={apt.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card hover:shadow-elevated transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">{apt.doctorName}</h3>
                      <StatusBadge status={apt.status} />
                    </div>
                    <p className="text-xs text-teal-700 font-medium">{apt.doctorSpecialty} • {apt.hospitalName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                    {apt.type}
                  </span>
                  <span className="font-bold text-slate-900">
                    ₹{apt.fee} ({apt.paymentStatus})
                  </span>
                </div>
              </div>

              {/* Date, Time, Symptoms */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>Date: <strong>{apt.date}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>Time Slot: <strong>{apt.timeSlot}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span className="truncate">Facility: {apt.hospitalName.split(',')[0]}</span>
                </div>
              </div>

              {apt.symptoms && (
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-400 block text-[10px] uppercase">Reason for Consultation:</span>
                  <p className="mt-0.5">{apt.symptoms}</p>
                </div>
              )}

              {apt.consultationNotes && (
                <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-2xl text-xs text-teal-950 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-teal-800">
                    <FileText className="w-3.5 h-3.5" />
                    Doctor's Clinical Notes:
                  </span>
                  <p className="leading-relaxed">{apt.consultationNotes}</p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-[10px] text-slate-400">
                  Booked on: {apt.bookedAt} (Ref: #{apt.id})
                </span>

                <div className="flex items-center gap-2">
                  {['Scheduled', 'Rescheduled'].includes(apt.status) && (
                    <>
                      <button
                        onClick={() => handleOpenReschedule(apt)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reschedule Slot</span>
                      </button>
                      <button
                        onClick={() => setCancelId(apt.id)}
                        className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-rose-200 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}

                  {apt.status === 'Completed' && (
                    <button
                      onClick={() => showToast(`Consultation Summary downloaded for ${apt.doctorName}`, 'info')}
                      className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-xl border border-teal-200 transition-colors"
                    >
                      Download Summary PDF
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reschedule Modal */}
      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setRescheduleData(undefined);
        }}
        appointmentToReschedule={rescheduleData}
      />

      {/* Confirmation Dialog for Cancellations */}
      <ConfirmDialog
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? The doctor's slot will be freed in the demo state and fee will be marked refunded."
        confirmText="Yes, Cancel"
        cancelText="Keep"
        isDestructive={true}
      />
    </div>
  );
};
