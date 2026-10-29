import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { 
  Heart, 
  User, 
  Building2, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'patient' | 'provider'>('patient');

  // Common form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Provider specific fields
  const [providerType, setProviderType] = useState<'Doctor' | 'Hospital' | 'Pharmacy' | 'Diagnostic Lab' | 'Supplier'>('Hospital');
  const [organizationName, setOrganizationName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ isPending: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the privacy policy and terms of service.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        accountType: activeTab,
        fullName,
        email,
        phone,
        password,
        city,
        state,
        address,
        ...(activeTab === 'provider' ? {
          providerType,
          organizationName,
          licenseNumber
        } : {})
      };

      const res = await api.post('/auth/register', payload);

      if (res.success) {
        if (res.isPending) {
          setSuccessInfo({
            isPending: true,
            message: 'Your healthcare provider registration has been submitted and is currently PENDING VERIFICATION by the Central Administrator. You will receive an SMS and email notification upon approval.'
          });
        } else {
          setSuccessInfo({
            isPending: false,
            message: 'Patient account created successfully! You can now sign in with your credentials.'
          });
          if (res.token) {
            localStorage.setItem('bhc_auth_token', res.token);
            showToast('Account registered successfully', 'success');
            setTimeout(() => navigate('/patient'), 1500);
          }
        }
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-medblue-700 items-center justify-center text-white shadow-lg mb-2">
          <Heart className="w-6 h-6 fill-white/20 stroke-[2.2]" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Join Bharat <span className="text-teal-600">HealthConnect</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Create an account to access unified healthcare across India
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => { setActiveTab('patient'); setError(''); setSuccessInfo(null); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'patient' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Patient Registration</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('provider'); setError(''); setSuccessInfo(null); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'provider' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Healthcare Provider</span>
            </button>
          </div>

          {successInfo ? (
            <div className={`p-6 rounded-2xl border text-center space-y-4 ${
              successInfo.isPending ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto text-white ${
                successInfo.isPending ? 'bg-amber-500' : 'bg-emerald-600'
              }`}>
                {successInfo.isPending ? <ShieldCheck className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>
              <h3 className="text-base font-bold">
                {successInfo.isPending ? 'Application Submitted (Pending Verification)' : 'Registration Complete!'}
              </h3>
              <p className="text-xs leading-relaxed opacity-90">
                {successInfo.message}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-colors"
              >
                <span>Go to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {activeTab === 'provider' && (
                <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-3">
                  <div className="text-xs font-bold text-teal-900">Provider Classification</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(['Hospital', 'Doctor', 'Pharmacy', 'Diagnostic Lab', 'Supplier'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setProviderType(type)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          providerType === type ? 'bg-teal-600 text-white border-teal-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Facility / Business Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CarePlus Clinic"
                        value={organizationName}
                        onChange={e => setOrganizationName(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        License / Registration No.
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MCI-2024-99182"
                        value={licenseNumber}
                        onChange={e => setLicenseNumber(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {activeTab === 'provider' ? 'Authorized Person Name' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full legal name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 00000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Hyderabad"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    placeholder="Telangana"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Create Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Physical Address</label>
                <input
                  type="text"
                  placeholder="Street address, landmark, PIN code"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                  />
                  <span className="text-xs text-slate-600 leading-snug">
                    I agree to the Bharat HealthConnect{' '}
                    <span className="text-teal-600 font-semibold underline">Terms of Service</span> and{' '}
                    <span className="text-teal-600 font-semibold underline">Privacy Policy</span>.
                    {activeTab === 'provider' && ' I declare that all medical registration credentials provided are authentic and subject to clinical audit verification.'}
                  </span>
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
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>{activeTab === 'provider' ? 'Submit Provider Application for Verification' : 'Register Patient Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-teal-600 hover:text-teal-700">
              Sign In to Your Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
