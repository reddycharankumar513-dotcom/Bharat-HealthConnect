import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment, PrescriptionItem } from '../../types';
import { Modal } from '../../components/common/Modal';
import { mockDiagnosticTests } from '../../data/mockLabTests';
import { 
  FileText, 
  Pill, 
  FlaskConical, 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  User,
  Activity
} from 'lucide-react';

interface DoctorConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export const DoctorConsultationModal: React.FC<DoctorConsultationModalProps> = ({
  isOpen,
  onClose,
  appointment,
}) => {
  const { updateAppointmentStatus, showToast, addNotification } = useApp();

  const [clinicalNotes, setClinicalNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: 'rx-new-1',
      medicineName: 'Augmentin 625 Duo Tablet',
      dosage: '1 Tablet',
      frequency: 'Twice daily after meals',
      duration: '5 Days',
      instructions: 'Complete full course. Do not skip doses.',
    }
  ]);
  const [selectedLabTests, setSelectedLabTests] = useState<string[]>([]);
  const [followUpDate, setFollowUpDate] = useState('');

  if (!appointment) return null;

  const handleAddMedicine = () => {
    setPrescriptions(prev => [
      ...prev,
      {
        id: 'rx-new-' + Date.now(),
        medicineName: '',
        dosage: '1 Tablet',
        frequency: 'Once Daily',
        duration: '7 Days',
        instructions: 'Take after meals',
      }
    ]);
  };

  const handleRemoveMedicine = (id: string) => {
    setPrescriptions(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateMedicine = (id: string, field: keyof PrescriptionItem, value: string) => {
    setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const toggleLabTest = (testName: string) => {
    setSelectedLabTests(prev => 
      prev.includes(testName) ? prev.filter(t => t !== testName) : [...prev, testName]
    );
  };

  const handleCompleteConsultation = () => {
    const summary = `${clinicalNotes}\nPrescribed: ${prescriptions.map(p => p.medicineName).filter(Boolean).join(', ')}${
      selectedLabTests.length > 0 ? `\nLab Referrals: ${selectedLabTests.join(', ')}` : ''
    }${followUpDate ? `\nFollow-up: ${followUpDate}` : ''}`;

    updateAppointmentStatus(appointment.id, 'Completed', summary);

    addNotification({
      title: 'Consultation Completed & Prescription Issued',
      message: `Dr. Rajeshwar Rao has uploaded consultation notes and digital prescription for ${appointment.patientName}.`,
      category: 'appointment',
      targetRole: 'patient',
      actionUrl: '/patient/records'
    });

    showToast(`Consultation completed for ${appointment.patientName}!`, 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="OPD Clinical Consultation & Digital Prescription"
      subtitle={`Patient: ${appointment.patientName} (${appointment.patientAge || 48} Yrs) • Ref #${appointment.id}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Patient Vitals & Allergy Strip */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="text-amber-900 font-semibold">
              Patient Allergies: <strong>Penicillin, Sulfa drugs</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <span>BP: <strong>130/82 mmHg</strong></span>
            <span>•</span>
            <span>Blood Group: <strong>B+</strong></span>
            <span>•</span>
            <span>HbA1c: <strong>7.1%</strong></span>
          </div>
        </div>

        {/* Symptoms recorded */}
        <div className="text-xs text-slate-600">
          <span className="font-semibold text-slate-400 uppercase text-[10px] block">Chief Complaint:</span>
          <p className="mt-0.5 font-medium text-slate-800">{appointment.symptoms || 'General clinical review'}</p>
        </div>

        {/* Clinical Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            Clinical Observations & Diagnosis
          </label>
          <textarea
            rows={3}
            value={clinicalNotes}
            onChange={e => setClinicalNotes(e.target.value)}
            placeholder="Document physical examination findings, heart sounds, chest auscultation, diagnosis..."
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>

        {/* Digital Prescription Builder */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-teal-600" />
              Digital Prescription Items
            </label>
            <button
              type="button"
              onClick={handleAddMedicine}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Medicine</span>
            </button>
          </div>

          <div className="space-y-2">
            {prescriptions.map((p, idx) => (
              <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    placeholder="Medicine Name (e.g. Augmentin 625)"
                    value={p.medicineName}
                    onChange={e => handleUpdateMedicine(p.id, 'medicineName', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 1 Tablet)"
                    value={p.dosage}
                    onChange={e => handleUpdateMedicine(p.id, 'dosage', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    placeholder="Instructions (e.g. Twice daily after meals)"
                    value={p.instructions}
                    onChange={e => handleUpdateMedicine(p.id, 'instructions', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div className="sm:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicine(p.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnostic Test Referral */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
            Diagnostic Lab Test Referrals (Optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {mockDiagnosticTests.map(t => {
              const isSelected = selectedLabTests.includes(t.name);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleLabTest(t.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400'
                  }`}
                >
                  {t.name.split('(')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Follow-up Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            Recommended Follow-Up Date (Optional)
          </label>
          <input
            type="date"
            value={followUpDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => setFollowUpDate(e.target.value)}
            className="w-full sm:w-1/2 p-2 bg-white border border-slate-200 rounded-xl text-xs"
          />
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => updateAppointmentStatus(appointment.id, 'In Consultation')}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Mark In Consultation
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCompleteConsultation}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Sign & Complete Consultation</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
