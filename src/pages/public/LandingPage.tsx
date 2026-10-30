import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { mockHospitals } from '../../data/mockHospitals';
import { mockDoctors } from '../../data/mockDoctors';
import { mockDiagnosticTests } from '../../data/mockLabTests';
import { TiltCard3D } from '../../components/common/TiltCard3D';
import { BioInnovation3DCanvas } from '../../components/3d/BioInnovation3DCanvas';
import { 
  Search, 
  MapPin, 
  Building2, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  ShieldCheck, 
  ArrowRight, 
  PhoneCall, 
  Star, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Heart, 
  Shield, 
  Lock, 
  Sparkles,
  Zap,
  Activity,
  HeartPulse,
  Layers,
  Cpu,
  Eye
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setRole, setIsAiModalOpen } = useApp();
  const navigate = useNavigate();

  const [searchCategory, setSearchCategory] = useState<'all' | 'doctors' | 'hospitals' | 'medicines' | 'diagnostics' | 'symptoms'>('all');
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('All India');

  const specialties = [
    { name: 'Cardiology', count: '48+ Specialists', icon: '❤️' },
    { name: 'Neurology', count: '32+ Specialists', icon: '🧠' },
    { name: 'Pediatrics', count: '64+ Specialists', icon: '👶' },
    { name: 'Orthopedics', count: '40+ Specialists', icon: '🦴' },
    { name: 'Endocrinology', count: '28+ Specialists', icon: '🩸' },
    { name: 'Oncology', count: '35+ Specialists', icon: '🎗️' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCategory === 'symptoms') {
      navigate(query.trim() ? `/doctors?symptom=${encodeURIComponent(query.trim())}` : '/doctors');
    } else if (searchCategory === 'doctors') {
      navigate(query.trim() ? `/doctors?symptom=${encodeURIComponent(query.trim())}` : '/doctors');
    } else if (searchCategory === 'hospitals') {
      navigate('/hospitals');
    } else if (searchCategory === 'medicines') {
      navigate('/pharmacy/inventory');
    } else if (searchCategory === 'diagnostics') {
      navigate('/laboratory/catalog');
    } else {
      if (query.trim()) {
        navigate(`/doctors?symptom=${encodeURIComponent(query.trim())}`);
      } else {
        navigate('/hospitals');
      }
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 3D Bio-Innovation Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/70 via-white to-slate-50 pt-8 pb-16 border-b border-slate-200/60 perspective-1000">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Headlines, Unified Search & 3D Badges */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/80 text-teal-900 text-xs font-semibold tracking-wide border border-teal-200 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Ayushman Bharat Digital Ecosystem (ABDM Ready)</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                One Nation. <br />
                <span className="text-teal-600 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-sky-600">
                  One Connected Healthcare
                </span> Ecosystem.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                Seamlessly discover top verified doctors, NABH hospitals, accredited diagnostic laboratories, and neighborhood pharmacies across India. Empowered by ABHA health IDs & 3D digital telemetry.
              </p>

              {/* Universal Healthcare Search Bar */}
              <div className="bg-white rounded-2xl shadow-3d-card border border-slate-200/90 p-2 sm:p-3 transform-style-3d hover:shadow-3d-float transition-all duration-300">
                {/* Search Type Tabs */}
                <div className="flex items-center gap-1 pb-3 mb-2 border-b border-slate-100 overflow-x-auto">
                  {[
                    { id: 'all', label: 'All Services' },
                    { id: 'symptoms', label: 'By Symptoms', icon: <HeartPulse className="w-3.5 h-3.5 text-rose-500" /> },
                    { id: 'doctors', label: 'Doctors', icon: <Stethoscope className="w-3.5 h-3.5" /> },
                    { id: 'hospitals', label: 'Hospitals', icon: <Building2 className="w-3.5 h-3.5" /> },
                    { id: 'diagnostics', label: 'Diagnostic Tests', icon: <FlaskConical className="w-3.5 h-3.5" /> },
                    { id: 'medicines', label: 'Medicines', icon: <Pill className="w-3.5 h-3.5" /> },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSearchCategory(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                        searchCategory === tab.id
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Search Inputs */}
                <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <div className="md:col-span-6 relative flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="text"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder={
                        searchCategory === 'symptoms'
                          ? 'Describe symptoms (e.g. chest pain, high sugar, knee pain)...'
                          : 'Specialty, Doctor name, Hospital, or Test...'
                      }
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="md:col-span-3 relative flex items-center">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3" />
                    <select
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full pl-9 pr-7 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white appearance-none cursor-pointer text-slate-700"
                    >
                      <option>All India</option>
                      <option>Hyderabad</option>
                      <option>Bengaluru</option>
                      <option>Delhi NCR</option>
                      <option>Chennai</option>
                      <option>Mumbai</option>
                      <option>Visakhapatnam</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-teal-600 text-white font-semibold rounded-xl text-xs sm:text-sm btn-3d-primary flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>{searchCategory === 'symptoms' ? 'Match Specialists' : 'Search Providers'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Symptom Quick Match Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
                <span className="font-bold text-slate-600 flex items-center gap-1 text-[11px] uppercase tracking-wider mr-1">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                  Quick Symptoms:
                </span>
                {[
                  { label: 'Chest Pain', query: 'Chest Pain' },
                  { label: 'Fever & Chills', query: 'Fever & Chills' },
                  { label: 'Severe Headache', query: 'Severe Headache' },
                  { label: 'Knee Pain', query: 'Knee Pain' },
                  { label: 'High Sugar', query: 'High Blood Sugar' },
                  { label: 'Child Cough', query: 'Child Cough' },
                ].map(s => (
                  <Link
                    key={s.label}
                    to={`/doctors?symptom=${encodeURIComponent(s.query)}`}
                    className="px-2.5 py-1 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 text-slate-700 rounded-lg border border-slate-200 shadow-2xs text-[11px] font-medium transition-all"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>

              {/* Quick 3D Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/roles"
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <Layers className="w-4 h-4 text-teal-400" />
                  <span>Preview 6 Role Portals</span>
                </Link>
                <Link
                  to="/emergency"
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <PhoneCall className="w-4 h-4 text-white" />
                  <span>24x7 Emergency (112)</span>
                </Link>
              </div>
            </div>

            {/* Right Column: 3D Interactive Healthcare Mesh Canvas */}
            <div className="lg:col-span-5 h-[440px] w-full">
              <BioInnovation3DCanvas />
            </div>

          </div>
        </div>
      </section>

      {/* Popular Medical Specialties - 3D Tilt Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Popular Medical Specialties
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Interactive 3D
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Consult with board-certified super-specialists across verified clinical departments
            </p>
          </div>
          <Link
            to="/doctors"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>All Specialties</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {specialties.map(spec => (
            <TiltCard3D key={spec.name} maxTilt={14} scale={1.05} className="rounded-2xl">
              <Link
                to="/doctors"
                className="block p-4 rounded-2xl bg-white border border-slate-200/80 shadow-3d-card hover:shadow-3d-teal hover:border-teal-300 transition-all text-center group h-full"
              >
                <div className="text-3xl mb-2 group-hover:scale-125 transition-transform translate-z-30 duration-300 drop-shadow-sm">
                  {spec.icon}
                </div>
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-teal-600 transition-colors translate-z-20">
                  {spec.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 translate-z-10">{spec.count}</p>
              </Link>
            </TiltCard3D>
          ))}
        </div>
      </section>

      {/* Featured Hospitals Showcase - 3D Tilt Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Featured Hospitals & Medical Centers
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              NABH-accredited tertiary care hospitals with 24x7 trauma and emergency wings
            </p>
          </div>
          <Link
            to="/hospitals"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>Explore All Hospitals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockHospitals.slice(0, 3).map(hospital => (
            <TiltCard3D key={hospital.id} maxTilt={8} scale={1.02} className="rounded-2xl">
              <div
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-3d-card hover:shadow-3d-float transition-all flex flex-col justify-between h-full"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={hospital.image}
                      alt={hospital.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5 translate-z-20">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 shadow-sm">
                        {hospital.type}
                      </span>
                      {hospital.ayushmanEmpanelled && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-600 text-white shadow-sm">
                          ABHA Empanelled
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-900/85 text-white flex items-center gap-1 shadow-sm translate-z-20">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{hospital.rating}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 line-clamp-1">{hospital.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                        <span>{hospital.city}, {hospital.state}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {hospital.specialties.slice(0, 3).map(s => (
                        <span key={s} className="px-2 py-0.5 text-[11px] bg-slate-100 text-slate-700 rounded-md">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Bed Capacity: <strong>{hospital.bedCapacity}</strong></span>
                      <span className="text-emerald-600 font-semibold">{hospital.availableBedsDemo} Avail (Demo)</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    to={`/hospitals/${hospital.id}`}
                    className="w-full py-2.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>View Details & Doctors</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </TiltCard3D>
          ))}
        </div>
      </section>

      {/* Featured Doctors - 3D Tilt Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Verified Doctors & Medical Specialists
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Connect with leading specialists for clinic appointments or secure tele-consultations
            </p>
          </div>
          <Link
            to="/doctors"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>Browse All Doctors</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockDoctors.slice(0, 3).map(doc => (
            <TiltCard3D key={doc.id} maxTilt={8} scale={1.02} className="rounded-2xl">
              <div
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3d-card hover:shadow-3d-float transition-all flex flex-col justify-between h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-slate-900">{doc.name}</h3>
                        {doc.verified && (
                          <span title="Verified Medical License">
                            <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-teal-700 mt-0.5">{doc.specialty}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{doc.qualification}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Experience</span>
                      <span className="font-semibold">{doc.experienceYears}+ Years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Languages</span>
                      <span className="font-medium truncate max-w-[150px]">{doc.languages.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Consultation Fee</span>
                      <span className="font-bold text-slate-900">₹{doc.consultationFee}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  <Link
                    to="/doctors"
                    className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold text-center transition-colors btn-3d-primary"
                  >
                    Book Appointment
                  </Link>
                  <button
                    onClick={() => setIsAiModalOpen(true)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors btn-3d-white"
                    title="Ask AI about this doctor"
                  >
                    <Sparkles className="w-4 h-4 text-teal-600" />
                  </button>
                </div>
              </div>
            </TiltCard3D>
          ))}
        </div>
      </section>

      {/* 3D Bio-Innovation Telemetry Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-3d-float relative overflow-hidden border border-teal-500/30">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
                <Cpu className="w-3.5 h-3.5 text-teal-400" />
                <span>3D Unified Health Grid Telemetry</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Real-Time Bio-Innovation & Health Mesh
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Bharat HealthConnect connects clinical OPD queues, ICUs, phlebotomy pipelines, and pharmacy supply chains into a synchronized nationwide healthcare cloud under FHIR HL7 standards.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                  <div className="text-2xl font-black text-teal-400">99.98%</div>
                  <div className="text-[11px] text-slate-400 font-medium">Gateway Uptime</div>
                </div>
                <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                  <div className="text-2xl font-black text-sky-400">1.2M+</div>
                  <div className="text-[11px] text-slate-400 font-medium">ABHA IDs Linked</div>
                </div>
                <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                  <div className="text-2xl font-black text-emerald-400">&lt; 15 min</div>
                  <div className="text-[11px] text-slate-400 font-medium">Avg OPD Triage</div>
                </div>
                <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                  <div className="text-2xl font-black text-amber-400">100%</div>
                  <div className="text-[11px] text-slate-400 font-medium">DPDP Guarded</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-3">
              <Link
                to="/roles"
                className="w-full py-3 px-5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-2xl text-center text-sm shadow-3d-teal transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Launch Role Simulators</span>
              </Link>
              <Link
                to="/patient"
                className="w-full py-2.5 px-5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl text-center text-xs border border-white/20 transition-all"
              >
                Open Patient Health Locker
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Diagnostic & Pharmacy Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Diagnostic Card */}
          <div className="bg-gradient-to-br from-teal-900 to-medblue-950 text-white rounded-3xl p-8 relative overflow-hidden shadow-3d-card border border-teal-500/20">
            <div className="relative z-10 space-y-4 max-w-md">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                NABL Accredited Diagnostics
              </span>
              <h3 className="text-2xl font-bold tracking-tight">
                Accurate Blood Tests & Scans with Home Collection
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Book CBC, HbA1c, Thyroid, Lipid Profile, and Liver Function tests at subsidized INR rates. Certified phlebotomists, automated barcoding, and digital verified reports.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <Link
                  to="/laboratory/catalog"
                  className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 text-xs font-bold rounded-xl transition-colors shadow-md"
                >
                  Explore Diagnostic Catalog
                </Link>
                <Link
                  to="/laboratory/samples"
                  className="text-xs font-medium text-teal-200 hover:underline"
                >
                  Track Sample Status →
                </Link>
              </div>
            </div>
            <FlaskConical className="w-56 h-56 text-white/5 absolute -right-6 -bottom-6 pointer-events-none" />
          </div>

          {/* Pharmacy Card */}
          <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-3xl p-8 relative overflow-hidden shadow-3d-card border border-teal-500/20">
            <div className="relative z-10 space-y-4 max-w-md">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Connected Smart Pharmacy
              </span>
              <h3 className="text-2xl font-bold tracking-tight">
                Reliable Generic & Prescription Medicines
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automated inventory replenishment with registered distributors (Sun Pharma, Cipla, Dr. Reddy's). Threshold-based reorders, batch expiration alerts, and verified dispatch.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <Link
                  to="/pharmacy/inventory"
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-bold rounded-xl transition-colors shadow-md"
                >
                  Manage Medicine Stock
                </Link>
                <Link
                  to="/pharmacy/orders"
                  className="text-xs font-medium text-emerald-200 hover:underline"
                >
                  View Purchase Orders →
                </Link>
              </div>
            </div>
            <Pill className="w-56 h-56 text-white/5 absolute -right-6 -bottom-6 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* How the Platform Works */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              How Bharat HealthConnect Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              End-to-end digital health journey designed for every Indian citizen and healthcare institution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-sm shadow">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900">Search & Find Care</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter by verified medical specialty, Indian city, hospital bed availability, consultation fees, and spoken regional languages.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-sm shadow">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900">Instant Booking & Consent</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reserve live demo time slots without duplicate conflicts. Link your ABHA ID to grant temporary consent to your consulting doctor.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-sm shadow">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900">Unified Health Records</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Access diagnostic lab reports, active prescriptions, and billing invoices in one secure encrypted repository accessible anywhere in India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Section Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                24x7 Emergency & Trauma Response
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Need Urgent Medical Assistance?
            </h3>
            <p className="text-xs text-slate-600 max-w-xl">
              Access emergency contacts, find nearby trauma centers with available ICU demo beds, and trigger GPS routing immediately.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/emergency"
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Open Emergency Center</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Role Switcher Hub Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 text-center space-y-6">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
            Interactive Product Demonstration
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight max-w-xl mx-auto">
            Experience All 6 Healthcare Portals in Live Demo Mode
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Preview patient scheduling, doctor consultation prescriptions, hospital operations, smart pharmacy auto-procurement, lab sample tracking, and central platform audits.
          </p>
          <div className="pt-2">
            <Link
              to="/roles"
              className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg inline-flex items-center gap-2"
            >
              <span>Explore All 6 Portals Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
