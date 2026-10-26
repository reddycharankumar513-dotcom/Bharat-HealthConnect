import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { mockDoctors } from '../../data/mockDoctors';
import { 
  Clock, 
  Calendar, 
  Save, 
  CheckCircle2, 
  Plus, 
  Trash2,
  AlertCircle
} from 'lucide-react';

export const DoctorAvailabilityPage: React.FC = () => {
  const { showToast } = useApp();
  const doctor = mockDoctors[0];

  const [activeDays, setActiveDays] = useState<Record<string, boolean>>({
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: false,
    Sunday: false,
  });

  const [slots, setSlots] = useState<string[]>([...doctor.availableSlots]);
  const [newSlot, setNewSlot] = useState('');
  const [bufferMins, setBufferMins] = useState(15);

  const toggleDay = (day: string) => {
    setActiveDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const handleAddSlot = () => {
    if (!newSlot.trim()) return;
    if (slots.includes(newSlot.trim())) {
      showToast('This time slot is already added', 'warning');
      return;
    }
    setSlots(prev => [...prev, newSlot.trim()].sort());
    setNewSlot('');
    showToast('Time slot added', 'success');
  };

  const handleRemoveSlot = (slot: string) => {
    setSlots(prev => prev.filter(s => s !== slot));
    showToast('Time slot removed', 'info');
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Consultation schedule & slot availability updated successfully!', 'success');
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Clock className="w-6 h-6 text-teal-600" />
          OPD Slot & Availability Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure daily working days, available consultation time slots, and OPD buffer times for Apollo Health City
        </p>
      </div>

      <form onSubmit={handleSaveSchedule} className="space-y-6">
        {/* Working Days Selector */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            Weekly OPD Working Days
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {Object.entries(activeDays).map(([day, isAvailable]) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isAvailable
                    ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400 font-medium'
                }`}
              >
                <span className="block text-xs">{day.slice(0, 3)}</span>
                <span className="text-[10px] block mt-1">
                  {isAvailable ? 'Available' : 'Day Off'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Available Time Slots */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                Active Consultation Time Slots
              </h2>
              <p className="text-xs text-slate-500">Slots published on patient booking directory</p>
            </div>
          </div>

          {/* Add Slot */}
          <div className="flex items-center gap-2 max-w-sm">
            <input
              type="text"
              placeholder="e.g. 06:15 PM"
              value={newSlot}
              onChange={e => setNewSlot(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs flex-1"
            />
            <button
              type="button"
              onClick={handleAddSlot}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Slots List */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-2">
            {slots.map(slot => (
              <div
                key={slot}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800"
              >
                <span>{slot}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSlot(slot)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                  title="Remove Slot"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Buffer & Capacity */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
          <h2 className="text-base font-bold text-slate-900">Consultation Session Parameters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Consultation Buffer Time
              </label>
              <select
                value={bufferMins}
                onChange={e => setBufferMins(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
              >
                <option value={10}>10 Minutes per patient</option>
                <option value={15}>15 Minutes per patient</option>
                <option value={20}>20 Minutes per patient</option>
                <option value={30}>30 Minutes per patient</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max In-Person Patients / Day
              </label>
              <input
                type="number"
                defaultValue={25}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Availability Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
