import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockHospitals } from '../../data/mockHospitals';
import { mockDoctors } from '../../data/mockDoctors';
import { AppointmentBookingModal } from '../../components/patient/AppointmentBookingModal';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  ShieldCheck, 
  ShieldAlert, 
  Navigation, 
  Stethoscope, 
  CheckCircle2, 
  ExternalLink,
  Bed,
  Calendar,
  Sparkles
} from 'lucide-react';

export const HospitalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const hospital = mockHospitals.find(h => h.id === id) || mockHospitals[0];

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>(undefined);

  // Doctors affiliated with this hospital
  const hospitalDoctors = mockDoctors.filter(d => d.hospitalId === hospital.id);

  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ' ' + hospital.address)}`;

  const facilities = [
    '24x7 Emergency Casualty & Trauma Care',
    'State-of-the-Art Digital Cath Lab',
    'Advanced High-Field 3T MRI & 128-Slice CT',
    'In-House NABL Accredited Pathology Hub',
    '24-Hour In-Patient Pharmacy & Cold-Chain Storage',
    'Dedicated Level-3 Neonatal Intensive Care (NICU)',
    'Cashless TPA & Ayushman Bharat ABHA Desk',
    'Dedicated Ambulance Fleet with ALS/BLS Telemetry'
  ];

  const handleBookWithDoctor = (docId: string) => {
    setSelectedDoctorId(docId);
    setIsBookingOpen(true);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hospital Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[300px] flex flex-col justify-end p-6 sm:p-10 shadow-elevated">
        <img
          src={hospital.image}
          alt={hospital.name}
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-900 shadow">
              {hospital.type} Institution
            </span>
            {hospital.ayushmanEmpanelled && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500 text-slate-950 shadow">
                ABHA / PM-JAY Empanelled
              </span>
            )}
            {hospital.emergencyAvailable && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                24x7 Emergency Casualty
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {hospital.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 flex items-start gap-1.5 max-w-2xl">
            <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
            <span>{hospital.address}, {hospital.city}, {hospital.state} - {hospital.pincode}</span>
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-bold">{hospital.rating}</span>
              <span className="text-slate-300">({hospital.reviewCount} Reviews)</span>
            </div>
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
              <Clock className="w-4 h-4 text-teal-300" />
              <span>{hospital.operatingHours}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
              <Phone className="w-4 h-4 text-emerald-300" />
              <span>Emergency: {hospital.emergencyPhone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Details & Available Doctors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Departments, Doctors, Facilities */}
        <div className="lg:col-span-8 space-y-8">
          {/* Departments & Specialties */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              Departments & Clinical Centers of Excellence
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {hospital.departments.map(dept => (
                <div key={dept} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>{dept}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Affiliated Specialists & Doctors */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  Specialists Practicing at this Facility
                </h2>
                <p className="text-xs text-slate-500">Book in-person OPD consultation slots</p>
              </div>
            </div>

            {hospitalDoctors.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                All affiliated doctors are currently booked for today. You can browse all specialists via Doctor Search.
              </div>
            ) : (
              <div className="space-y-4">
                {hospitalDoctors.map(doc => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-900">{doc.name}</h4>
                          {doc.verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                          )}
                        </div>
                        <p className="text-xs text-teal-700 font-medium">{doc.specialty}</p>
                        <p className="text-[11px] text-slate-400">{doc.qualification}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                          <span>Fee: <strong className="text-slate-900">₹{doc.consultationFee}</strong></span>
                          <span>•</span>
                          <span>{doc.experienceYears}+ Yrs Exp</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookWithDoctor(doc.id)}
                      className="w-full sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book OPD Slot</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Key Services & Facilities */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              Services, Facilities & Infrastructure
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {facilities.map((fac, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 flex-shrink-0" />
                  <span>{fac}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Quick Actions, Capacity, GPS */}
        <div className="lg:col-span-4 space-y-6">
          {/* Capacity Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Bed className="w-4 h-4 text-teal-600" />
              Operational Capacity (Demo Data)
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
                <span className="text-slate-500">Total Sanctioned Beds</span>
                <strong className="text-slate-800">{hospital.bedCapacity}</strong>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl text-xs">
                <span className="text-emerald-800 font-medium">Available General Beds (Demo)</span>
                <strong className="text-emerald-700 font-bold">{hospital.availableBedsDemo}</strong>
              </div>
              <div className="flex items-center justify-between p-3 bg-teal-50 rounded-xl text-xs">
                <span className="text-teal-800 font-medium">Available ICU Beds (Demo)</span>
                <strong className="text-teal-700 font-bold">{hospital.icuBedsDemo}</strong>
              </div>
            </div>

            <p className="text-[10px] text-slate-400">
              * Live bed availability is simulated for demonstration. Verify by calling hospital reception before transit.
            </p>
          </div>

          {/* Navigation & Contact Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-teal-600" />
              Location & Directions
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              {hospital.address}, {hospital.city}, {hospital.state} - {hospital.pincode}
            </p>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <a
              href={`tel:${hospital.phone.split('/')[0].trim()}`}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-slate-600" />
              <span>Call Reception: {hospital.phone.split('/')[0]}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        preselectedDoctorId={selectedDoctorId}
        preselectedHospitalId={hospital.id}
      />
    </div>
  );
};
