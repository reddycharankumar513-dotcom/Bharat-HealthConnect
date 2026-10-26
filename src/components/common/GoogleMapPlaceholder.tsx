import React, { useState } from 'react';
import { Hospital } from '../../types';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  Bed, 
  ShieldAlert, 
  ExternalLink, 
  Layers, 
  List, 
  Map as MapIcon, 
  Star,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface GoogleMapPlaceholderProps {
  hospitals: Hospital[];
  selectedHospitalId?: string;
  onSelectHospital?: (hospital: Hospital) => void;
  className?: string;
}

export const GoogleMapPlaceholder: React.FC<GoogleMapPlaceholderProps> = ({
  hospitals,
  selectedHospitalId,
  onSelectHospital,
  className = '',
}) => {
  const [selected, setSelected] = useState<Hospital | null>(() => {
    return hospitals.find(h => h.id === selectedHospitalId) || hospitals[0] || null;
  });

  const [viewMode, setViewMode] = useState<'map' | 'split'>('split');
  const [activeCity, setActiveCity] = useState<string>('All');

  const filteredHospitals = activeCity === 'All' 
    ? hospitals 
    : hospitals.filter(h => h.city.toLowerCase() === activeCity.toLowerCase());

  const handleMarkerClick = (hospital: Hospital) => {
    setSelected(hospital);
    if (onSelectHospital) {
      onSelectHospital(hospital);
    }
  };

  const getDirectionsUrl = (hospital: Hospital) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ', ' + hospital.address + ', ' + hospital.city)}`;
  };

  const cities = ['All', 'Hyderabad', 'Bengaluru', 'Delhi', 'Chennai', 'Visakhapatnam', 'Mumbai'];

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card flex flex-col ${className}`}>
      {/* Top Map Toolbar */}
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
            <MapIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              Facility Locator & Geo-Map
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                Mock GPS Canvas
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Interactive facility markers with verified external navigation routing
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* City Selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
            {cities.slice(0, 5).map(c => (
              <button
                key={c}
                onClick={() => setActiveCity(c)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeCity === c ? 'bg-teal-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-md flex items-center gap-1 ${
                viewMode === 'split' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-600'
              }`}
              title="Split View"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-md flex items-center gap-1 ${
                viewMode === 'map' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-600'
              }`}
              title="Full Map"
            >
              <MapIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* Left Interactive Vector Canvas Area */}
        <div className={`relative bg-slate-900 overflow-hidden flex flex-col justify-between p-4 ${
          viewMode === 'split' ? 'lg:col-span-8' : 'lg:col-span-12'
        }`}>
          {/* Simulated Satellite/Streets Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 30%, #0d9488 0%, transparent 40%),
                                linear-gradient(to right, #1e293b 1px, transparent 1px),
                                linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
              backgroundSize: '100% 100%, 30px 30px, 30px 30px'
            }}
          />

          {/* Map Status Notice */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 text-slate-200 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Geo-Spatial Coordinates: India Medical Grid ({filteredHospitals.length} active facilities)</span>
            </div>
            <div className="text-[11px] text-slate-400 bg-slate-800/70 px-2.5 py-1 rounded-lg">
              Lat: {selected ? selected.lat.toFixed(4) : '20.5937'}° N, Lng: {selected ? selected.lng.toFixed(4) : '78.9629'}° E
            </div>
          </div>

          {/* Interactive Hospital Pins Distributed on Canvas */}
          <div className="relative z-10 my-auto py-12 flex flex-wrap items-center justify-around gap-6 max-w-4xl mx-auto w-full">
            {filteredHospitals.map((hosp, idx) => {
              const isSelected = selected?.id === hosp.id;
              return (
                <button
                  key={hosp.id}
                  onClick={() => handleMarkerClick(hosp)}
                  className={`group relative flex flex-col items-center transition-all duration-300 transform ${
                    isSelected ? 'scale-110 z-20' : 'hover:scale-105 z-10'
                  }`}
                >
                  {/* Pin Popup Card on Hover or Selected */}
                  <div className={`mb-2 px-3 py-1.5 rounded-xl text-left border shadow-lg transition-all ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-400'
                      : 'bg-slate-800/95 text-slate-200 border-slate-700 group-hover:bg-slate-750'
                  }`}>
                    <p className="text-xs font-bold truncate max-w-[170px]">{hosp.name}</p>
                    <div className="flex items-center gap-1.5 text-[10px] opacity-80">
                      <span>{hosp.city}</span>
                      <span>•</span>
                      <span>{hosp.type}</span>
                    </div>
                  </div>

                  {/* Pin Marker */}
                  <div className={`p-2.5 rounded-full border-2 transition-all shadow-md ${
                    isSelected 
                      ? 'bg-emerald-500 border-white text-white ring-4 ring-emerald-500/40' 
                      : hosp.type === 'Government' 
                        ? 'bg-sky-600 border-white text-white' 
                        : 'bg-teal-600 border-white text-white'
                  }`}>
                    <MapPin className="w-5 h-5" />
                  </div>

                  {/* Pulsing ring indicator */}
                  {isSelected && (
                    <span className="absolute bottom-0 w-8 h-2 bg-emerald-400/40 rounded-full blur-xs animate-ping" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Map Overlay Notice */}
          <div className="relative z-10 bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-teal-300">Note:</span> Real-time routing is forwarded directly to native Google Maps.
            </span>
            {selected && (
              <a
                href={getDirectionsUrl(selected)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-teal-400 hover:text-teal-300 underline"
              >
                <span>Navigate to {selected.name.split(',')[0]}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Right Hospital Detailed Info Sidebar */}
        {viewMode === 'split' && (
          <div className="lg:col-span-4 bg-white p-5 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between">
            {selected ? (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden h-36 bg-slate-100">
                  <img
                    src={selected.image}
                    alt={selected.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow">
                      {selected.type}
                    </span>
                    {selected.emergencyAvailable && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        24x7 Trauma
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{selected.rating}</span>
                    <span className="text-slate-400">({selected.reviewCount})</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">{selected.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span>{selected.address}, {selected.city} - {selected.pincode}</span>
                  </p>
                </div>

                {/* Specialties tags */}
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Key Specialties
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selected.specialties.map(spec => (
                      <span key={spec} className="px-2 py-0.5 text-[11px] font-medium bg-teal-50 text-teal-700 rounded-md border border-teal-100">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Facilities & Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Bed Capacity</span>
                    <span className="font-semibold text-slate-800">{selected.bedCapacity} Beds</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Available (Demo)</span>
                    <span className="font-semibold text-emerald-600">{selected.availableBedsDemo} Available</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center gap-1.5 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium">{selected.phone}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={getDirectionsUrl(selected)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Get Directions on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70" />
                  </a>

                  <Link
                    to={`/hospitals/${selected.id}`}
                    className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>View Hospital Details & Doctors</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-slate-400 text-xs">
                Select a hospital marker on the map to inspect details
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
