import React, { useState } from 'react';
import { mockDoctors } from '../../data/mockDoctors';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Stethoscope, 
  ShieldCheck, 
  Search, 
  Plus, 
  Key, 
  CheckCircle2, 
  X,
  Mail,
  Phone
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  accessLevel: 'Full Hospital Admin' | 'Clinical OPD' | 'Emergency Ward' | 'Reception & Triage';
  status: 'Active' | 'On Leave';
  phone: string;
}

export const HospitalStaffPage: React.FC = () => {
  const { showToast } = useApp();

  const [staffList, setStaffList] = useState<StaffMember[]>([
    {
      id: 'stf-1',
      name: 'Dr. Rajeshwar Rao, MD, DM',
      role: 'Chief Interventional Cardiologist',
      department: 'Cardiology',
      accessLevel: 'Clinical OPD',
      status: 'Active',
      phone: '+91 98490 22334',
    },
    {
      id: 'stf-2',
      name: 'Dr. Vikram Chandra, MS',
      role: 'Trauma & Emergency Casualty Head',
      department: 'Emergency & Trauma',
      accessLevel: 'Emergency Ward',
      status: 'Active',
      phone: '+91 98490 33445',
    },
    {
      id: 'stf-3',
      name: 'S. Radhika, M.Sc (Nursing)',
      role: 'Head Nurse - Critical Care ICU',
      department: 'Intensive Care',
      accessLevel: 'Clinical OPD',
      status: 'Active',
      phone: '+91 98490 55667',
    },
    {
      id: 'stf-4',
      name: 'K. Venkatesh',
      role: 'Senior OPD Registrar & ABHA Desk',
      department: 'Admissions & Reception',
      accessLevel: 'Reception & Triage',
      status: 'Active',
      phone: '+91 98490 66778',
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const toggleStaffStatus = (id: string) => {
    setStaffList(prev => prev.map(s => {
      if (s.id === id) {
        const next = s.status === 'Active' ? 'On Leave' : 'Active';
        showToast(`${s.name} marked as ${next}`, 'info');
        return { ...s, status: next };
      }
      return s;
    }));
  };

  const filtered = staffList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            Hospital Staff Roster & Role-Based Access
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage medical duty rosters, credentials, and departmental system permissions
          </p>
        </div>

        <button
          onClick={() => showToast('Demo prompt: Invite new medical officer or clinical staff', 'info')}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by staff name, role, department..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Staff Name & Designation</th>
                <th className="p-4">Department</th>
                <th className="p-4">Access Level</th>
                <th className="p-4">Duty Status</th>
                <th className="p-4">Contact Phone</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(member => (
                <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4">
                    <strong className="block text-slate-900 font-bold text-sm">{member.name}</strong>
                    <span className="text-slate-500 text-[11px]">{member.role}</span>
                  </td>
                  <td className="p-4 text-slate-700 font-medium">{member.department}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {member.accessLevel}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      member.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {member.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 font-mono text-[11px]">{member.phone}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleStaffStatus(member.id)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      {member.status === 'Active' ? 'Mark Leave' : 'Mark Active'}
                    </button>
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
