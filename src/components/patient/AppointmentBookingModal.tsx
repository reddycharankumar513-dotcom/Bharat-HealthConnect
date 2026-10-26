import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Doctor, Hospital, Appointment } from '../../types';
import { mockDoctors } from '../../data/mockDoctors';
import { mockHospitals } from '../../data/mockHospitals';
import { Modal } from '../common/Modal';
import { 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  CheckCircle2, 
  CreditCard, 
  AlertCircle,
  Stethoscope,
  HeartPulse,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDoctorId?: string;
  preselectedHospitalId?: string;
  appointmentToReschedule?: Appointment;
  initialSymptoms?: string;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  preselectedDoctorId,
  preselectedHospitalId,
  appointmentToReschedule,
  initialSymptoms,
}) => {
  const navigate = useNavigate();
  const { 
    patientProfile, 
    bookAppointment, 
    rescheduleAppointment, 
    appointments 
  } = useApp();

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(preselectedDoctorId || mockDoctors[0].id);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string>('10:30 AM');
  const [consultationType, setConsultationType] = useState<'In-Person' | 'Tele-Consultation'>('In-Person');
  const [symptoms, setSymptoms] = useState('');
  const [step, setStep] = useState<'details' | 'confirm' | 'success'>('details');
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (preselectedDoctorId) {
      setSelectedDoctorId(preselectedDoctorId);
    }
    if (appointmentToReschedule) {
      setSelectedDoctorId(appointmentToReschedule.doctorId);
      setSelectedDate(appointmentToReschedule.date);
      setSelectedSlot(appointmentToReschedule.timeSlot);
      setConsultationType(appointmentToReschedule.type);
      setSymptoms(appointmentToReschedule.symptoms || '');
    } else if (initialSymptoms) {
      setSymptoms(initialSymptoms);
    }
    if (isOpen) {
      setStep('details');
    }
  }, [preselectedDoctorId, appointmentToReschedule, initialSymptoms, isOpen]);

  const doctor = mockDoctors.find(d => d.id === selectedDoctorId) || mockDoctors[0];
  const hospital = mockHospitals.find(h => h.id === doctor.hospitalId) || mockHospitals[0];

  // Available slots for doctor
  const availableSlots = doctor.availableSlots || [
    '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:30 PM', '04:30 PM'
  ];

  // Check if a slot is already taken in demo
  const isSlotBooked = (slot: string) => {
    return appointments.some(
      a => a.doctorId === doctor.id && 
           a.date === selectedDate && 
           a.timeSlot === slot && 
           a.status !== 'Cancelled' &&
           (!appointmentToReschedule || a.id !== appointmentToReschedule.id)
    );
  };

  const handleBookingSubmit = () => {
    if (appointmentToReschedule) {
      const res = rescheduleAppointment(appointmentToReschedule.id, selectedDate, selectedSlot);
      if (res.success) {
        onClose();
      }
    } else {
      const res = bookAppointment({
        patientId: patientProfile.id,
        patientName: patientProfile.name,
        patientPhone: patientProfile.phone,
        patientAge: 48,
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        date: selectedDate,
        timeSlot: selectedSlot,
        type: consultationType,
        fee: doctor.consultationFee,
        symptoms: symptoms || 'General symptom consultation',
      });

      if (res.success && res.appointment) {
        setConfirmedAppointment(res.appointment);
        setStep('success');
      }
    }
  };

  const handleGoToAppointments = () => {
    onClose();
    navigate('/patient/appointments');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === 'success'
          ? 'Appointment Confirmed!'
          : appointmentToReschedule
            ? 'Reschedule Appointment'
            : 'Book Doctor Appointment'
      }
      subtitle={
        step === 'success'
          ? 'Your slot has been reserved in your demo profile'
          : appointmentToReschedule
            ? 'Reserve a new demo slot'
            : 'Select consultation date, time, and record your symptoms'
      }
      maxWidth="lg"
    >
      <div className="space-y-5">
        {step === 'details' && (
          <>
            {/* Selected Doctor Summary */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
              />
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-900">{doctor.name}</h4>
                <p className="text-xs text-teal-700 font-medium">{doctor.specialty} • {hospital.name.split(',')[0]}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                  <span>Fee: <strong>₹{doctor.consultationFee}</strong></span>
                  <span>•</span>
                  <span>Languages: {doctor.languages.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Doctor Picker if not preselected */}
            {!appointmentToReschedule && !preselectedDoctorId && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Doctor
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={e => setSelectedDoctorId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  {mockDoctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} - {doc.specialty} (₹{doc.consultationFee})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Consultation Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Consultation Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConsultationType('In-Person')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    consultationType === 'In-Person'
                      ? 'border-teal-600 bg-teal-50 text-teal-800 ring-1 ring-teal-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span>In-Person Hospital Visit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConsultationType('Tele-Consultation')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    consultationType === 'Tele-Consultation'
                      ? 'border-teal-600 bg-teal-50 text-teal-800 ring-1 ring-teal-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <span>Secure Video Consultation</span>
                </button>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                Select Appointment Date
              </label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            {/* Time Slots */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                Available Time Slots
              </label>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map(slot => {
                  const booked = isSlotBooked(slot);
                  const isSelected = selectedSlot === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={booked}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        booked
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                          : isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400'
                      }`}
                    >
                      {slot}
                      {booked && <span className="block text-[9px] font-normal">Booked</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Symptoms / Chief Complaint (Pre-filled from symptom search) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                  Reason for Visit / Reported Symptoms
                </span>
                {initialSymptoms && (
                  <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    Pre-filled from Symptom Search
                  </span>
                )}
              </label>
              <textarea
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                rows={2}
                placeholder="e.g. Chest tightness on exertion, high fasting sugar, chronic knee pain..."
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            {/* Next Button */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep('confirm')}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                Review & Confirm
              </button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          /* Confirmation Screen */
          <div className="space-y-4">
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Appointment Summary</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <strong>{patientProfile.name} (ABHA: {patientProfile.abhaId})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Doctor:</span>
                  <strong>{doctor.name} ({doctor.specialty})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hospital:</span>
                  <span>{hospital.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Slot:</span>
                  <strong>{selectedDate} at {selectedSlot}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Consultation Mode:</span>
                  <span>{consultationType}</span>
                </div>
                {symptoms && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reported Symptoms:</span>
                    <strong className="text-slate-900">{symptoms}</strong>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-teal-200/60 text-slate-900 font-bold text-sm">
                  <span>Consultation Fee:</span>
                  <span className="text-teal-700">₹{doctor.consultationFee} (Demo Settled)</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              * By confirming, this time slot will be reserved in your demo profile. You can reschedule or cancel at any time from your patient dashboard.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleBookingSubmit}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                {appointmentToReschedule ? 'Confirm Reschedule' : 'Confirm & Reserve Slot'}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && confirmedAppointment && (
          /* Success Screen */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Appointment Booked Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Your consultation slot with <strong>{confirmedAppointment.doctorName}</strong> has been locked and confirmed.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2 text-left max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">Date & Time:</span>
                <strong>{confirmedAppointment.date} at {confirmedAppointment.timeSlot}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Doctor:</span>
                <span>{confirmedAppointment.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hospital:</span>
                <span className="truncate max-w-[170px]">{confirmedAppointment.hospitalName}</span>
              </div>
              {confirmedAppointment.symptoms && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Symptoms:</span>
                  <strong className="text-teal-800">{confirmedAppointment.symptoms}</strong>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-slate-200/60 font-mono text-[11px]">
                <span className="text-slate-400">Booking Ref:</span>
                <strong>#{confirmedAppointment.id}</strong>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleGoToAppointments}
                className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View in My Appointments</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
