import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TiltCard3D } from '../../components/common/TiltCard3D';
import { 
  Building2, 
  DoorClosed, 
  Plus, 
  Users, 
  BedDouble, 
  CheckCircle2, 
  AlertCircle, 
  Edit, 
  Trash2, 
  X, 
  RefreshCw,
  Phone,
  ShieldCheck
} from 'lucide-react';

interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  capacity: number;
  currentOccupancy: number;
  dailyRate: number;
  facilities?: string;
}

interface Ward {
  id: string;
  name: string;
  code: string;
  department: string;
  wardType: string;
  floor: string;
  capacity: number;
  supervisorName?: string;
  supervisorPhone?: string;
  isActive: boolean;
  rooms: Room[];
  stats?: {
    totalBeds: number;
    availableBeds: number;
    occupiedBeds: number;
    cleaningBeds: number;
    maintenanceBeds: number;
    occupancyRate: number;
  };
}

export const HospitalWardsPage: React.FC = () => {
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [showAddWardModal, setShowAddWardModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [selectedWardForRoom, setSelectedWardForRoom] = useState<Ward | null>(null);

  // New Ward Form
  const [wardName, setWardName] = useState('');
  const [wardCode, setWardCode] = useState('');
  const [wardDept, setWardDept] = useState('');
  const [wardType, setWardType] = useState('GENERAL');
  const [wardFloor, setWardFloor] = useState('1st Floor');
  const [wardCapacity, setWardCapacity] = useState(15);
  const [wardSupervisor, setWardSupervisor] = useState('');
  const [wardPhone, setWardPhone] = useState('');

  // New Room Form
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('DOUBLE');
  const [roomCapacity, setRoomCapacity] = useState(2);
  const [roomDailyRate, setRoomDailyRate] = useState(2000);
  const [roomFacilities, setRoomFacilities] = useState('AC, Attached Restroom, Oxygen Flowmeter');

  const fetchWards = async () => {
    setLoading(true);
    try {
      const res = await api.get('/beds/wards');
      if (res.success) {
        setWards(res.wards);
      }
    } catch (err) {
      console.error('Error fetching wards:', err);
      setMessage({ type: 'error', text: 'Failed to fetch wards list.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWards();
  }, []);

  const handleCreateWard = async () => {
    if (!wardName || !wardCode || !wardDept) {
      setMessage({ type: 'error', text: 'Name, code, and department are required.' });
      return;
    }

    try {
      const res = await api.post('/beds/wards', {
        hospitalId: 'hosp-aims-hyd',
        name: wardName,
        code: wardCode,
        department: wardDept,
        wardType,
        floor: wardFloor,
        capacity: Number(wardCapacity),
        supervisorName: wardSupervisor,
        supervisorPhone: wardPhone
      });

      if (res.success) {
        setMessage({ type: 'success', text: `Ward "${wardName}" created successfully.` });
        setShowAddWardModal(false);
        setWardName('');
        setWardCode('');
        setWardDept('');
        fetchWards();
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to create ward.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error creating ward.' });
    }
  };

  const handleCreateRoom = async () => {
    if (!selectedWardForRoom || !roomNumber) {
      setMessage({ type: 'error', text: 'Room number is required.' });
      return;
    }

    try {
      const res = await api.post('/beds/rooms', {
        hospitalId: 'hosp-aims-hyd',
        wardId: selectedWardForRoom.id,
        roomNumber,
        roomType,
        capacity: Number(roomCapacity),
        dailyRate: Number(roomDailyRate),
        facilities: roomFacilities.split(',').map(s => s.trim())
      });

      if (res.success) {
        setMessage({ type: 'success', text: `Room ${roomNumber} added to ${selectedWardForRoom.name}.` });
        setShowAddRoomModal(false);
        setRoomNumber('');
        fetchWards();
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to add room.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error adding room.' });
    }
  };

  const handleDeleteWard = async (wardId: string) => {
    if (!confirm('Are you sure you want to delete this ward? This action will check for active admissions first.')) return;

    try {
      const res = await api.delete(`/beds/wards/${wardId}`);
      if (res.success) {
        setMessage({ type: 'success', text: 'Ward deleted successfully.' });
        fetchWards();
      } else {
        setMessage({ type: 'error', text: res.message || 'Cannot delete ward.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete ward.' });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-3d-float border border-indigo-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/25 text-indigo-200 border border-indigo-400/30">
            Infrastructure & Wing Layout
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2">Wards & Rooms Configuration</h1>
          <p className="text-xs text-slate-300 mt-1">
            Configure hospital wings, room occupancy limits, tariffs, and nursing supervisory assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddWardModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-3d-button"
          >
            <Plus className="w-4 h-4" />
            <span>Create Ward</span>
          </button>
          <button
            onClick={fetchWards}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center justify-between border ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <span className="text-sm font-medium">{message.text}</span>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Wards List */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading wards and rooms...</div>
        ) : (
          wards.map((ward) => (
            <TiltCard3D key={ward.id} maxTilt={4} scale={1.01} className="rounded-2xl">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-3d-card p-6 space-y-6">
                {/* Ward Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900">{ward.name}</h3>
                      <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-bold">{ward.code}</span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                        {ward.wardType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Dept: <strong className="text-slate-700">{ward.department}</strong> • {ward.floor} • Capacity: {ward.capacity} beds
                    </p>
                    {ward.supervisorName && (
                      <p className="text-xs text-slate-600 flex items-center gap-2 pt-0.5">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Supervisor: <strong>{ward.supervisorName}</strong> ({ward.supervisorPhone || 'Contact Desk'})</span>
                      </p>
                    )}
                  </div>

                  {/* Utilization Metrics */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Occupancy</span>
                      <span className="text-xl font-extrabold text-slate-900">{ward.stats?.occupancyRate ?? 0}%</span>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${ward.stats?.occupancyRate ?? 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedWardForRoom(ward);
                          setShowAddRoomModal(true);
                        }}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Room</span>
                      </button>
                      <button
                        onClick={() => handleDeleteWard(ward.id)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="Delete Ward"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rooms Grid inside this Ward */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Configured Rooms ({ward.rooms.length})</h4>
                  
                  {ward.rooms.length === 0 ? (
                    <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                      No rooms added to this ward yet. Click "Add Room" above to create one.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {ward.rooms.map((room) => (
                        <div
                          key={room.id}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-900">{room.roomNumber}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                              {room.roomType}
                            </span>
                          </div>

                          <div className="space-y-1 text-slate-600 text-[11px]">
                            <div className="flex justify-between">
                              <span>Capacity:</span>
                              <span className="font-semibold text-slate-900">{room.currentOccupancy} / {room.capacity} Beds</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Daily Tariff:</span>
                              <span className="font-semibold text-slate-900">₹{room.dailyRate}/d</span>
                            </div>
                          </div>

                          {room.facilities && (
                            <p className="text-[10px] text-slate-500 line-clamp-1 pt-1 border-t border-slate-200/60">
                              {room.facilities}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TiltCard3D>
          ))
        )}
      </div>

      {/* Add Ward Modal */}
      {showAddWardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Create New Hospital Ward</h3>
                <p className="text-xs text-slate-500">Configure specialty wing details</p>
              </div>
              <button onClick={() => setShowAddWardModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ward Name:</label>
                <input
                  type="text"
                  value={wardName}
                  onChange={(e) => setWardName(e.target.value)}
                  placeholder="e.g. Neonatal Intensive Care Unit (NICU)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ward Code:</label>
                  <input
                    type="text"
                    value={wardCode}
                    onChange={(e) => setWardCode(e.target.value)}
                    placeholder="NICU-FL2"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department:</label>
                  <input
                    type="text"
                    value={wardDept}
                    onChange={(e) => setWardDept(e.target.value)}
                    placeholder="Pediatrics"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ward Type:</label>
                  <select
                    value={wardType}
                    onChange={(e) => setWardType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="GENERAL">General Ward</option>
                    <option value="PRIVATE">Private Ward</option>
                    <option value="SEMI_PRIVATE">Semi-Private</option>
                    <option value="ICU">ICU</option>
                    <option value="NICU">NICU</option>
                    <option value="PICU">PICU</option>
                    <option value="EMERGENCY">Emergency</option>
                    <option value="MATERNITY">Maternity</option>
                    <option value="ISOLATION">Isolation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Floor Level:</label>
                  <input
                    type="text"
                    value={wardFloor}
                    onChange={(e) => setWardFloor(e.target.value)}
                    placeholder="2nd Floor, Wing A"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supervisor Name:</label>
                  <input
                    type="text"
                    value={wardSupervisor}
                    onChange={(e) => setWardSupervisor(e.target.value)}
                    placeholder="Sister Priya, RN"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supervisor Phone:</label>
                  <input
                    type="text"
                    value={wardPhone}
                    onChange={(e) => setWardPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setShowAddWardModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
              <button onClick={handleCreateWard} className="px-5 py-2.5 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-3d-button">
                Create Ward
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoomModal && selectedWardForRoom && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Add Room to {selectedWardForRoom.name}</h3>
                <p className="text-xs text-slate-500">Configure room capacity and amenities</p>
              </div>
              <button onClick={() => setShowAddRoomModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Room Number:</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. NICU-201, GEN-305..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room Type:</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="SINGLE">Single Deluxe</option>
                    <option value="DOUBLE">Double Sharing</option>
                    <option value="WARD_SHARED">Ward Multi-Bed</option>
                    <option value="DELUXE">Executive Suite</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Capacity (Beds):</label>
                  <input
                    type="number"
                    value={roomCapacity}
                    onChange={(e) => setRoomCapacity(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Daily Room Rate (₹ INR):</label>
                <input
                  type="number"
                  value={roomDailyRate}
                  onChange={(e) => setRoomDailyRate(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Facilities / Amenities (Comma separated):</label>
                <input
                  type="text"
                  value={roomFacilities}
                  onChange={(e) => setRoomFacilities(e.target.value)}
                  placeholder="AC, Television, Private Bathroom, Oxygen Port"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setShowAddRoomModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
              <button onClick={handleCreateRoom} className="px-5 py-2.5 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-3d-button">
                Save Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalWardsPage;
