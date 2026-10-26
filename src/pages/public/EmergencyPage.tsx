import React, { useState } from 'react';
import { mockHospitals } from '../../data/mockHospitals';
import { Hospital } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  PhoneCall, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  ShieldAlert, 
  ExternalLink, 
  Compass, 
  Clock, 
  HeartHandshake, 
  Car,
  CheckCircle2,
  Info
} from 'lucide-react';

export const EmergencyPage: React.FC = () => {
  const { showToast } = useApp();
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; city: string } | null>(null);
  const [selectedAmbulance, setSelectedAmbulance] = useState<string | null>(null);

  // Hospitals with verified emergency services
  const emergencyHospitals = mockHospitals.filter(h => h.emergencyAvailable);

  const handleSimulateLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      setUserLocation({
        lat: 17.4326,
        lng: 78.4071,
        city: 'Jubilee Hills, Hyderabad (Simulated GPS)'
      });
      showToast('Simulated GPS coordinates locked: Jubilee Hills, Hyderabad', 'success');
    }, 1200);
  };

  const emergencyContacts = [
    { title: 'National Emergency Helpline', number: '112', desc: 'Unified Police, Fire & Medical 24x7', badge: 'National Universal' },
    { title: 'Emergency Medical & Ambulance', number: '108', desc: 'Free Government Emergency Medical Dispatch', badge: 'State Toll-Free' },
    { title: 'Janani Shishu Suraksha', number: '102', desc: 'Maternal, Neonatal & Infant Medical Transport', badge: 'Free Govt Transport' },
    { title: 'National Health Helpline', number: '1075', desc: 'Ministry of Health & Family Welfare', badge: 'Govt Advisory' },
    { title: 'Apollo Emergency Hotline', number: '+91 40 2360 7777', desc: 'Apollo Health City 24x7 Cardiac & Trauma', badge: 'Network Hospital' },
    { title: 'AIIMS Apex Trauma Centre', number: '+91 11 2659 4705', desc: 'National Institute Critical Trauma Care', badge: 'Govt Apex Centre' }
  ];

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Mandatory Emergency Warning Banner */}
      <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 text-rose-900 flex items-start gap-4 shadow-sm">
        <div className="p-2.5 bg-rose-600 text-white rounded-xl flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1 text-xs sm:text-sm">
          <h2 className="font-extrabold text-base text-rose-950 flex items-center gap-2">
            CRITICAL EMERGENCY DISCLAIMER
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
              Immediate Action Required
            </span>
          </h2>
          <p className="leading-relaxed text-rose-900">
            This digital platform is a demonstration tool and <strong>NOT a replacement for emergency response services</strong>. If you or someone around you is in immediate danger, suffering severe chest pain, loss of consciousness, uncontrolled bleeding, or respiratory distress, immediately dial <strong>112</strong> or <strong>108</strong> without delay.
          </p>
          <p className="text-[11px] text-rose-700 pt-1 font-semibold">
            * Bed availability and ambulance response times shown below are demonstration indicators and must be verified by phone.
          </p>
        </div>
      </div>

      {/* Quick Dial Emergency Numbers Grid */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-rose-600" />
          Direct Emergency Hotlines (India)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {emergencyContacts.map((contact, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card hover:border-rose-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {contact.badge}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">{contact.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{contact.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <a
                  href={`tel:${contact.number.replace(/\s+/g, '')}`}
                  className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call {contact.number}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GPS Location & Nearest Trauma Centers */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-teal-600" />
              Verified 24x7 Trauma & Emergency Hospitals
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Hospitals with dedicated emergency casualty wings, cath labs, and intensive care units
            </p>
          </div>

          {/* Location-sharing demonstration button */}
          <button
            onClick={handleSimulateLocation}
            disabled={isLocating}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting Location...' : userLocation ? 'GPS Locked: Hyderabad' : 'Demonstrate Nearest GPS Sort'}</span>
          </button>
        </div>

        {userLocation && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Simulated Device Location: <strong>{userLocation.city}</strong></span>
            </span>
            <span className="text-[11px] text-teal-700">Sorted by proximity</span>
          </div>
        )}

        {/* Hospital cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {emergencyHospitals.map(hosp => {
            const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hosp.name + ' ' + hosp.address)}`;

            return (
              <div
                key={hosp.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                          24x7 Emergency Casualty
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{hosp.type}</span>
                      </div>
                      <h4 className="font-bold text-base text-slate-900 mt-1">{hosp.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>{hosp.address}, {hosp.city}</span>
                      </p>
                    </div>
                  </div>

                  {/* Bed & ICU availability demo badges */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Beds</span>
                      <strong className="text-slate-800">{hosp.bedCapacity}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Avail. (Demo)</span>
                      <strong className="text-emerald-600">{hosp.availableBedsDemo}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">ICU Demo</span>
                      <strong className="text-teal-600">{hosp.icuBedsDemo}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <a
                    href={`tel:${hosp.emergencyPhone.split('/')[0].trim()}`}
                    className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Hotline: {hosp.emergencyPhone.split('/')[0].trim()}</span>
                  </a>

                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Get Directions"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Directions</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ambulance Dispatch Simulation Info */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-bold">Ambulance Dispatch Support (Demo Simulation)</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
          Under the National Ambulance Service (108), Advanced Life Support (ALS) and Basic Life Support (BLS) ambulances are equipped with defibrillators, oxygen supplies, and trained Emergency Medical Technicians (EMTs).
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => {
              setSelectedAmbulance('ALS-108');
              showToast('Demo ALS Ambulance dispatch simulated. Dial 108 for actual dispatch.', 'info');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 text-teal-300"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Request ALS Cardiac Ambulance (Demo)</span>
          </button>
          <button
            onClick={() => {
              setSelectedAmbulance('BLS-102');
              showToast('Demo Neonatal/Maternal transport simulated. Dial 102 for actual dispatch.', 'info');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 text-slate-300"
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Maternal / Neonatal Transport (Demo)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
