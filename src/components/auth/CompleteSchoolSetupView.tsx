import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Building2, 
  ArrowRight, 
  LogOut, 
  AlertCircle, 
  CheckCircle2, 
  GraduationCap,
  Shield,
  Zap,
  Globe,
  Moon,
  Sun,
  ArrowLeft
} from 'lucide-react';
import { GHANAIAN_REGIONS } from '../../types/database';

export const CompleteSchoolSetupView: React.FC = () => {
  const { user, createSchoolForCurrentUser, logout, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [schoolName, setSchoolName] = useState('');
  const [region, setRegion] = useState('Greater Accra');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [motto, setMotto] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRetryCheck = async () => {
    setChecking(true);
    setErrorMsg(null);
    try {
      await refreshProfile();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to refresh profile.');
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!schoolName.trim()) {
      setErrorMsg('Please enter your school name.');
      return;
    }
    if (!district.trim()) {
      setErrorMsg('Please specify the district or municipality.');
      return;
    }

    setLoading(true);
    try {
      const res = await createSchoolForCurrentUser(
        {
          name: schoolName.trim(),
          email: user?.email || '',
          phone: phone.trim() || '0240000000',
          address: address.trim() || `${district}, ${region}`,
          region,
          district: district.trim(),
          motto: motto.trim() || undefined
        },
        {
          full_name: fullName.trim() || '',
          phone: phone.trim() || '0240000000'
        }
      );

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to complete school setup.');
        setLoading(false);
      } else {
        // Update URL to root after successful school setup
        window.history.pushState({}, '', '/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during setup.');
      setLoading(false);
    }
  };

  const features = [
    { icon: Zap, title: 'Auto-Configure', desc: 'Classes KG 1 to JHS 3 & GES subjects created automatically' },
    { icon: Shield, title: 'Secure Platform', desc: 'Supabase Auth with row-level security' },
    { icon: Globe, title: 'Ghana-First', desc: 'GES curriculum, GHS currency & local standards' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Left Panel — Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700">
        <div className="absolute inset-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-black/10 blur-3xl" />
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
              Complete your school setup
            </h1>
            <p className="mt-4 text-base text-white/80 leading-relaxed">
              Link your account to your school to activate the full management dashboard with Ghanaian curriculum classes and subjects.
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
              <span>Instant Launch</span>
            </div>
            <div className="w-px h-4 bg-white/30" />
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Supabase Auth</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-lg">
            {/* Mobile Brand */}
            <div className="lg:hidden flex flex-col items-center mb-6">
              <img src="/logo.png" alt="SamleyEduSuite" className="w-14 h-14 rounded-2xl object-contain shadow-xl shadow-orange-500/25 ring-4 ring-orange-500/10 mb-3" />
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Complete School Setup
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Signed in as {user?.email}
              </p>
            </div>

            {/* Desktop Brand */}
            <div className="hidden lg:block mb-6">
              <div className="flex items-center gap-3 mb-5">
                <img src="/logo.png" alt="SamleyEduSuite" className="w-10 h-10 rounded-xl object-contain shadow-lg shadow-orange-500/20" />
                <span className="font-bold text-slate-900 dark:text-white">SamleyEduSuite</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Complete School Activation
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Signed in as <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.email}</span>
              </p>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Form Card */}
            <div className="bg-white dark:bg-slate-900 py-8 px-7 sm:px-8 shadow-xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-200 dark:border-slate-800 rounded-3xl">
              
              {/* Error Message */}
              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{errorMsg}</p>
                </div>
              )}

              {/* Info Banner */}
              <div className="mb-5 p-3.5 bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-800/50 rounded-2xl text-xs text-orange-950 dark:text-orange-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Link your account to your school to enter the <strong>School Owner Dashboard</strong>. Ghanaian curriculum classes and subjects will be configured automatically.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Proprietor / Admin Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      School / Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="024 000 0000"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Campus Address / Location
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
                    placeholder="e.g. Knowledge, Integrity and Service"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                  />
                </div>

                <div className="pt-3 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 rounded-xl transition-all cursor-pointer shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Activating School...</span>
                      </div>
                    ) : (
                      <>
                        <span>Launch School Owner Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleRetryCheck}
                      disabled={checking}
                      className="text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 font-semibold cursor-pointer underline"
                    >
                      {checking ? 'Checking...' : 'Re-check existing school data'}
                    </button>

                    <button
                      type="button"
                      onClick={logout}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <p className="mt-6 text-center text-[11px] text-slate-400 dark:text-slate-500">
              Your school data is stored securely via Supabase
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
