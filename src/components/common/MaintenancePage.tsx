import React from 'react';
import { Wrench, Shield, Mail } from 'lucide-react';
import { usePublicPlatformSettings } from '../../hooks/usePublicPlatformSettings';

export function MaintenancePage({ onLogout }: { onLogout?: () => void }) {
  const { contact_email } = usePublicPlatformSettings();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 transition-colors">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/10">
          <Wrench className="w-10 h-10 text-orange-600 dark:text-orange-400" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          System Under Maintenance
        </h1>

        {/* Description */}
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-sm mx-auto">
          We&apos;re currently performing scheduled maintenance to improve your experience.
          Your school data is safe and we&apos;ll be back online shortly.
        </p>

        {/* Status Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Your data is secure</p>
          </div>
          <div className="h-px bg-slate-100 dark:bg-slate-800 mb-4" />
          <div className="flex items-center justify-center gap-3">
            <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <div className="text-left">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Need help?</p>
              <a
                href={`mailto:${contact_email}`}
                className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
              >
                {contact_email}
              </a>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
          </span>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Maintenance in progress — please check back later
          </p>
        </div>

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="px-6 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
}
