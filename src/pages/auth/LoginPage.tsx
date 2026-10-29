import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { 
  Heart, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  Truck, 
  User, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { setRole, showToast } = useApp();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const demoAccounts = [
    { role: 'admin', label: 'Central Admin', email: 'admin@bharathealth.in', icon: <ShieldCheck className="w-4 h-4 text-purple-600" />, desc: 'Platform oversight & approvals' },
    { role: 'hospital', label: 'Hospital Admin', email: 'hospital@aiims-hyd.in', icon: <Building2 className="w-4 h-4 text-medblue-600" />, desc: 'AIIMS Hyderabad operations' },
    { role: 'doctor', label: 'Doctor', email: 'doctor@bharathealth.in', icon: <Stethoscope className="w-4 h-4 text-teal-600" />, desc: 'Dr. Swaminathan (Cardiology)' },
    { role: 'staff', label: 'Hospital Staff', email: 'staff@aiims-hyd.in', icon: <User className="w-4 h-4 text-indigo-600" />, desc: 'Admission desk & triage' },
    { role: 'patient', label: 'Patient', email: 'patient@bharathealth.in', icon: <Heart className="w-4 h-4 text-rose-600" />, desc: 'Charan Kumar (ABHA Account)' },
    { role: 'pharmacy', label: 'Pharmacist', email: 'pharmacy@bharathealth.in', icon: <Pill className="w-4 h-4 text-emerald-600" />, desc: 'Sanjeevani MedPlus QR Sales' },
    { role: 'laboratory', label: 'Lab Admin', email: 'laboratory@bharathealth.in', icon: <FlaskConical className="w-4 h-4 text-amber-600" />, desc: 'Vijaya Bio-Diagnostics' },
    { role: 'lab_staff', label: 'Lab Tech', email: 'tech@bharathealth.in', icon: <FlaskConical className="w-4 h-4 text-cyan-600" />, desc: 'Phlebotomy & Sample Testing' },
    { role: 'supplier', label: 'Medical Supplier', email: 'supplier@bharathealth.in', icon: <Truck className="w-4 h-4 text-blue-600" />, desc: 'Bharat MedLogistics Wholesale' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter your email or registered phone number and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        identifier: identifier.trim(),
        password,
        rememberMe
      });

      if (response.success && response.token) {
        localStorage.setItem('bhc_auth_token', response.token);
        localStorage.setItem('bhc_user', JSON.stringify(response.user));

        // Map server role to frontend currentRole
        let mappedRole = 'patient';
        if (response.user.role === 'CENTRAL_ADMIN') mappedRole = 'admin';
        else if (response.user.role === 'HOSPITAL_ADMIN') mappedRole = 'hospital';
        else if (response.user.role === 'DOCTOR') mappedRole = 'doctor';
        else if (response.user.role === 'HOSPITAL_STAFF') mappedRole = 'staff';
        else if (response.user.role === 'PHARMACIST') mappedRole = 'pharmacy';
        else if (response.user.role === 'LAB_ADMIN') mappedRole = 'laboratory';
        else if (response.user.role === 'LAB_STAFF') mappedRole = 'lab_staff';
        else if (response.user.role === 'SUPPLIER') mappedRole = 'supplier';

        setRole(mappedRole as any);
        showToast(`Welcome back, ${response.user.fullName}!`, 'success');
        navigate(response.redirectUrl || `/${mappedRole}`);
      } else {
        setErrorMessage(response.message || 'Invalid login credentials.');
      }
    } catch (err: any) {
      // Fallback for offline demo state
      showToast('Connecting in offline demo simulation mode', 'info');
      navigate('/patient');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (account: typeof demoAccounts[0]) => {
    setIdentifier(account.email);
    setPassword('Demo@1234');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon & Heading */}
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-medblue-700 items-center justify-center text-white shadow-lg mb-3">
          <Heart className="w-7 h-7 fill-white/20 stroke-[2.2]" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Bharat <span className="text-teal-600">HealthConnect</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          One Nation. One Connected Healthcare Ecosystem.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Sign in to your portal</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your verified credentials to access your clinical dashboard
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address or Registered Phone
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="name@bharathealth.in or +91 98765 00000"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Account Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span className="text-xs text-slate-600">Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Bharat HealthConnect</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                One-Click Demo Roles (Dev Mode)
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Password: Demo@1234</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {demoAccounts.map(account => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => handleSelectDemo(account)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between hover:border-teal-400 hover:shadow-xs ${
                    identifier === account.email ? 'bg-teal-50/70 border-teal-500 ring-1 ring-teal-500' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {account.icon}
                    <span className="text-xs font-bold text-slate-800 truncate">{account.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 truncate">{account.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100">
            <span>
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-teal-600 hover:text-teal-700">
                Register as Patient or Provider
              </Link>
            </span>
            <Link to="/emergency" className="text-rose-600 font-semibold hover:underline">
              24x7 Emergency Desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
