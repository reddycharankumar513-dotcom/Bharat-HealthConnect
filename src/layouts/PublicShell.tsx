import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { DemoModeBanner } from '../components/common/DemoModeBanner';
import { Navbar } from '../components/common/Navbar';
import { ToastContainer } from '../components/common/ToastContainer';
import { AIAssistantModal } from '../components/chat/AIAssistantModal';
import { Heart, Shield, PhoneCall, Mail, MapPin, ExternalLink } from 'lucide-react';

export const PublicShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <DemoModeBanner />
      <Navbar />
      
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Reusable Public Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
            {/* Col 1: Brand */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow">
                  <Heart className="w-5 h-5 fill-white/20" />
                </div>
                <span className="font-bold text-xl tracking-tight text-white">
                  Bharat <span className="text-teal-400">HealthConnect</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                India's unified national digital health network connecting patients, registered doctors, hospitals, pharmacies, and diagnostic laboratories under Ayushman Bharat Digital Mission (ABDM) standards.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-teal-400 text-xs font-medium border border-slate-700">
                  <Shield className="w-3.5 h-3.5" />
                  ABHA Compliant Demo
                </span>
                <span className="text-xs text-slate-400">ISO 27001 Certified Architecture</span>
              </div>
            </div>

            {/* Col 2: Healthcare Portals */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                User Portals
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><Link to="/patient" className="hover:text-teal-400 transition-colors">Patient Portal</Link></li>
                <li><Link to="/doctor" className="hover:text-teal-400 transition-colors">Doctor OPD Portal</Link></li>
                <li><Link to="/hospital" className="hover:text-teal-400 transition-colors">Hospital Operations</Link></li>
                <li><Link to="/pharmacy" className="hover:text-teal-400 transition-colors">Pharmacy Inventory</Link></li>
                <li><Link to="/laboratory" className="hover:text-teal-400 transition-colors">Diagnostic Laboratory</Link></li>
                <li><Link to="/admin" className="hover:text-teal-400 transition-colors">Central Platform Admin</Link></li>
              </ul>
            </div>

            {/* Col 3: Public Services */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Healthcare Services
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><Link to="/hospitals" className="hover:text-teal-400 transition-colors">Hospital Locator & Maps</Link></li>
                <li><Link to="/doctors" className="hover:text-teal-400 transition-colors">Specialist Doctor Search</Link></li>
                <li><Link to="/laboratory/catalog" className="hover:text-teal-400 transition-colors">Diagnostic Test Catalog</Link></li>
                <li><Link to="/pharmacy/inventory" className="hover:text-teal-400 transition-colors">Prescription Medicine Stock</Link></li>
                <li><Link to="/emergency" className="hover:text-rose-400 font-semibold transition-colors">Emergency & Trauma 24x7</Link></li>
                <li><Link to="/patient/payments" className="hover:text-teal-400 transition-colors">Ayushman Bharat PM-JAY</Link></li>
              </ul>
            </div>

            {/* Col 4: Emergency & Contact */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-4 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" />
                Emergency Helplines
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-center justify-between text-white font-medium bg-slate-800/80 p-2 rounded-lg">
                  <span>National Emergency:</span>
                  <strong className="text-rose-400">112</strong>
                </li>
                <li className="flex items-center justify-between text-white font-medium bg-slate-800/80 p-2 rounded-lg">
                  <span>Medical Ambulance:</span>
                  <strong className="text-rose-400">108</strong>
                </li>
                <li className="flex items-center justify-between text-white font-medium bg-slate-800/80 p-2 rounded-lg">
                  <span>Pregnancy / Child:</span>
                  <strong className="text-rose-400">102</strong>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 Bharat HealthConnect Foundation. Prototype for demonstration purposes.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-400 cursor-pointer">Clinical Consent Guidelines</span>
              <Link to="/roles" className="text-teal-400 hover:text-teal-300 font-semibold">Demo Role Switcher</Link>
            </div>
          </div>
        </div>
      </footer>

      <ToastContainer />
      <AIAssistantModal />
    </div>
  );
};
