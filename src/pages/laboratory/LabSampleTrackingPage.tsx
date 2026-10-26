import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DiagnosticBooking, SampleStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LabReportApprovalModal } from './LabReportApprovalModal';
import { 
  ClipboardCheck, 
  Barcode, 
  Clock, 
  Truck, 
  FlaskConical, 
  ShieldCheck, 
  CheckCircle2, 
  User, 
  Search,
  ArrowRight
} from 'lucide-react';

export const LabSampleTrackingPage: React.FC = () => {
  const { diagnosticBookings, updateSampleStatus, showToast } = useApp();

  const [activeApproval, setActiveApproval] = useState<DiagnosticBooking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const stages: SampleStatus[] = [
    'Order Placed',
    'Sample Collected',
    'In Transit',
    'Processing',
    'Verified & Approved',
    'Delivered to Patient'
  ];

  const getStageIndex = (status: SampleStatus) => {
    const idx = stages.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  const handleAdvanceStage = (booking: DiagnosticBooking) => {
    const currentIdx = getStageIndex(booking.status);
    if (currentIdx < stages.length - 1) {
      const nextStage = stages[currentIdx + 1];

      // If advancing to Verified & Approved, launch approval modal
      if (nextStage === 'Verified & Approved') {
        setActiveApproval(booking);
      } else {
        updateSampleStatus(booking.id, nextStage);
      }
    }
  };

  const filteredBookings = diagnosticBookings.filter(b => 
    b.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.sampleBarcode && b.sampleBarcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-teal-600" />
          Phlebotomy Sample Tracking & Lifecycle Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor specimen collection, automated barcode generation, cold transport, and pathologist sign-off
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Barcode, Booking Ref, Patient name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Bookings Tracking Cards */}
      <div className="space-y-4">
        {filteredBookings.map(booking => {
          const currentStageIdx = getStageIndex(booking.status);

          return (
            <div
              key={booking.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card hover:shadow-elevated transition-all space-y-5"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      Ref: {booking.bookingRef}
                    </span>
                    <StatusBadge status={booking.status} />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{booking.testName}</h3>
                  <p className="text-xs text-slate-500">
                    Patient: <strong>{booking.patientName}</strong> ({booking.patientPhone}) • {booking.collectionType}
                  </p>
                </div>

                <div className="text-left sm:text-right text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-slate-700 font-bold bg-slate-100 px-2.5 py-1 rounded-lg">
                    <Barcode className="w-4 h-4 text-slate-500" />
                    <span>{booking.sampleBarcode || 'BAR-AUTO-GEN'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Scheduled: {booking.scheduledDate} at {booking.scheduledTime}
                  </span>
                </div>
              </div>

              {/* Multi-step Visual Progress Bar */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-[10px] font-semibold text-slate-600">
                  {stages.map((stg, idx) => {
                    const isCompleted = idx <= currentStageIdx;
                    const isCurrent = idx === currentStageIdx;

                    return (
                      <div
                        key={stg}
                        className={`p-2 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-teal-600 text-white border-teal-600 shadow-2xs font-bold'
                            : isCompleted
                              ? 'bg-teal-50 text-teal-800 border-teal-200'
                              : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}
                      >
                        <span className="block">{idx + 1}. {stg}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assigned Technician & Workflow Advance Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500">
                  Phlebotomist: <strong>{booking.technicianName || 'Assigned to Area Phlebotomy Lead'}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {currentStageIdx < stages.length - 1 && (
                    <button
                      onClick={() => handleAdvanceStage(booking)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <span>Advance to: {stages[currentStageIdx + 1]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {booking.status === 'Processing' && (
                    <button
                      onClick={() => setActiveApproval(booking)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Sign Diagnostic Report</span>
                    </button>
                  )}

                  {booking.status === 'Delivered to Patient' && (
                    <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Report Delivered to Patient ABHA Locker
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <LabReportApprovalModal
        isOpen={!!activeApproval}
        onClose={() => setActiveApproval(null)}
        booking={activeApproval}
      />
    </div>
  );
};
