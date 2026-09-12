import React, { useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Calendar } from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { EmptyState } from '../common/EmptyState';
import { SkeletonTable } from '../common/SkeletonLoader';

export const SuperAdminNotifications: React.FC = () => {
  const { platformNotifications, platformUnreadCount, markNotificationRead, markAllNotificationsRead, loading } = useSuperAdmin();

  if (loading && platformNotifications.length === 0) return <SkeletonTable rows={6} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Notifications</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {platformUnreadCount > 0 ? `${platformUnreadCount} unread notification${platformUnreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {platformUnreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="px-4 py-2 text-xs font-semibold text-orange-600 border border-orange-200 dark:border-orange-800 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {platformNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="Platform notifications will appear here when events occur."
        />
      ) : (
        <div className="space-y-2">
          {platformNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => { if (!notif.is_read) markNotificationRead(notif.id); }}
              className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs cursor-pointer transition-all hover:shadow-md ${
                !notif.is_read ? 'border-l-4 border-l-orange-500' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{notif.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{notif.message}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(notif.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {notif.related_entity && <span className="capitalize">• {notif.related_entity}</span>}
                  </div>
                </div>
                {!notif.is_read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0 mt-1" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
