import React, { useState } from 'react';
import { mockDisputes } from '../../data/mockAdmin';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useApp } from '../../context/AppContext';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  MessageSquare,
  Search
} from 'lucide-react';

export const AdminDisputesPage: React.FC = () => {
  const { showToast } = useApp();
  const [disputes, setDisputes] = useState([...mockDisputes]);

  const handleResolve = (id: string) => {
    setDisputes(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: 'Resolved',
          resolutionNotes: 'Dispute resolved and verified by Central Platform Grievance Officer.'
        };
      }
      return d;
    }));
    showToast('Dispute marked as Resolved', 'success');
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-purple-600" />
          Multi-Stakeholder Dispute Mediation & Grievance Cell
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Arbitration for inter-stakeholder disputes between patients, pharmacies, hospitals, and diagnostic labs
        </p>
      </div>

      <div className="space-y-4">
        {disputes.map(disp => (
          <div
            key={disp.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card hover:shadow-elevated transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-500">{disp.ticketNumber}</span>
                  <StatusBadge status={disp.status} />
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    disp.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {disp.priority} Priority
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 mt-1">{disp.subject}</h3>
              </div>

              <span className="text-xs text-slate-400">Filed: {disp.date}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400">Complainant:</span>
                <strong className="block text-slate-900">{disp.complainant}</strong>
              </div>
              <div>
                <span className="text-slate-400">Respondent:</span>
                <strong className="block text-slate-900">{disp.against}</strong>
              </div>
            </div>

            <div className="text-xs text-slate-600">
              <span className="font-bold text-slate-800 block text-[11px] mb-0.5">Resolution Trail:</span>
              <p className="leading-relaxed">{disp.resolutionNotes}</p>
            </div>

            {disp.status !== 'Resolved' && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleResolve(disp.id)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Execute Settlement Resolution</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
