import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Shield,
  Zap,
  Globe,
  Users,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { GHANAIAN_REGIONS } from '../../types/database';

interface RegisterSchoolViewProps {
  onNavigateToLogin?: () => void;
  onSwitchToLogin?: () => void;
  onNavigateToHome?: () => void;
}

export const RegisterSchoolView: React.FC<RegisterSchoolViewProps> = ({ onNavigateToLogin, onSwitchToLogin, onNavigateToHome }) => {
  const { registerSchool } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginClick = () => {
    if (onNavigateToLogin) onNavigateToLogin();
    else if (onSwitchToLogin) onSwitchToLogin();
  };

  // Step 1: School Profile
  const [schoolName, setSchoolName] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [schoolPhone, setSchoolPhone] = useState('');
  const [address, setAddress] = useState('');
  const [region, setRegion] = useState<string>(GHANAIAN_REGIONS[0]);
  const [district, setDistrict] = useState('');
  const [motto, setMotto] = useState('');

  // Step 2: Proprietor / Administrator Credentials
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim() || !schoolEmail.trim() || !schoolPhone.trim() || !district.trim()) {
      setErrorMsg('Please complete all required school profile fields.');
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim() || !ownerEmail.trim() || !ownerPhone.trim() || !ownerPassword) {
      setErrorMsg('Please complete all administrator fields.');
      return;
    }
    if (ownerPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await registerSchool(
      {
        name: schoolName.trim(),
        email: schoolEmail.trim(),
        phone: schoolPhone.trim(),
        address: address.trim() || `${district}, ${region}`,
        region,
        district: district.trim(),
        motto: motto.trim() || undefined
      },
      {
        full_name: ownerName.trim(),
        email: ownerEmail.trim(),
        password: ownerPassword,
        phone: ownerPhone.trim(),
        gender
      }
    );

    if (!res.success) {
      setErrorMsg(res.error || 'Registration failed. Please try again.');
    } else {
      // Update URL to root after successful registration
      window.history.pushState({}, '', '/');
    }
    setLoading(false);
  };

  const features = [
    { icon: Zap, title: 'Auto-Configuration', desc: 'KG 1 to JHS 3 classes & GES subjects created instantly' },
    { icon: Users, title: 'Multi-Role Access', desc: 'Admin, Teacher, Parent & Student portals included' },
    { icon: Shield, title: 'Enterprise Security', desc: 'Supabase Auth with row-level security policies' },
    { icon: Globe, title: '100% Ghanaian', desc: 'GES curriculum, GHS currency & local conventions' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Left Panel — Hero / Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700">
        <div className="absolute inset-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-black/10 blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Top: Brand */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img src="/logo.png" alt="SamleyEduSuite" className="w-12 h-12 rounded-2xl object-contain" />
              <span className="text-white/90 font-bold text-lg tracking-tight">SamleyEduSuite</span>
            </div>
          </div>

          {/* Center: Headline + Features */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
              Launch your school's digital portal
            </h1>
            <p className="mt-4 text-base text-white/80 leading-relaxed">
              Register your school and get a fully configured management platform with Ghanaian curriculum, GES subjects, and multi-role access — in minutes.
            </p>

            <div className="mt-10 space-y-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-colors">
                    <f.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{f.title}</p>
                    <p className="text-xs text-white/70 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Trust bar */}
          <div className="flex items-center gap-6 text-white/60 text-xs">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Instant Setup</span>
            </div>
            <div className="w-px h-4 bg-white/30" />
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Free to Start</span>
            </div>
            <div className="w-px h-4 bg-white/30" />
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Cloud Hosted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-xl">
            {/* Mobile Brand */}
            <div className="lg:hidden flex flex-col items-center mb-6">
              <img src="/logo.png" alt="SamleyEduSuite" className="w-14 h-14 rounded-2xl object-contain shadow-xl shadow-orange-500/25 ring-4 ring-orange-500/10 mb-3" />
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Register Your School
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ghanaian curriculum • KG to JHS
              </p>
            </div>

            {/* Desktop Brand */}
            <div className="hidden lg:block mb-6">
              <div className="flex items-center gap-3 mb-5">
                <img src="/logo.png" alt="SamleyEduSuite" className="w-10 h-10 rounded-xl object-contain shadow-lg shadow-orange-500/20" />
                <span className="font-bold text-slate-900 dark:text-white">SamleyEduSuite</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Register Your School
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Set up your cloud portal with automatic Ghanaian curriculum
              </p>
            </div>

            {/* Back to Home — Mobile full-width */}
            {onNavigateToHome && (
              <button
                onClick={onNavigateToHome}
                className="lg:hidden w-full inline-flex items-center justify-center gap-2 px-4 py-3 mb-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-sm text-xs font-semibold"
                aria-label="Back to home"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            )}
            {/* Back to Home — Desktop compact */}
            {onNavigateToHome && (
              <button
                onClick={onNavigateToHome}
                className="hidden lg:inline-flex absolute top-5 left-5 items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-sm text-xs font-semibold"
                aria-label="Back to home"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Multi-Step Progress */}
            <div className="mb-6 flex items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === 1 ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20' : 'bg-emerald-600 text-white'
                }`}>
                  {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                </div>
                <span className={`text-xs font-semibold ${step === 1 ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                  School Profile
                </span>
              </div>

              <div className={`w-10 h-0.5 rounded-full transition-colors ${step > 1 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />

              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === 2 ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  2
                </div>
                <span className={`text-xs font-semibold ${step === 2 ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                  Administrator Account
                </span>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white dark:bg-slate-900 py-8 px-7 sm:px-9 shadow-xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-200 dark:border-slate-800 rounded-3xl">
              
              {/* Error Message */}
              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed flex-1">
                    {errorMsg}
                  </div>
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleNext} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Official School Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="Enter your school name"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        School Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={schoolEmail}
                        onChange={(e) => setSchoolEmail(e.target.value)}
                        placeholder="info@school.edu.gh"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        School Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={schoolPhone}
                        onChange={(e) => setSchoolPhone(e.target.value)}
                        placeholder="024 000 0000"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Region (Ghana) *
                      </label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white transition-all"
                      >
                        {GHANAIAN_REGIONS.map((r) => (
                          <option key={r} value={r}>{r} Region</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        District / Municipality *
                      </label>
                      <input
                        type="text"
                        required
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="Enter district name"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Campus Address / Landmark
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Near Market Circle, East Legon"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      School Motto (Optional)
                    </label>
                    <input
                      type="text"
                      value={motto}
                      onChange={(e) => setMotto(e.target.value)}
                      placeholder="e.g. Excellence, Discipline and Integrity"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleLoginClick}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer underline"
                    >
                      Already have an account? Sign In
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-all cursor-pointer shadow-lg shadow-orange-600/20"
                    >
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Info Banner */}
                  <div className="p-3.5 bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-800/50 rounded-2xl text-xs text-orange-950 dark:text-orange-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Automatic Ghanaian Configuration:</p>
                      <p className="mt-0.5 text-orange-800 dark:text-orange-300">
                        Classes (KG 1 – JHS 3), GES subjects, 30/70 grading scale & GHS currency will be set up automatically.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Proprietor / Administrator Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Login Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        placeholder="admin@school.edu.gh"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={ownerPhone}
                        onChange={(e) => setOwnerPhone(e.target.value)}
                        placeholder="024 000 0000"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Create Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={ownerPassword}
                          onChange={(e) => setOwnerPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white transition-all"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 rounded-xl transition-all cursor-pointer shadow-lg shadow-orange-600/20 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating...</span>
                        </div>
                      ) : (
                        <>
                          <span>Activate School Portal</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Already have account link */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white underline cursor-pointer"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-[11px] text-slate-400 dark:text-slate-500">
              By registering, your school data is stored securely via Supabase
            </p>
          </div>
        </div>
      </div>


    </div>
  );
};
