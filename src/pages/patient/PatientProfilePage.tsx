import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';
import { languages } from '../../components/common/LanguageSelector';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Heart, 
  Users, 
  Eye, 
  Save, 
  CheckCircle2, 
  Plus, 
  Trash2,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export const PatientProfilePage: React.FC = () => {
  const { patientProfile, updatePatientProfile, showToast } = useApp();

  const [formData, setFormData] = useState({ ...patientProfile });
  const [newDependentName, setNewDependentName] = useState('');
  const [newDependentRelation, setNewDependentRelation] = useState('Child');
  const [newDependentAge, setNewDependentAge] = useState(10);
  const [showAddDependent, setShowAddDependent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatientProfile(formData);
  };

  const handleAddDependent = () => {
    if (!newDependentName.trim()) return;
    const newDep = {
      id: 'dep-' + Date.now(),
      name: newDependentName.trim(),
      relation: newDependentRelation,
      age: Number(newDependentAge),
      gender: 'Other'
    };
    const updatedDependents = [...formData.dependents, newDep];
    setFormData(prev => ({ ...prev, dependents: updatedDependents }));
    updatePatientProfile({ dependents: updatedDependents });
    setNewDependentName('');
    setShowAddDependent(false);
    showToast(`Added ${newDep.name} to family members`, 'success');
  };

  const handleRemoveDependent = (depId: string) => {
    const updatedDependents = formData.dependents.filter(d => d.id !== depId);
    setFormData(prev => ({ ...prev, dependents: updatedDependents }));
    updatePatientProfile({ dependents: updatedDependents });
    showToast('Removed family dependent', 'info');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {patientProfile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{patientProfile.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                ABHA Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ayushman Bharat Health Account ID: <strong className="text-slate-800">{patientProfile.abhaId}</strong>
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal & Contact Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            Personal & Demographic Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={e => setFormData({ ...formData, dob: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
              <input
                type="text"
                value={formData.bloodGroup}
                onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact & Language */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-600" />
            Emergency Contact & Language Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name</label>
              <input
                type="text"
                value={formData.emergencyContact.name}
                onChange={e => setFormData({
                  ...formData,
                  emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
              <input
                type="text"
                value={formData.emergencyContact.relationship}
                onChange={e => setFormData({
                  ...formData,
                  emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
                })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Phone</label>
              <input
                type="tel"
                value={formData.emergencyContact.phone}
                onChange={e => setFormData({
                  ...formData,
                  emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Language for Care Consultation</label>
            <select
              value={formData.preferredLanguage}
              onChange={e => setFormData({ ...formData, preferredLanguage: e.target.value as Language })}
              className="w-full sm:w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            >
              {languages.map(l => (
                <option key={l.code} value={l.code}>{l.native} ({l.name})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Family Members & Dependents */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                Family Members & Dependents
              </h2>
              <p className="text-xs text-slate-500">Linked under family ABHA group for appointment booking</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddDependent(!showAddDependent)}
              className="px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold text-xs rounded-xl flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>

          {showAddDependent && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800">Add New Family Dependent</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newDependentName}
                  onChange={e => setNewDependentName(e.target.value)}
                  className="p-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
                <select
                  value={newDependentRelation}
                  onChange={e => setNewDependentRelation(e.target.value)}
                  className="p-2 bg-white border border-slate-200 rounded-xl text-xs"
                >
                  <option>Child</option>
                  <option>Spouse</option>
                  <option>Parent</option>
                  <option>Sibling</option>
                </select>
                <input
                  type="number"
                  placeholder="Age"
                  value={newDependentAge}
                  onChange={e => setNewDependentAge(Number(e.target.value))}
                  className="p-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDependent(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddDependent}
                  className="px-3 py-1.5 text-xs bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700"
                >
                  Save Member
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {formData.dependents.map(dep => (
              <div
                key={dep.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{dep.name}</h4>
                  <p className="text-[11px] text-slate-500">{dep.relation} • {dep.age} Years Old</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDependent(dep.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Accessibility Preferences */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-teal-600" />
            Accessibility Preferences
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.accessibility.largeFont}
                onChange={e => setFormData({
                  ...formData,
                  accessibility: { ...formData.accessibility, largeFont: e.target.checked }
                })}
                className="w-4 h-4 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500"
              />
              <span className="text-xs text-slate-700 font-medium">Enhanced Font Size for readability</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.accessibility.highContrast}
                onChange={e => setFormData({
                  ...formData,
                  accessibility: { ...formData.accessibility, highContrast: e.target.checked }
                })}
                className="w-4 h-4 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500"
              />
              <span className="text-xs text-slate-700 font-medium">High Contrast Color Schema</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.accessibility.screenReaderReady}
                onChange={e => setFormData({
                  ...formData,
                  accessibility: { ...formData.accessibility, screenReaderReady: e.target.checked }
                })}
                className="w-4 h-4 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500"
              />
              <span className="text-xs text-slate-700 font-medium">ARIA screen reader voice prompts compatibility</span>
            </label>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & ABHA Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
