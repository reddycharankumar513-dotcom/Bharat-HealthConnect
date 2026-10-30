import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TiltCard3D } from '../../components/common/TiltCard3D';
import { 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  User, 
  BedDouble, 
  Search, 
  Filter, 
  X,
  Play,
  Check
} from 'lucide-react';

interface CleaningTask {
  id: string;
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';
  assignedStaffName?: string;
  startedAt?: string;
  completedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
  createdAt: string;
  bed: {
    id: string;
    bedNumber: string;
    bedCategory: string;
    status: string;
    ward: {
      name: string;
      wardType: string;
      floor: string;
    };
    room: {
      roomNumber: string;
    };
  };
}

export const HospitalCleaningPage: React.FC = () => {
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quick Action Modal
  const [selectedTask, setSelectedTask] = useState<CleaningTask | null>(null);
  const [staffName, setStaffName] = useState('');
  const [actionNotes, setActionNotes] = useState('');

  const fetchCleaningTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/beds/cleaning');
      if (res.success) {
        setTasks(res.tasks);
      }
    } catch (err) {
      console.error('Error fetching cleaning tasks:', err);
      setMessage({ type: 'error', text: 'Failed to load cleaning tasks.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCleaningTasks();
  }, []);

  const handleUpdateStatus = async (taskId: string, targetStatus: string, customStaff?: string, notes?: string) => {
    try {
      const res = await api.patch(`/beds/cleaning/${taskId}/status`, {
        status: targetStatus,
        assignedStaffName: customStaff || staffName || undefined,
        notes: notes || actionNotes || undefined
      });

      if (res.success) {
        setMessage({ type: 'success', text: res.message || `Task updated to ${targetStatus}` });
        setSelectedTask(null);
        setStaffName('');
        setActionNotes('');
        fetchCleaningTasks();
      } else {
        setMessage({ type: 'error', text: res.message || 'Status update failed.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error updating cleaning task.' });
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  const getStatusBadge = (status: CleaningTask['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'ASSIGNED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'COMPLETED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'VERIFIED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Deck */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-3d-float border border-indigo-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-500/25 text-orange-200 border border-orange-400/30">
            Infection Control & Sanitization Hub
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2">Housekeeping & Bed Sanitation</h1>
          <p className="text-xs text-slate-300 mt-1">
            Enforces strict terminal disinfection protocols. Beds are officially certified AVAILABLE only after supervisor verification.
          </p>
        </div>

        <button
          onClick={fetchCleaningTasks}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center justify-between border ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <span className="text-sm font-medium">{message.text}</span>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED'].map((st) => {
          const count = tasks.filter(t => t.status === st).length;
          return (
            <div
              key={st}
              onClick={() => setFilterStatus(filterStatus === st ? 'ALL' : st)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                filterStatus === st ? 'ring-2 ring-indigo-500 bg-indigo-50/50' : 'bg-white hover:bg-slate-50'
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-slate-500">{st.replace('_', ' ')}</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Tasks Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Sanitation Work Orders ({filteredTasks.length})</h3>
          <span className="text-xs text-slate-500">Filter: <strong>{filterStatus}</strong></span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading housekeeping roster...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl text-center border border-slate-200 text-slate-400 text-xs">
            No active cleaning tasks in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TiltCard3D key={task.id} maxTilt={6} scale={1.01} className="rounded-2xl">
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-3d-card space-y-4 flex flex-col justify-between h-full">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-slate-900">{task.bed.bedNumber}</span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {task.bed.bedCategory}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {task.bed.ward.name} • Room {task.bed.room.roomNumber}
                        </span>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${getStatusBadge(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    {task.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        {task.notes}
                      </p>
                    )}

                    <div className="space-y-1 text-slate-600 text-xs pt-1 border-t border-slate-100">
                      <div className="flex justify-between text-[11px]">
                        <span>Assigned Staff:</span>
                        <strong className="text-slate-900">{task.assignedStaffName || 'Unassigned'}</strong>
                      </div>
                      {task.startedAt && (
                        <div className="flex justify-between text-[11px]">
                          <span>Started:</span>
                          <span>{new Date(task.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                      {task.completedAt && (
                        <div className="flex justify-between text-[11px]">
                          <span>Completed:</span>
                          <span>{new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                      {task.verifiedBy && (
                        <div className="flex justify-between text-[11px] text-emerald-700 font-semibold">
                          <span>Verified by:</span>
                          <span>{task.verifiedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Workflow Action Bar */}
                  <div className="pt-3 border-t border-slate-100">
                    {task.status === 'PENDING' && (
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          handleUpdateStatus(task.id, 'ASSIGNED', 'Ravi Kumar (Sanitation Team A)');
                        }}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm"
                      >
                        Assign Sanitation Staff
                      </button>
                    )}

                    {task.status === 'ASSIGNED' && (
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                        className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Cleaning Work</span>
                      </button>
                    )}

                    {task.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Cleaning Completed</span>
                      </button>
                    )}

                    {task.status === 'COMPLETED' && (
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'VERIFIED')}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-3d-button flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Supervisor Inspect & Certify AVAILABLE</span>
                      </button>
                    )}

                    {task.status === 'VERIFIED' && (
                      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 py-1.5 rounded-xl">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Certified Sterile & Ready</span>
                      </div>
                    )}
                  </div>
                </div>
              </TiltCard3D>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalCleaningPage;
