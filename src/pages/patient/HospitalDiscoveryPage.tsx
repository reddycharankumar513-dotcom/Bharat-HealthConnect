import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockHospitals } from '../../data/mockHospitals';
import { Hospital } from '../../types';
import { GoogleMapPlaceholder } from '../../components/common/GoogleMapPlaceholder';
import { 
  Search, 
  MapPin, 
  Building2, 
  Filter, 
  Navigation, 
  Phone, 
  Clock, 
  Star, 
  ShieldAlert, 
  ExternalLink,
  Layers,
  Map as MapIcon,
  List
} from 'lucide-react';

export const HospitalDiscoveryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');

  const filteredHospitals = mockHospitals.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'All' || h.type === selectedType;
    const matchesCity = selectedCity === 'All' || h.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesSpecialty = selectedSpecialty === 'All' || h.specialties.includes(selectedSpecialty);

    return matchesSearch && matchesType && matchesCity && matchesSpecialty;
  });

  const allSpecialties = Array.from(new Set(mockHospitals.flatMap(h => h.specialties)));

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-600" />
            Hospital Discovery & Facility Locator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search NABH and government tertiary healthcare centers across major Indian metros
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'cards' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List & Grid</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'map' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Interactive Map</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Query search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search hospital name, specialty..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          {/* City filter */}
          <div>
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Cities (India)</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Delhi">Delhi NCR</option>
              <option value="Chennai">Chennai</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Visakhapatnam">Visakhapatnam</option>
            </select>
          </div>

          {/* Type filter */}
          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Types (Govt & Private)</option>
              <option value="Government">Government Hospitals</option>
              <option value="Private">Private Hospitals</option>
              <option value="Autonomous">Autonomous / Apex Institutes</option>
            </select>
          </div>

          {/* Specialty filter */}
          <div>
            <select
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Specialties</option>
              {allSpecialties.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter count & active badges */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Found <strong>{filteredHospitals.length}</strong> hospitals matching filters</span>
          {(searchTerm || selectedType !== 'All' || selectedCity !== 'All' || selectedSpecialty !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('All');
                setSelectedCity('All');
                setSelectedSpecialty('All');
              }}
              className="text-teal-600 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main View Area: Either Interactive Map or Cards */}
      {viewMode === 'map' ? (
        <GoogleMapPlaceholder hospitals={filteredHospitals} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map(hospital => {
            const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ' ' + hospital.address)}`;

            return (
              <div
                key={hospital.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card hover:shadow-elevated transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={hospital.image}
                      alt={hospital.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 shadow">
                        {hospital.type}
                      </span>
                      {hospital.emergencyAvailable && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          24x7 Trauma
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-900/85 text-white flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{hospital.rating}</span>
                      <span className="text-slate-400">({hospital.reviewCount})</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 line-clamp-1">{hospital.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span>{hospital.address}, {hospital.city}</span>
                      </p>
                    </div>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-1">
                      {hospital.specialties.slice(0, 3).map(spec => (
                        <span key={spec} className="px-2 py-0.5 text-[11px] font-medium bg-teal-50 text-teal-700 rounded-md border border-teal-100">
                          {spec}
                        </span>
                      ))}
                    </div>

                    {/* Capacity details */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Bed Capacity</span>
                        <strong className="text-slate-800">{hospital.bedCapacity} Beds</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Avail. (Demo)</span>
                        <strong className="text-emerald-600">{hospital.availableBedsDemo} Avail</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/hospitals/${hospital.id}`}
                      className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold text-center transition-colors shadow-2xs"
                    >
                      View Details & OPD
                    </Link>
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                      title="Directions"
                    >
                      <Navigation className="w-4 h-4 text-teal-600" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
