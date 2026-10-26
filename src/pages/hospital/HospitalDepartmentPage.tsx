import React, { useState } from 'react';
import { mockHospitals } from '../../data/mockHospitals';
import { useApp } from '../../context/AppContext';
import { Building2, Plus, Bed, Users, Clock, CheckCircle2, Save } from 'lucide-react';

interface DepartmentData {
  id: string;
  name: string;
  headOfDept: string;
  totalBeds: number;
  availableBeds: number;
  doctorsCount: number;
  opdHours: string;
}

export const HospitalDepartmentPage: React.FC = () => {
  const { showToast } = useApp();

  const [departments, setDepartments] = useState<DepartmentData[]>([
    {
      id: 'dept-1',
      name: 'Cardiology & Heart Institute',
      headOfDept: 'Dr. Rajeshwar Rao, MD, DM',
      totalBeds: 120,
      availableBeds: 14,
      doctorsCount: 8,
      opdHours: '08:30 AM - 05:00 PM',
    },
    {
      id: 'dept-2',
      name: 'Medical & Surgical Oncology',
      headOfDept: 'Dr. Ramesh Nambiar, MCh',
      totalBeds: 90,
      availableBeds: 8,
      doctorsCount: 6,
      opdHours: '09:00 AM - 04:30 PM',
    },
    {
      id: 'dept-3',
      name: 'Neurology & Neurosurgery',
      headOfDept: 'Dr. Arvind Swaminathan, MCh',
      totalBeds: 80,
      availableBeds: 12,
      doctorsCount: 5,
      opdHours: '09:00 AM - 05:00 PM',
    },
    {
      id: 'dept-4',
      name: 'Orthopedics & Joint Replacement',
      headOfDept: 'Dr. Pradeep Narang, MS',
      totalBeds: 75,
      availableBeds: 9,
      doctorsCount: 4,
      opdHours: '08:00 AM - 04:00 PM',
    },
    {
      id: 'dept-5',
      name: 'Pediatrics & Neonatal Intensive Care',
      headOfDept: 'Dr. Kavitha Reddy, MD, DCH',
      totalBeds: 60,
      availableBeds: 15,
      doctorsCount: 6,
      opdHours: '09:00 AM - 06:00 PM',
    },
    {
      id: 'dept-6',
      name: '24x7 Emergency Casualty & Trauma',
      headOfDept: 'Dr. Vikram Chandra, MD (Emergency)',
      totalBeds: 45,
      availableBeds: 6,
      doctorsCount: 12,
      opdHours: '24 Hours / 7 Days',
    }
  ]);

  const handleAdjustBeds = (id: string, delta: number) => {
    setDepartments(prev => prev.map(d => {
      if (d.id === id) {
        const next = Math.max(0, Math.min(d.totalBeds, d.availableBeds + delta));
        return { ...d, availableBeds: next };
      }
      return d;
    }));
    showToast('Department bed availability updated in demo', 'info');
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Building2 className="w-6 h-6 text-teal-600" />
          Hospital Department & Bed Capacity Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor specialized clinical blocks, HOD allocations, and adjust demo in-patient bed counts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(dept => (
          <div
            key={dept.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  Active Department
                </span>
                <span className="text-xs font-semibold text-slate-500">{dept.doctorsCount} Specialists</span>
              </div>

              <h3 className="font-bold text-base text-slate-900">{dept.name}</h3>
              <p className="text-xs text-slate-500">
                Head of Dept: <strong className="text-slate-800">{dept.headOfDept}</strong>
              </p>

              {/* Bed metrics */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Total Sanctioned:</span>
                  <strong className="text-slate-900">{dept.totalBeds} Beds</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Available (Demo):</span>
                  <strong className="text-emerald-600">{dept.availableBeds} Free</strong>
                </div>
                {/* Adjust buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-[10px] text-slate-400">Quick Demo Adjust:</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleAdjustBeds(dept.id, -1)}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-bold hover:bg-slate-100"
                      title="Admit Patient (-1 Bed)"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => handleAdjustBeds(dept.id, 1)}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-bold hover:bg-slate-100"
                      title="Discharge Patient (+1 Bed)"
                    >
                      +1
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>OPD Hours: {dept.opdHours}</span>
              </div>
            </div>

            <button
              onClick={() => showToast(`Department configuration updated for ${dept.name}`, 'success')}
              className="w-full py-2 bg-slate-100 hover:bg-teal-50 text-slate-800 hover:text-teal-800 font-semibold text-xs rounded-xl transition-colors"
            >
              Configure Schedule & Slots
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
