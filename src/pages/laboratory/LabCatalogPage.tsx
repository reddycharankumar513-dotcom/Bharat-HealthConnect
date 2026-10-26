import React, { useState } from 'react';
import { mockDiagnosticTests } from '../../data/mockLabTests';
import { DiagnosticTest } from '../../types';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/common/Modal';
import { 
  FlaskConical, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Home, 
  Building2,
  DollarSign
} from 'lucide-react';

export const LabCatalogPage: React.FC = () => {
  const { createLabBooking, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [bookingTest, setBookingTest] = useState<DiagnosticTest | null>(null);

  // Booking Modal form state
  const [collectionType, setCollectionType] = useState<'Home Collection' | 'Lab Visit'>('Home Collection');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    return tmr.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('08:00 AM');

  const categories = ['All', 'Biochemistry', 'Hematology'];

  const filteredTests = mockDiagnosticTests.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingTest) return;

    createLabBooking(
      bookingTest.id,
      bookingTest.name,
      bookingTest.priceINR,
      collectionType,
      scheduledDate,
      scheduledTime
    );

    setBookingTest(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-teal-600" />
          Diagnostic Test Catalogue & Home Phlebotomy
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          NABL ISO-standard blood profiles with automated differential barcoding and transparent subsidized INR rates
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search tests (e.g. CBC, HbA1c, Lipid, Thyroid, LFT)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:ring-2 focus:ring-teal-500"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Diagnostic Categories' : c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Test Catalogue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map(test => (
          <div
            key={test.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="font-mono text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  {test.code}
                </span>
                <span className="text-xs font-semibold text-slate-500">{test.category}</span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 leading-snug">{test.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{test.description}</p>
              </div>

              {/* Parameters info */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Sample Specimen:</span>
                  <span className="font-medium text-slate-800">{test.sampleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fasting Requirement:</span>
                  <span className={test.fastingRequired ? 'text-amber-700 font-bold' : 'text-slate-700'}>
                    {test.fastingRequired ? '10-12 Hrs Fasting' : 'Non-Fasting'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Turnaround Time (TAT):</span>
                  <span className="font-semibold text-teal-700">{test.tatHours} Hours</span>
                </div>
              </div>
            </div>

            {/* Price and Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Standard Price</span>
                <strong className="text-lg font-extrabold text-slate-900">₹{test.priceINR}</strong>
              </div>

              <button
                onClick={() => setBookingTest(test)}
                className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Test</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {bookingTest && (
        <Modal
          isOpen={!!bookingTest}
          onClose={() => setBookingTest(null)}
          title={`Book Diagnostic Test: ${bookingTest.name.split('(')[0]}`}
          subtitle={`Standard Price: ₹${bookingTest.priceINR} (Subsidized INR Rate)`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmBooking} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sample Collection Preference
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCollectionType('Home Collection')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    collectionType === 'Home Collection'
                      ? 'border-teal-600 bg-teal-50 text-teal-800 ring-1 ring-teal-600'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <Home className="w-4 h-4 text-teal-600" />
                  <span>Home Phlebotomy</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCollectionType('Lab Visit')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    collectionType === 'Lab Visit'
                      ? 'border-teal-600 bg-teal-50 text-teal-800 ring-1 ring-teal-600'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span>Visit Lab Center</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setScheduledDate(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Time Slot
              </label>
              <select
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
              >
                <option>07:00 AM (Early Fasting)</option>
                <option>08:00 AM (Recommended)</option>
                <option>09:30 AM</option>
                <option>11:00 AM</option>
                <option>04:00 PM</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBookingTest(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                Confirm Test Booking
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
