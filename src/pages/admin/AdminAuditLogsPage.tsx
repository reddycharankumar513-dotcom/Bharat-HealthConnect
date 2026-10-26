import React from 'react';
import { mockAuditLogs } from '../../data/mockAdmin';
import { 
  ShieldCheck, 
  Lock, 
  Server, 
  Search, 
  FileText, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-purple-600" />
          Security Audit Trails & Data Governance Logs
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable event log of all digital signatures, state changes, and ABHA authorization handshakes
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Timestamp (IST)</th>
                <th className="p-4">System Actor</th>
                <th className="p-4">Role</th>
                <th className="p-4">Action Performed</th>
                <th className="p-4">Target Resource</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockAuditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-mono text-slate-500">{log.timestamp}</td>
                  <td className="p-4 font-bold text-slate-900">{log.actor}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      {log.role}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-800">{log.action}</td>
                  <td className="p-4 text-slate-600">{log.resource}</td>
                  <td className="p-4 font-mono text-slate-400">{log.ipAddress}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      log.status === 'Success'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
