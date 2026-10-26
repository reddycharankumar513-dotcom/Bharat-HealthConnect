import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { mockMedicalRecords, mockPrescriptions } from '../../data/mockRecords';
import { 
  FileText, 
  Pill, 
  ShieldAlert, 
  Download, 
  Share2, 
  CheckCircle2, 
  Eye, 
  Lock, 
  Calendar, 
  Building2, 
  Stethoscope,
  Info
} from 'lucide-react';

export const PatientMedicalRecordsPage: React.FC = () => {
  const { patientProfile, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'records' | 'prescriptions' | 'consent'>('records');

  // Consent sharing state demo
  const [sharingPermissions, setSharingPermissions] = useState<Record<string, boolean>>({
    'Apollo Health City': true,
    'NIMS Hyderabad': true,
    'Bharat Diagnostic Hub': true,
    'Third-Party Research Analytics': false,
  });

  const toggleConsent = (provider: string) => {
    setSharingPermissions(prev => {
      const next = !prev[provider];
      showToast(`Consent ${next ? 'Granted' : 'Revoked'} for ${provider}`, next ? 'success' : 'warning');
      return { ...prev, [provider]: next };
    });
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-600" />
            Electronic Health Records (ABHA Locker)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Linked to ABHA: <strong className="text-slate-800">{patientProfile.abhaId}</strong> • Encrypted FHIR-compliant records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Consent Controlled
          </span>
        </div>
      </div>

      {/* Critical Allergy & Conditions Alert Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-xl flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-900">Patient Allergies & Chronic Conditions</h4>
            <p className="text-xs text-amber-800 mt-0.5">
              Allergies: <strong>{patientProfile.allergies.join(', ')}</strong> | Conditions: {patientProfile.chronicConditions.join('; ')}
            </p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md whitespace-nowrap">
          Clinician Flag
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('records')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'records' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Diagnostic Reports & Summaries
        </button>
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'prescriptions' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active Digital Prescriptions
        </button>
        <button
          onClick={() => setActiveTab('consent')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'consent' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ABHA Data Consent & Sharing Controls
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {mockMedicalRecords.map(rec => (
            <div
              key={rec.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      {rec.type}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {rec.date}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mt-1">{rec.title}</h3>
                </div>

                <div className="text-right text-xs">
                  <span className="font-medium text-slate-700 block">{rec.doctorName}</span>
                  <span className="text-slate-400 text-[11px]">{rec.hospitalName}</span>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-900 block">Clinical Summary:</span>
                <p className="leading-relaxed">{rec.summary}</p>
                <p className="text-slate-500 pt-1 text-[11px] italic">{rec.details}</p>
              </div>

              {/* Footer with mock download */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">File format: {rec.fileSize}</span>
                <button
                  onClick={() => showToast(`Mock report downloaded: ${rec.title}.pdf`, 'info')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Verified PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-600" />
              Active Medication Regimen
            </h3>
            <p className="text-xs text-slate-500">
              Prescribed by Dr. Rajeshwar Rao (Cardiology) and Dr. Sunita Deshmukh (Diabetology)
            </p>

            <div className="divide-y divide-slate-100">
              {mockPrescriptions.map(rx => (
                <div key={rx.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-900">{rx.medicineName}</h4>
                    <p className="text-xs text-teal-700 font-semibold">{rx.dosage} • {rx.frequency}</p>
                    <p className="text-xs text-slate-500">{rx.instructions}</p>
                  </div>
                  <div className="text-right flex items-center sm:flex-col gap-2 sm:gap-1">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      Duration: {rx.duration}
                    </span>
                    <button
                      onClick={() => showToast(`Refill request placed for ${rx.medicineName}`, 'success')}
                      className="text-xs font-bold text-teal-700 hover:underline"
                    >
                      Request Refill →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'consent' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-teal-600" />
              ABHA Consent Manager
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Under India's Digital Personal Data Protection (DPDP) Act and ABDM protocols, you have full ownership over which healthcare institutions can access your medical history.
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(sharingPermissions).map(([provider, isAllowed]) => (
              <div
                key={provider}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{provider}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isAllowed ? 'Can view diagnostic reports and past prescriptions' : 'Access blocked'}
                  </p>
                </div>

                <button
                  onClick={() => toggleConsent(provider)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    isAllowed
                      ? 'bg-emerald-600 text-white shadow-2xs hover:bg-emerald-700'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {isAllowed ? 'Granted (Revoke)' : 'Revoked (Allow)'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
