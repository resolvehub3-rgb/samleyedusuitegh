import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface ForcePasswordResetProps {
  onComplete: () => void;
}

export const ForcePasswordReset: React.FC<ForcePasswordResetProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = getSupabase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword === confirmPassword) {
      // Same password as before is fine, but we still update it
    } else if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);

    try {
      // Update the user's password in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        setError(`Failed to update password: ${updateError.message}`);
        setLoading(false);
        return;
      }

      // Mark password as reset in the profiles table
      if (user) {
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ must_reset_password: false })
          .eq('id', user.id);

        if (profileUpdateError) {
          console.warn('Failed to update profile flag:', profileUpdateError.message);
        }
      }

      setSuccess(true);

      // Auto-close after 2 seconds
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Password Updated Successfully!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your new password has been saved. Redirecting to your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-orange-50/50 dark:bg-orange-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Set Your New Password
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                For your security, please create a personal password
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                New Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="block w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="block w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all shadow-lg shadow-orange-600/25 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating...</span>
                </div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Set New Password</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] text-slate-400 dark:text-slate-500">
            Choose a password you can remember. Minimum 6 characters.
          </p>
        </div>
      </div>
    </div>
  );
};
