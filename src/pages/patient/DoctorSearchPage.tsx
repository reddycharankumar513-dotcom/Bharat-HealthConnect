import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockDoctors } from '../../data/mockDoctors';
import { Doctor } from '../../types';
import { AppointmentBookingModal } from '../../components/patient/AppointmentBookingModal';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Stethoscope, 
  Star, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  Languages, 
  Calendar, 
  Filter, 
  Sparkles,
  ArrowRight,
  Activity,
  HeartPulse,
  AlertTriangle,
  X,
  Tag
} from 'lucide-react';

export const DoctorSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setIsAiModalOpen } = useApp();

  const symptomParam = searchParams.get('symptom') || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState<string>(symptomParam);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [maxFee, setMaxFee] = useState<number>(1500);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (symptomParam) {
      setSelectedSymptom(symptomParam);
    }
  }, [symptomParam]);

  const commonSymptoms = [
    { label: 'Chest Pain', specialty: 'Cardiology' },
    { label: 'Fever & Chills', specialty: 'General Medicine' },
    { label: 'Severe Headache / Migraine', specialty: 'Neurology' },
    { label: 'Knee Pain / Stiffness', specialty: 'Orthopedics' },
    { label: 'High Blood Sugar / Thirst', specialty: 'Endocrinology' },
    { label: 'Child Cough / Wheezing', specialty: 'Pediatrics' },
    { label: 'Back Pain / Sciatica', specialty: 'Neurology & Neurosurgery' },
    { label: 'Palpitations', specialty: 'Cardiology' },
    { label: 'Stomach Pain / Acidity', specialty: 'General Medicine' },
    { label: 'Thyroid Swelling / Fatigue', specialty: 'Endocrinology' },
  ];

  const specialties = ['All', 'Cardiology', 'Endocrinology & Diabetology', 'Neurology & Neurosurgery', 'Pediatrics', 'Orthopedics', 'General Medicine'];
  const languagesList = ['All', 'English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Marathi', 'Bengali'];

  // Smart matching logic for symptom + general query + filters
  const filteredDoctors = mockDoctors.filter(doc => {
    const q = searchTerm.toLowerCase().trim();
    const s = selectedSymptom.toLowerCase().trim();

    // Check if doctor matches symptom
    const matchesSymptom = !s || 
      doc.treatedSymptoms.some(sym => sym.toLowerCase().includes(s) || s.includes(sym.toLowerCase())) ||
      doc.conditions.some(cond => cond.toLowerCase().includes(s) || s.includes(cond.toLowerCase())) ||
      doc.specialty.toLowerCase().includes(s);

    // Check general search term
    const matchesSearch = !q ||
      doc.name.toLowerCase().includes(q) ||
      doc.specialty.toLowerCase().includes(q) ||
      doc.hospitalName.toLowerCase().includes(q) ||
      doc.treatedSymptoms.some(sym => sym.toLowerCase().includes(q)) ||
      doc.conditions.some(cond => cond.toLowerCase().includes(q));

    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    const matchesLanguage = selectedLanguage === 'All' || doc.languages.includes(selectedLanguage);
    const matchesFee = doc.consultationFee <= maxFee;

    return matchesSymptom && matchesSearch && matchesSpecialty && matchesLanguage && matchesFee;
  });

  const handleSelectSymptom = (sym: string) => {
    if (selectedSymptom === sym) {
      setSelectedSymptom('');
      setSearchParams({});
    } else {
      setSelectedSymptom(sym);
      setSearchParams({ symptom: sym });
    }
  };

  const handleClearSymptom = () => {
    setSelectedSymptom('');
    setSearchParams({});
  };

  const handleBook = (docId: string) => {
    setSelectedDoctorId(docId);
    setBookingModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-teal-600" />
            Specialist Doctor Directory & Symptom Search
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Find and consult verified doctors by describing your symptoms, clinical specialty, or language
          </p>
        </div>

        <button
          onClick={() => setIsAiModalOpen(true)}
          className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-xl border border-teal-200 flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Ask AI Symptom Triage</span>
        </button>
      </div>

      {/* FEATURE: DEDICATED SYMPTOM-BASED SEARCH SECTION */}
      <div className="bg-gradient-to-br from-teal-900 to-medblue-950 text-white rounded-3xl p-6 sm:p-7 shadow-elevated space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <HeartPulse className="w-3.5 h-3.5" />
              Symptom-to-Specialist Matcher
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              What health symptoms or concerns are you experiencing?
            </h2>
            <p className="text-xs text-slate-300">
              Select or type your symptoms to immediately filter doctors with specialized clinical expertise in your condition.
            </p>
          </div>

          {selectedSymptom && (
            <button
              onClick={handleClearSymptom}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-teal-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Symptom Filter</span>
            </button>
          )}
        </div>

        {/* Free-text Symptom Input */}
        <div className="relative max-w-2xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Type symptoms (e.g. chest tightness, palpitations, high sugar, knee swelling, migraine)..."
            value={selectedSymptom}
            onChange={e => {
              setSelectedSymptom(e.target.value);
              if (e.target.value) {
                setSearchParams({ symptom: e.target.value });
              } else {
                setSearchParams({});
              }
            }}
            className="w-full pl-10 pr-10 py-3 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-400 shadow-md"
          />
          {selectedSymptom && (
            <button
              onClick={handleClearSymptom}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Symptom Chips */}
        <div>
          <span className="text-[11px] font-semibold text-teal-200 uppercase tracking-wider block mb-2">
            Common Symptoms (Click to filter):
          </span>
          <div className="flex flex-wrap gap-2">
            {commonSymptoms.map(item => {
              const isSelected = selectedSymptom !== '' && (
                selectedSymptom.toLowerCase().includes(item.label.toLowerCase()) ||
                item.label.toLowerCase().includes(selectedSymptom.toLowerCase())
              );

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleSelectSymptom(item.label)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-teal-400 text-slate-950 font-bold shadow-md ring-2 ring-white/50 scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                  }`}
                >
                  <Tag className="w-3 h-3 text-teal-300" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Clinical Triage Advice when Symptom Selected */}
        {selectedSymptom && (
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs text-teal-100 flex items-start gap-2.5">
            <Activity className="w-4 h-4 text-teal-300 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-white">Active Symptom Filter: "{selectedSymptom}"</span>
              <p className="text-[11px] text-teal-200/90 leading-relaxed">
                Showing board-certified specialists who clinically diagnose and treat this condition. For sudden emergency chest pain, breathing difficulty, or trauma, dial <strong>112</strong> or <strong>108</strong> immediately.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filter and General Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Text search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Doctor name, hospital name, city..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          {/* Specialty filter */}
          <div>
            <select
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:ring-2 focus:ring-teal-500"
            >
              {specialties.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Specialties' : s}</option>
              ))}
            </select>
          </div>

          {/* Language filter */}
          <div>
            <select
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:ring-2 focus:ring-teal-500"
            >
              {languagesList.map(lang => (
                <option key={lang} value={lang}>{lang === 'All' ? 'All Languages' : lang}</option>
              ))}
            </select>
          </div>

          {/* Max fee slider */}
          <div className="flex flex-col justify-center px-1">
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Max Consultation Fee:</span>
              <strong className="text-teal-700 font-bold">₹{maxFee}</strong>
            </div>
            <input
              type="range"
              min="400"
              max="1500"
              step="50"
              value={maxFee}
              onChange={e => setMaxFee(Number(e.target.value))}
              className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Found <strong>{filteredDoctors.length}</strong> matching specialists</span>
          {(searchTerm || selectedSymptom || selectedSpecialty !== 'All' || selectedLanguage !== 'All' || maxFee < 1500) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSymptom('');
                setSelectedSpecialty('All');
                setSelectedLanguage('All');
                setMaxFee(1500);
                setSearchParams({});
              }}
              className="text-teal-600 hover:underline font-semibold"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDoctors.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No doctors matched your symptom criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your symptom query or search across all medical specialties.
            </p>
            <button
              onClick={() => {
                setSelectedSymptom('');
                setSearchTerm('');
                setSearchParams({});
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl"
            >
              Clear Symptom Filter
            </button>
          </div>
        ) : (
          filteredDoctors.map(doc => {
            // Find which symptoms matched the user's search
            const matchedSymptoms = selectedSymptom
              ? doc.treatedSymptoms.filter(sym => 
                  sym.toLowerCase().includes(selectedSymptom.toLowerCase()) || 
                  selectedSymptom.toLowerCase().includes(sym.toLowerCase())
                )
              : [];

            return (
              <div
                key={doc.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                    />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-base text-slate-900">{doc.name}</h3>
                        {doc.verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                            <CheckCircle2 className="w-3 h-3 text-teal-600" />
                            Verified MCI
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-teal-700">{doc.specialty}</p>
                      <p className="text-[11px] text-slate-400">{doc.qualification}</p>

                      <div className="flex items-center gap-3 text-xs pt-1">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span>{doc.rating}</span>
                          <span className="text-slate-400 text-[11px]">({doc.reviewCount})</span>
                        </div>
                        <span>•</span>
                        <span className="text-slate-600">{doc.experienceYears}+ Years Experience</span>
                      </div>
                    </div>
                  </div>

                  {/* Highlight matched symptom pill */}
                  {matchedSymptoms.length > 0 && (
                    <div className="p-2.5 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span>
                        Treats your symptom: <strong>{matchedSymptoms.join(', ')}</strong>
                      </span>
                    </div>
                  )}

                  {/* Treated Symptoms Chips on Doctor Card */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Key Symptoms Treated:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {doc.treatedSymptoms.slice(0, 4).map(sym => (
                        <span
                          key={sym}
                          className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200"
                        >
                          {sym}
                        </span>
                      ))}
                      {doc.treatedSymptoms.length > 4 && (
                        <span className="px-2 py-0.5 text-[11px] text-slate-400">
                          +{doc.treatedSymptoms.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hospital & Languages Info */}
                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{doc.hospitalName} ({doc.city})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>Speaks: {doc.languages.join(', ')}</span>
                    </div>
                  </div>

                  {/* Available Slots Preview */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Available Consultation Slots:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {doc.availableSlots.slice(0, 3).map(slot => (
                        <span key={slot} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-100">
                          {slot}
                        </span>
                      ))}
                      {doc.availableSlots.length > 3 && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] text-slate-400">
                          +{doc.availableSlots.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Booking Action */}
                <div className="pt-5 flex items-center justify-between border-t border-slate-100 mt-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Consultation Fee</span>
                    <strong className="text-base font-bold text-slate-900">₹{doc.consultationFee}</strong>
                  </div>

                  <button
                    onClick={() => handleBook(doc.id)}
                    className="py-2.5 px-5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Consultation</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedDoctorId={selectedDoctorId}
        initialSymptoms={
          selectedSymptom 
            ? `Consultation for: ${selectedSymptom}`
            : (selectedDoctorId ? `Consultation for ${mockDoctors.find(d => d.id === selectedDoctorId)?.specialty} symptoms` : '')
        }
      />
    </div>
  );
};
