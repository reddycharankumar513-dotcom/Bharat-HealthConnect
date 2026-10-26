import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Building2, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  Search,
  ExternalLink
} from 'lucide-react';

export const AdminProviderVerificationPage: React.FC = () => {
  const { verificationRequests, updateVerificationStatus, showToast } = useApp();

  const [filterType, setFilterType] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = verificationRequests.filter(req => {
    const matchesSearch = req.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || req.providerType === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-teal-600" />
          Provider Licensing Verification & Empanelment Queue
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review medical degrees, state medical council licenses, NABH certificates, and drug retail permits
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search provider name, registration no, license..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['All', 'Doctor', 'Hospital', 'Diagnostic Lab', 'Pharmacy'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterType === type ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Verifications Cards / Table */}
      <div className="space-y-4">
        {filtered.map(req => (
          <div
            key={req.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card hover:shadow-elevated transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {req.providerType}
                </span>
                <h3 className="font-bold text-base text-slate-900">{req.providerName}</h3>
                <StatusBadge status={req.status} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                <div>
                  <span className="text-slate-400">Reg / Accreditation: </span>
                  <strong className="font-mono text-slate-800">{req.regNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400">State License: </span>
                  <strong className="font-mono text-slate-800">{req.licenseNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Location: </span>
                  <span>{req.city}, {req.state}</span>
                </div>
                <div>
                  <span className="text-slate-400">Submitted: </span>
                  <span>{req.submittedAt}</span>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Submitted Credentials:
                </span>
                <div className="flex flex-wrap gap-2">
                  {req.documents.map((doc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => showToast(`Opening demo document preview: ${doc}`, 'info')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 text-xs rounded-lg transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              {req.status === 'Pending' ? (
                <>
                  <button
                    onClick={() => updateVerificationStatus(req.id, 'Verified')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Verify</span>
                  </button>
                  <button
                    onClick={() => updateVerificationStatus(req.id, 'Rejected')}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </>
              ) : (
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                  Decision Logged
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
