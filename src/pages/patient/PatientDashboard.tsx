import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Appointment } from '../../types';
import { mockHospitals } from '../../data/mockHospitals';
import { mockMedicalRecords, mockPrescriptions } from '../../data/mockRecords';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { AppointmentBookingModal } from '../../components/patient/AppointmentBookingModal';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  Stethoscope, 
  FileText, 
  Pill, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Heart, 
  Activity, 
  ArrowRight, 
  FileCheck, 
  Download, 
  Check, 
  X,
  Sparkles,
  HeartPulse
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { 
    patientProfile, 
    appointments, 
    cancelAppointment, 
    showToast,
    setIsAiModalOpen 
  } = useApp();

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [rescheduleAppointmentData, setRescheduleAppointmentData] = useState<Appointment | undefined>(undefined);
  const [cancelAppointmentId, setCancelAppointmentId] = useState<string | null>(null);

  // Medication checklist state
  const [takenMeds, setTakenMeds] = useState<Record<string, boolean>>({
    'rx-1': true,
    'rx-2': false,
  });

  const toggleMedTaken = (rxId: string) => {
    setTakenMeds(prev => {
      const next = !prev[rxId];
      if (next) showToast('Marked dose as taken for today', 'success');
      return { ...prev, [rxId]: next };
    });
  };

  const upcomingAppointments = appointments
    .filter(a => a.status === 'Scheduled' || a.status === 'Rescheduled' || a.status === 'In Consultation')
    .slice(0, 3);

  const handleOpenReschedule = (apt: Appointment) => {
    setRescheduleAppointmentData(apt);
    setIsBookingModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (cancelAppointmentId) {
      cancelAppointment(cancelAppointmentId, 'Patient requested cancellation from dashboard');
      setCancelAppointmentId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-medblue-900 text-white rounded-3xl p-6 sm:p-8 shadow-elevated relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                ABHA Verified Patient
              </span>
              <span className="text-xs text-teal-200">ABHA: {patientProfile.abhaId}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Namaste, {patientProfile.name}
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
              Your digital health records and appointments are synchronized under Ayushman Bharat Digital Mission (ABDM) standards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setRescheduleAppointmentData(undefined);
                setIsBookingModalOpen(true);
              }}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 backdrop-blur-md transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span>AI Triage</span>
            </button>
          </div>
        </div>
      </div>

      {/* Symptom Search & Direct Booking Quick Card */}
      <div className="bg-white rounded-3xl border border-teal-200/90 p-5 shadow-card hover:border-teal-400 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-100 text-rose-600 rounded-lg">
              <HeartPulse className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-sm text-slate-900">Feeling Unwell? Search Specialists by Your Symptoms</h3>
          </div>
          <p className="text-xs text-slate-500">
            Select or describe what you're experiencing to get matched with the right specialist and book an appointment instantly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { label: 'Chest Pain', query: 'Chest Pain' },
            { label: 'Severe Headache', query: 'Severe Headache' },
            { label: 'High Sugar', query: 'High Blood Sugar' },
            { label: 'Knee Pain', query: 'Knee Pain' },
            { label: 'Child Cough', query: 'Child Cough' },
          ].map(s => (
            <Link
              key={s.label}
              to={`/doctors?symptom=${encodeURIComponent(s.query)}`}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 transition-colors"
            >
              {s.label}
            </Link>
          ))}
          <Link
            to="/doctors"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-2xs transition-colors flex items-center gap-1"
          >
            <span>Search All Symptoms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Health Vitals & Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Blood Group</span>
          <span className="text-lg font-bold text-slate-900 mt-1 block">{patientProfile.bloodGroup}</span>
          <span className="text-[10px] text-teal-600 font-medium">Verified in ABHA</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Last Blood Pressure</span>
          <span className="text-lg font-bold text-slate-900 mt-1 block">130 / 82 <span className="text-xs font-normal text-slate-500">mmHg</span></span>
          <span className="text-[10px] text-emerald-600 font-medium">Recorded Sep 14</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">HbA1c Level</span>
          <span className="text-lg font-bold text-slate-900 mt-1 block">7.1% <span className="text-xs font-normal text-slate-500">(HPLC)</span></span>
          <span className="text-[10px] text-teal-600 font-medium">Controlled Glycemic</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Known Allergies</span>
          <span className="text-xs font-bold text-rose-700 mt-1 block line-clamp-1">Penicillin, Sulfa</span>
          <span className="text-[10px] text-rose-600 font-medium">Critical Drug Alert</span>
        </div>
      </div>

      {/* Main Grid: Upcoming Appointments + Medication Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upcoming Appointments & Nearby Hospitals (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  Upcoming Doctor Consultations
                </h2>
                <p className="text-xs text-slate-500">Your scheduled clinic visits and tele-consultations</p>
              </div>
              <Link
                to="/patient/appointments"
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <span>View All ({appointments.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No active appointments scheduled. Click 'Book Appointment' to reserve a slot.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map(apt => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={apt.status} />
                        <span className="text-xs font-semibold text-slate-500">{apt.type}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{apt.doctorName}</h4>
                      <p className="text-xs text-slate-600 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{apt.hospitalName}</span>
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-semibold text-teal-800">
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                          {apt.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-teal-800">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          {apt.timeSlot}
                        </span>
                      </div>
                    </div>

                    {/* Reschedule & Cancel actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                      <button
                        onClick={() => handleOpenReschedule(apt)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs transition-colors"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => setCancelAppointmentId(apt.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nearby Hospitals & Emergency Beds */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  Nearby Empanelled Hospitals (Hyderabad)
                </h2>
                <p className="text-xs text-slate-500">Live demonstration bed capacity and trauma care wings</p>
              </div>
              <Link
                to="/hospitals"
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <span>Open Hospital Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockHospitals.slice(0, 2).map(h => (
                <div
                  key={h.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200">
                        {h.type}
                      </span>
                      <span className="text-emerald-700 font-bold">{h.availableBedsDemo} Demo Beds Avail</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{h.name.split(',')[0]}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{h.city} • ~{h.distanceKm} km away</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-500">Phone: {h.phone.split('/')[0]}</span>
                    <Link
                      to={`/hospitals/${h.id}`}
                      className="text-teal-700 font-bold hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Medication Reminders & Recent Lab Reports (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Daily Medication Reminders */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-600" />
                Medication Reminders
              </h3>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Today
              </span>
            </div>

            <div className="space-y-3">
              {mockPrescriptions.map(rx => {
                const isTaken = takenMeds[rx.id];
                return (
                  <div
                    key={rx.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      isTaken ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className={`text-xs font-bold ${isTaken ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                          {rx.medicineName}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{rx.dosage} • {rx.frequency}</p>
                      </div>
                      <button
                        onClick={() => toggleMedTaken(rx.id)}
                        className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
                          isTaken
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-600 border-slate-300 hover:border-teal-500'
                        }`}
                        title={isTaken ? 'Mark as Not Taken' : 'Mark as Taken'}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span className="text-[10px]">{isTaken ? 'Taken' : 'Take'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              to="/pharmacy/inventory"
              className="block text-center py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Order Medicine Refill
            </Link>
          </div>

          {/* Recent Diagnostic Reports */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                Recent Diagnostic Reports
              </h3>
              <Link to="/patient/records" className="text-xs font-semibold text-teal-600 hover:underline">
                All
              </Link>
            </div>

            <div className="space-y-3">
              {mockMedicalRecords.slice(0, 2).map(rec => (
                <div key={rec.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-teal-700">{rec.type}</span>
                    <span className="text-slate-400">{rec.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{rec.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{rec.summary}</p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{rec.fileSize}</span>
                    <button
                      onClick={() => showToast(`Mock download generated: ${rec.title}.pdf`, 'info')}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking and Reschedule Modal */}
      <AppointmentBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setRescheduleAppointmentData(undefined);
        }}
        appointmentToReschedule={rescheduleAppointmentData}
      />

      {/* Confirmation Dialog for Cancellations */}
      <ConfirmDialog
        isOpen={!!cancelAppointmentId}
        onClose={() => setCancelAppointmentId(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? The reserved slot will be released and any consultation fee will be refunded."
        confirmText="Yes, Cancel Appointment"
        cancelText="Keep Appointment"
        isDestructive={true}
      />
    </div>
  );
};
