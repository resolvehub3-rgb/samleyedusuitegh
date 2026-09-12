import React, { useState } from 'react';import { 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Building2, 
  Eye, 
  EyeOff, 
  Shield, 
  BarChart3, 
  MessageSquare, 
  Globe, 
  Zap, 
  ChevronRight,
  Moon,
  Sun,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';


interface LoginViewProps {
  onNavigateToRegister?: () => void;
  onSwitchToRegister?: () => void;
  onNavigateToInvitation?: () => void;
  onSwitchToAcceptInvite?: () => void;
  onNavigateToHome?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onNavigateToRegister,
  onSwitchToRegister,
  onNavigateToInvitation,
  onSwitchToAcceptInvite,
  onNavigateToHome
}) => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegisterClick = () => {
    if (onNavigateToRegister) onNavigateToRegister();
    else if (onSwitchToRegister) onSwitchToRegister();
  };

  const handleInvitationClick = () => {
    if (onNavigateToInvitation) onNavigateToInvitation();
    else if (onSwitchToAcceptInvite) onSwitchToAcceptInvite();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await login(email.trim(), password);
    if (!res.success) {
      const err = res.error || 'Invalid credentials or user does not exist.';
      setErrorMessage(err);
    } else {
      // Update URL to root after successful login
      window.history.pushState({}, '', '/');
    }
    setLoading(false);
  };

  const features = [
    { icon: BarChart3, title: 'Academic Analytics', desc: 'Real-time grades, attendance & performance insights' },
    { icon: MessageSquare, title: 'Parent Portal', desc: 'Direct communication between school and parents' },
    { icon: Shield, title: 'Secure & Private', desc: 'Role-based access with enterprise-grade security' },
    { icon: Globe, title: 'GES Aligned', desc: 'KG to JHS curriculum with automatic configuration' },
  ];



  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Left Panel — Hero / Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700">
        {/* Decorative shapes */}
        <div className="absolute inset-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-black/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
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
              The modern school management platform
            </h1>
            <p className="mt-4 text-base text-white/80 leading-relaxed">
              Streamline administration, engage parents, and track student progress — all from one beautiful dashboard.
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
              <span>Built for Ghana</span>
            </div>
            <div className="w-px h-4 bg-white/30" />
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Supabase Auth</span>
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
          <div className="w-full max-w-md">
            {/* Mobile Brand (visible on small screens) */}
            <div className="lg:hidden flex flex-col items-center mb-8">
              <img src="/logo.png" alt="SamleyEduSuite" className="w-14 h-14 rounded-2xl object-contain shadow-xl shadow-orange-500/25 ring-4 ring-orange-500/10 mb-3" />
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                SamleyEduSuite
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                School Management Platform
              </p>
            </div>

            {/* Desktop Brand */}
            <div className="hidden lg:block mb-8">
              <div className="flex items-center gap-3 mb-6">
                <img src="/logo.png" alt="SamleyEduSuite" className="w-10 h-10 rounded-xl object-contain shadow-lg shadow-orange-500/20" />
                <span className="font-bold text-slate-900 dark:text-white">SamleyEduSuite</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Sign in to your school portal
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

            {/* Login Card */}
            <div className="bg-white dark:bg-slate-900 p-7 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-200 dark:border-slate-800 rounded-3xl">
              


              {/* Error Message */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed flex-1">
                    {errorMessage}

                  </div>
                </div>
              )}

              {/* Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address
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
                      className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="block w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all shadow-lg shadow-orange-600/25 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white dark:bg-slate-900 px-3 text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                    New to SamleyEduSuite?
                  </span>
                </div>
              </div>

              {/* Register CTA */}
              <button
                type="button"
                id="register-school-button"
                onClick={handleRegisterClick}
                className="w-full py-3 px-4 text-sm font-bold text-orange-700 dark:text-orange-300 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/50 border border-orange-200 dark:border-orange-800/60 rounded-xl inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                Register a New School
                <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
              </button>

              {/* Footer links */}
              <div className="mt-5 flex items-center justify-between text-xs">
                <button
                  type="button"
                  id="accept-invitation-button"
                  onClick={handleInvitationClick}
                  className="font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white underline cursor-pointer"
                >
                  Accept Invitation
                </button>
              </div>
            </div>

            {/* Bottom text */}
            <p className="mt-6 text-center text-[11px] text-slate-400 dark:text-slate-500">
              Protected by Supabase Authentication &middot; SSL Encrypted
            </p>
          </div>
        </div>
      </div>


    </div>
  );
};
