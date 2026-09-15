import React from 'react';
import { Lock, Mail, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SubscriptionNoticeProps {
  role: string;
}

export const SubscriptionNotice: React.FC<SubscriptionNoticeProps> = ({ role }) => {
  const { school, logout } = useAuth();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md">
        {/* Lock Icon */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-lg font-black text-white tracking-tight">School Subscription Expired</h2>
          <p className="text-xs text-slate-400 mt-1">
            {role === 'teacher' ? 'Teaching' : 'Parent'} access is temporarily paused
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 text-center space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {school?.name ? (
                <>
                  <span className="font-semibold text-slate-900 dark:text-white">{school.name}</span> has not renewed its SamleyEduSuite subscription.
                </>
              ) : (
                'Your school has not renewed its SamleyEduSuite subscription.'
              )}
            </p>

            <p className="text-sm text-slate-600 dark:text-slate-400">
              Please contact your <span className="font-semibold text-slate-900 dark:text-white">School Administrator</span> to complete the subscription renewal. Access will be restored automatically once payment is verified.
            </p>

            {/* Contact hint */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-300">How to reach your admin:</p>
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                <span>Send a message via the school admin</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
