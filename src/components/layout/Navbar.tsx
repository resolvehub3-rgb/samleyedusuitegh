import React, { useState } from 'react';
import { 
  Bell, 
  Sun, 
  Moon, 
  LogOut,  Database,
  Radio,
  Menu, 
  X, 
  GraduationCap, 
  Building2, 
  UserCheck, 
  Users, 
  CheckCheck,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { Badge } from '../common/Badge';
import { isSupabaseConfigured } from '../../lib/supabase';
import { SupabaseSetupModal } from './SupabaseSetupModal';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onNavigateToNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen, onNavigateToNotifications }) => {
  const { profile, school, schoolSettings, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  const isConnected = isSupabaseConfigured();

  const roleLabels: Record<string, { title: string; variant: 'primary' | 'info' | 'success' }> = {
    admin: { title: 'School Admin', variant: 'primary' },
    teacher: { title: 'Class Teacher', variant: 'info' },
    parent: { title: 'Parent Portal', variant: 'success' }
  };

  const currentRole = profile?.role ? roleLabels[profile.role] : { title: 'Portal User', variant: 'primary' };

  return (
    <>
      <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between h-full px-4 sm:px-6">
          {/* Left section: Mobile menu button & School Branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              {school?.logo_url ? (
                <img
                  src={school.logo_url}
                  alt={school.name}
                  className="w-9 h-9 rounded-xl object-contain border border-slate-200 dark:border-slate-700 bg-white"
                />
              ) : (
                <img src="/logo.png" alt="SamleyEduSuite" className="w-9 h-9 rounded-xl object-contain" />
              )}
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {school?.name || 'SamleyEduSuite Ghana'}
                </h1>
                {schoolSettings ? (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {schoolSettings.active_academic_year} • {schoolSettings.active_term}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ghana Private School Management
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right section: Supabase Status, Theme, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Supabase Status Indicator (read-only for school admins; clickable for super-admin) */}
            <div
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors ${
                isConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}
              title={isConnected ? 'System is live' : 'Database not configured'}
            >
              {isConnected ? (
                <Radio className="w-3.5 h-3.5" />
              ) : (
                <Database className="w-3.5 h-3.5" />
              )}
              <span className="flex items-center gap-1.5">
                {isConnected && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
                {isConnected ? 'Live' : 'Supabase Setup'}
              </span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Realtime Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Popover */}
              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-3 z-50 animate-scaleUp"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Notifications
                      </h4>
                      {unreadCount > 0 && (
                        <Badge variant="primary" size="sm">
                          {unreadCount} new
                        </Badge>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs transition-colors flex items-start justify-between gap-2 ${
                            !n.is_read
                              ? 'bg-orange-50/40 dark:bg-orange-950/20'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => {
                              if (!n.is_read) markAsRead(n.id);
                            }}
                          >
                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                              {n.title}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <button
                            onClick={() => deleteNotification(n.id)}
                            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-md"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Role Info */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                  {profile?.full_name || 'Administrator'}
                </p>
                <div className="flex justify-end mt-0.5">
                  <Badge variant={currentRole.variant} size="sm">
                    {currentRole.title}
                  </Badge>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">
                {profile?.full_name
                  ? profile.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'EA'}
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Logout securely"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Supabase Architecture & Connection Modal */}
      <SupabaseSetupModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
      />
    </>
  );
};
