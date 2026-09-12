import React, { useState, useEffect } from 'react';
import { User, Save, Loader2, Shield, Mail, Phone, Lock, CheckCircle } from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { getSupabase } from '../../lib/supabase';
import { SkeletonCard } from '../common/SkeletonLoader';

export const SuperAdminProfile: React.FC = () => {
  const { user, updateProfile, changePassword } = useSuperAdmin();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  // Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const supabase = getSupabase();
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) {
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
      }
      setLoading(false);
    }
    loadProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) return;
    setSaving(true);
    setSuccess('');
    const ok = await updateProfile({ full_name: fullName.trim(), phone: phone.trim() || undefined });
    if (ok) {
      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setChangingPassword(true);
    const result = await changePassword(newPassword);
    if (result.success) {
      setPasswordSuccess('Password changed successfully.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } else {
      setPasswordError(result.error || 'Failed to change password.');
    }
    setChangingPassword(false);
  };

  if (loading) return <SkeletonCard />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Super Admin Profile</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage your profile and security settings</p>
      </div>

      {/* Profile Info */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center">
            <Shield className="w-7 h-7 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{fullName || 'Super Admin'}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" />{user?.email}</p>
            <p className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold mt-0.5">SUPER_ADMIN</p>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl mb-4">
            <CheckCircle className="w-4 h-4" /> {success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none placeholder:text-slate-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
            <input type="email" value={user?.email || ''} disabled
              className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 rounded-xl cursor-not-allowed" />
            <p className="text-[10px] text-slate-400 mt-1">Email cannot be changed from here.</p>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Lock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Password</h3>
            <p className="text-[11px] text-slate-500">Update your account password via Supabase Auth</p>
          </div>
        </div>

        {passwordError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl mb-4">{passwordError}</div>
        )}
        {passwordSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {passwordSuccess}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password" className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none placeholder:text-slate-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password" className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none placeholder:text-slate-400" />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="px-5 py-2.5 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
          >
            {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {changingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
};
