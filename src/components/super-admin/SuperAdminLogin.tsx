import React, { useState } from 'react';
import { Shield, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';

export const SuperAdminLogin: React.FC = () => {
  const { login, loading, logout: saLogout } = useSuperAdmin();

  const handleBackToHome = () => {
    // Fire-and-forget signout — onAuthStateChange will clear both contexts.
    saLogout().catch(() => {});
    // Force a clean reload at root so showLanding re-initializes to true.
    window.history.replaceState({}, '', '/');
    window.location.reload();
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    setError('');

    const result = await login(email.trim(), password);
    if (!result.success && result.error) {
      setError(result.error);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 transition-colors">
      <div className="w-full max-w-md">
        {/* Mobile Back to Home – full-width at top */}
        <button
          type="button"
          onClick={handleBackToHome}
          className="w-full flex items-center justify-center gap-2 py-3 mb-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer sm:hidden"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to School Login
        </button>

        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-500/20 mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            SamleyEduSuite
          </h1>
          <p className="text-sm text-orange-600 dark:text-orange-400 font-semibold mt-1">
            Platform Administration
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Sign in to access the Super Admin Dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="sa-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                id="sa-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@samleyedusuite.com"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400"
                autoComplete="email"
                autoFocus
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="sa-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="sa-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 pr-10 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full py-2.5 px-4 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Sign In to Admin Panel
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Super Admin access only. Unauthorized access is prohibited.
            </p>
          </div>
        </div>

        {/* Back to School Login – desktop only */}
        <div className="text-center mt-4 hidden sm:block">
          <button
            type="button"
            onClick={handleBackToHome}
            className="text-xs text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 font-medium transition-colors cursor-pointer"
          >
            ← Back to School Login
          </button>
        </div>
      </div>
    </div>
  );
};
