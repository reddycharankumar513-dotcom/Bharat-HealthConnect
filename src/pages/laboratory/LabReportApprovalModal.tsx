import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DiagnosticBooking } from '../../types';
import { Modal } from '../../components/common/Modal';
import { 
  FlaskConical, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  User, 
  AlertTriangle 
} from 'lucide-react';

interface LabReportApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: DiagnosticBooking | null;
}

export const LabReportApprovalModal: React.FC<LabReportApprovalModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const { uploadReport, showToast } = useApp();

  const [verifiedBy, setVerifiedBy] = useState('Dr. Neha Agarwal, MD (Pathology)');
  const [reportFindings, setReportFindings] = useState(
    'All analytical parameters verified within physiological reference limits on automated 6-part analyzer. Quality control standards checked.'
  );

  if (!booking) return null;

  const handleApprove = () => {
    uploadReport(booking.id, '#mock-report-' + booking.bookingRef, verifiedBy);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pathologist Report Verification & Digital Signature"
      subtitle={`Sample Ref: ${booking.bookingRef} • Patient: ${booking.patientName}`}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Mandatory Demo Disclaimer */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Demo Clinical Data:</strong> All diagnostic report metrics and analytical values are simulated test data for prototype demonstration.
          </span>
        </div>

        {/* Sample Card */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Test Ordered:</span>
            <strong className="text-slate-900">{booking.testName}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Barcode Identifier:</span>
            <span className="font-mono font-bold text-slate-800">{booking.sampleBarcode || 'BAR-992144'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Collection Type:</span>
            <span>{booking.collectionType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Scheduled Date:</span>
            <span>{booking.scheduledDate} at {booking.scheduledTime}</span>
          </div>
        </div>

        {/* Pathologist Clinical Observations */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            Pathologist Observations & Quality Verification
          </label>
          <textarea
            rows={3}
            value={reportFindings}
            onChange={e => setReportFindings(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
          />
        </div>

        {/* Verified By Doctor Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Authorizing Pathologist
          </label>
          <input
            type="text"
            value={verifiedBy}
            onChange={e => setVerifiedBy(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800"
          />
        </div>

        {/* Actions */}
        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApprove}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Digitally Sign & Deliver to Patient</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
