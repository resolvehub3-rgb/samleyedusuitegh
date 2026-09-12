import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  School,
  UserCheck,
  Users,
  GraduationCap,
  CreditCard,
  Megaphone,
  Bell,
  Activity,
  HardDrive,
  Settings,
  User,
  Search,
  X,
  Menu,
  LogOut,
  Sun,
  Moon,
  CheckCheck,
  Trash2,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { useTheme } from '../../context/ThemeContext';
import { Badge } from '../common/Badge';

type SuperAdminView =
  | 'dashboard'
  | 'schools'
  | 'users'
  | 'teachers'
  | 'parents'
  | 'students'
  | 'payments'
  | 'announcements'
  | 'notifications'
  | 'activity'
  | 'storage'
  | 'subscriptions'
  | 'settings'
  | 'profile'
  | 'search'
  | 'contact-messages';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
  currentView: SuperAdminView;
  onNavigate: (view: SuperAdminView) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'schools', label: 'Schools', icon: School },
  { id: 'users', label: 'School Admins', icon: UserCheck },
  { id: 'teachers', label: 'Teachers', icon: Users },
  { id: 'parents', label: 'Parents', icon: Users },
  { id: 'students', label: 'Students', icon: GraduationCap },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'contact-messages', label: 'Contact Messages', icon: MessageSquare },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'activity', label: 'Activity Log', icon: Activity },
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'profile', label: 'Profile', icon: User },
];

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({
  children,
  currentView,
  onNavigate,
}) => {
  const { user, logout, platformNotifications, platformUnreadCount, markNotificationRead, markAllNotificationsRead, globalSearch, unreadContactMessages } = useSuperAdmin();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.length < 2) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      const results = await globalSearch(q);
      setSearchResults(results);
      setSearching(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center shadow-sm">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                  SamleyEduSuite
                </h2>
                <p className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                  Super Admin Panel
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isNotifItem = item.id === 'notifications';
              const isContactItem = item.id === 'contact-messages';
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id as SuperAdminView);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-xs dark:bg-orange-600'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span className="truncate flex-1 text-left">{item.label}</span>
                  {isNotifItem && platformUnreadCount > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300'
                    }`}>
                      {platformUnreadCount > 99 ? '99+' : platformUnreadCount}
                    </span>
                  )}
                  {isContactItem && unreadContactMessages > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300'
                    }`}>
                      {unreadContactMessages > 99 ? '99+' : unreadContactMessages}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-xl">
              <p className="text-[11px] font-bold text-orange-700 dark:text-orange-300">Platform Owner</p>
              <p className="text-[10px] text-orange-600/70 dark:text-orange-400/60 mt-0.5 truncate">
                {user?.email || 'admin@samleyedusuite.com'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between h-full px-4 sm:px-6">
            {/* Left: Mobile Menu + Search */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search Bar */}
              <div className="hidden sm:flex items-center relative">
                <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                  placeholder="Search schools, teachers, students..."
                  className="pl-9 pr-4 py-2 w-64 lg:w-80 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setSearchResults(null); setShowSearch(false); }}
                    className="absolute right-2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Search */}
              <button
                onClick={() => setShowSearch(true)}
                className="sm:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Notifications Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {platformUnreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                      {platformUnreadCount > 9 ? '9+' : platformUnreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-3 z-50 animate-scaleUp">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h4>
                        {platformUnreadCount > 0 && (
                          <Badge variant="primary" size="sm">{platformUnreadCount} new</Badge>
                        )}
                      </div>
                      {platformUnreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Mark all
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {platformNotifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        platformNotifications.slice(0, 8).map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 text-xs transition-colors ${!n.is_read ? 'bg-orange-50/40 dark:bg-orange-950/20' : ''}`}
                          >
                            <div
                              className="cursor-pointer"
                              onClick={() => { if (!n.is_read) markNotificationRead(n.id); }}
                            >
                              <p className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                              <p className="text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => { onNavigate('notifications'); setShowNotifications(false); }}
                        className="w-full text-center text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 cursor-pointer py-1"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                    {user?.email?.split('@')[0] || 'Super Admin'}
                  </p>
                  <Badge variant="primary" size="sm">Super Admin</Badge>
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 flex items-center justify-center text-xs font-bold text-orange-700 dark:text-orange-300">
                  SA
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Search Modal */}
        {showSearch && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4 sm:hidden" onClick={() => setShowSearch(false)}>
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-4" onClick={(e) => e.stopPropagation()}>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search schools, teachers, students..."
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl outline-none"
                />
                <button
                  onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults(null); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Search Results */}
              {searchResults && <SearchResults results={searchResults} onSelect={() => { setShowSearch(false); setSearchQuery(''); setSearchResults(null); }} />}
            </div>
          </div>
        )}

        {/* Desktop Search Dropdown */}
        {showSearch && searchResults && (
          <div className="hidden sm:block fixed top-16 left-1/2 -translate-x-1/2 z-50 w-80 lg:w-96">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 max-h-80 overflow-y-auto">
              <SearchResults results={searchResults} onSelect={() => { setShowSearch(false); setSearchQuery(''); setSearchResults(null); }} />
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

// Search Results Component
const SearchResults: React.FC<{ results: any; onSelect: () => void }> = ({ results, onSelect }) => {
  const hasResults = results.schools?.length || results.teachers?.length || results.parents?.length || results.students?.length || results.payments?.length;

  if (!hasResults) {
    return <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">No results found.</p>;
  }

  const sections = [
    { title: 'Schools', items: results.schools || [], icon: School, color: 'text-orange-600' },
    { title: 'Teachers', items: results.teachers || [], icon: Users, color: 'text-blue-600' },
    { title: 'Parents', items: results.parents || [], icon: Users, color: 'text-emerald-600' },
    { title: 'Students', items: results.students || [], icon: GraduationCap, color: 'text-purple-600' },
    { title: 'Payments', items: results.payments || [], icon: CreditCard, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-3">
      {sections.map((section) =>
        section.items.length > 0 ? (
          <div key={section.title}>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{section.title}</p>
            {section.items.slice(0, 3).map((item: any) => (
              <div
                key={item.id}
                onClick={onSelect}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs"
              >
                <section.icon className={`w-3.5 h-3.5 ${section.color}`} />
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {item.name || item.full_name || item.invoice_number || 'Unknown'}
                </span>
                {item.school?.name && (
                  <span className="text-slate-400 ml-auto truncate">{item.school.name}</span>
                )}
              </div>
            ))}
          </div>
        ) : null
      )}
    </div>
  );
};
