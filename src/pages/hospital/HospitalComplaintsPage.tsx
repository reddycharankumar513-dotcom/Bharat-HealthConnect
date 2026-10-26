import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Search, 
  ShieldCheck,
  User
} from 'lucide-react';

interface HospitalComplaint {
  id: string;
  ticketNo: string;
  patientName: string;
  department: string;
  date: string;
  category: 'Billing' | 'Wait Time' | 'Staff Conduct' | 'Facility / Cleanliness' | 'Pharmacy';
  subject: string;
  details: string;
  status: 'Open' | 'Under Investigation' | 'Resolved';
  resolutionNotes?: string;
}

export const HospitalComplaintsPage: React.FC = () => {
  const { showToast } = useApp();

  const [complaints, setComplaints] = useState<HospitalComplaint[]>([
    {
      id: 'cmp-1',
      ticketNo: 'HOSP-GRV-2026-081',
      patientName: 'Ramesh Sharma',
      department: 'OPD Billing',
      date: '2026-10-24',
      category: 'Billing',
      subject: 'Delay in cashless ABHA claim authorization for 2D Echo',
      details: 'Patient had to wait 45 minutes at Counter #3 while ABHA pre-authorization API synchronization was delayed.',
      status: 'Resolved',
      resolutionNotes: 'ABHA API integration failover switched to secondary gateway. Reimbursement confirmed with TPA.',
    },
    {
      id: 'cmp-2',
      ticketNo: 'HOSP-GRV-2026-082',
      patientName: 'K. Sunitha Devi',
      department: 'Emergency & Trauma',
      date: '2026-10-25',
      category: 'Wait Time',
      subject: 'Triage response delay during evening peak shift',
      details: 'Attendants reported delay in doctor assignment for non-critical trauma patient.',
      status: 'Under Investigation',
      resolutionNotes: 'Casualty duty roster being reviewed by Dr. Vikram Chandra.',
    },
    {
      id: 'cmp-3',
      ticketNo: 'HOSP-GRV-2026-083',
      patientName: 'Mohammed Aslam',
      department: 'In-Patient Pharmacy',
      date: '2026-10-26',
      category: 'Pharmacy',
      subject: 'Temporary out-of-stock for specialized anti-coagulant injection',
      details: 'Medicine counter did not have stock ready for immediate discharge dispense.',
      status: 'Open',
    }
  ]);

  const handleResolveComplaint = (id: string) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'Resolved',
          resolutionNotes: 'Resolution verified by Hospital Patient Relations Officer.'
        };
      }
      return c;
    }));
    showToast('Complaint status marked as Resolved', 'success');
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-teal-600" />
          Patient Grievance Redressal & Quality Feedback
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor service delivery complaints, investigate clinical delays, and record resolutions under NABH protocols
        </p>
      </div>

      <div className="space-y-4">
        {complaints.map(comp => (
          <div
            key={comp.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card hover:shadow-elevated transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500">{comp.ticketNo}</span>
                  <StatusBadge status={comp.status} />
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {comp.category}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 mt-1">{comp.subject}</h3>
              </div>

              <div className="text-right text-xs text-slate-500">
                <span>Date: {comp.date}</span>
                <span className="block font-medium text-slate-700">{comp.department}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="font-semibold text-slate-800">Complainant:</span> {comp.patientName} — "{comp.details}"
            </p>

            {comp.resolutionNotes && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                <strong className="text-emerald-800 block">Resolution Action Recorded:</strong>
                <p className="mt-0.5">{comp.resolutionNotes}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-slate-400">Tracked under NABH Patient Charter</span>
              {comp.status !== 'Resolved' && (
                <button
                  onClick={() => handleResolveComplaint(comp.id)}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark as Resolved</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
