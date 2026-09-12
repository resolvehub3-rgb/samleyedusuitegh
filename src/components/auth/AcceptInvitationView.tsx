import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  UserCheck,
  GraduationCap,
  Eye,
  EyeOff,
  Shield,
  Zap,
  Globe,
  Users,
  Moon,
  Sun,
  ArrowLeft
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface AcceptInvitationViewProps {
  onNavigateToLogin?: () => void;
  onSwitchToLogin?: () => void;
  onNavigateToHome?: () => void;
}

export const AcceptInvitationView: React.FC<AcceptInvitationViewProps> = ({ onNavigateToLogin, onSwitchToLogin, onNavigateToHome }) => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleLoginClick = () => {
    if (onNavigateToLogin) onNavigateToLogin();
    else if (onSwitchToLogin) onSwitchToLogin();
  };

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStatusMsg({ type: 'error', text: 'Please provide both email and password.' });
      return;
    }
    if (password !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (password.length < 6) {
      setStatusMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    const supabase = getSupabase();

    try {
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (profileErr) {
        setStatusMsg({ type: 'error', text: `Failed to check invitation: ${profileErr.message}` });
        setLoading(false);
        return;
      }

      if (!profileData) {
        setStatusMsg({
          type: 'error',
          text: 'No invitation found for this email address. Please contact your school administrator.'
        });
        setLoading(false);
        return;
      }

      if (!profileData.is_active) {
        setStatusMsg({
          type: 'error',
          text: 'This account has been deactivated. Please contact your school administrator.'
        });
        setLoading(false);
        return;
      }

      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: profileData.full_name,
            role: profileData.role
          }
        }
      });

      if (signUpErr) {
        if (signUpErr.message?.includes('already registered')) {
          const loginRes = await login(email, password);
          if (loginRes.success) {
            window.history.pushState({}, '', '/');
            return;
          }
          setStatusMsg({
            type: 'error',
            text: 'Account already registered. Please sign in with your password or request a password reset.'
          });
          setLoading(false);
          return;
        }
        setStatusMsg({ type: 'error', text: signUpErr.message });
        setLoading(false);
        return;
      }

      if (signUpData.user && signUpData.user.id !== profileData.id) {
        await supabase
          .from('profiles')
          .update({ id: signUpData.user.id })
          .eq('email', email.trim().toLowerCase());
      }

      setStatusMsg({
        type: 'success',
        text: 'Account setup complete! Logging you into your portal...'
      });

      const loginRes = await login(email, password);
      if (loginRes.success) {
        window.history.pushState({}, '', '/');
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err?.message || 'An error occurred while accepting invitation.'
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Users, title: 'Join Your School', desc: 'Access teacher or parent portal instantly' },
    { icon: Shield, title: 'Secure Access', desc: 'Enterprise-grade authentication & data protection' },
    { icon: Globe, title: 'Cloud Portal', desc: 'Access from any device, anywhere in Ghana' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Left Panel — Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600">
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
              Accept your school invitation
            </h1>
            <p className="mt-4 text-base text-white/80 leading-relaxed">
              You've been invited to join your school's management portal. Set up your password and start using the platform today.
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
              <span>Instant Activation</span>
            </div>
            <div className="w-px h-4 bg-white/30" />
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            {/* Mobile Brand */}
            <div className="lg:hidden flex flex-col items-center mb-8">
              <img src="/logo.png" alt="SamleyEduSuite" className="w-14 h-14 rounded-2xl object-contain shadow-xl shadow-orange-500/25 ring-4 ring-orange-500/10 mb-3" />
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Accept Invitation
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set up your Teacher or Parent access
              </p>
            </div>

            {/* Desktop Brand */}
            <div className="hidden lg:block mb-8">
              <div className="flex items-center gap-3 mb-6">
                <img src="/logo.png" alt="SamleyEduSuite" className="w-10 h-10 rounded-xl object-contain shadow-lg shadow-orange-500/20" />
                <span className="font-bold text-slate-900 dark:text-white">SamleyEduSuite</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Accept Your Invitation
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Set up your password to access the school portal
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

            {/* Form Card */}
            <div className="bg-white dark:bg-slate-900 py-8 px-7 sm:px-8 shadow-xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-200 dark:border-slate-800 rounded-3xl">
              
              {/* Status Message */}
              {statusMsg && (
                <div
                  className={`mb-5 p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs ${
                    statusMsg.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {statusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <p className="leading-relaxed">{statusMsg.text}</p>
                </div>
              )}

              <form onSubmit={handleAccept} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Invited Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Create Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
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
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Setting up...</span>
                    </div>
                  ) : (
                    <>
                      <span>Set Password & Access Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  type="button"
                  id="back-to-login-btn"
                  onClick={handleLoginClick}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white underline cursor-pointer"
                >
                  Already configured? Sign in here
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-[11px] text-slate-400 dark:text-slate-500">
              Protected by Supabase Authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
