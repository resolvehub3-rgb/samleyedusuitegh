import React, { useEffect } from 'react';
import {
  School,
  Users,
  GraduationCap,
  UserCheck,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  Activity,
  Banknote,
  CheckCircle2,
  XCircle,
  UserPlus,
  MessageSquare,
  Mail,
  Phone,
  Trash2,
  CheckCheck,
  MailOpen,
} from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { SkeletonCard } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';

interface SuperAdminDashboardProps {
  onNavigate: (view: string) => void;
}export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onNavigate }) => {
  const { stats, recentActivity, loading, contactMessages, markContactMessageRead, markAllContactMessagesRead, deleteContactMessage, unreadContactMessages } = useSuperAdmin();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }

  const activityIcon = (action: string) => {
    if (action.includes('school')) return School;
    if (action.includes('payment')) return CreditCard;
    if (action.includes('login')) return UserCheck;
    if (action.includes('setting')) return Activity;
    return Activity;
  };

  const activityColor = (action: string) => {
    if (action.includes('suspend') || action.includes('deactivate')) return 'text-rose-600 bg-rose-50 dark:bg-rose-950/40';
    if (action.includes('activate') || action.includes('reactivate')) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40';
    if (action.includes('register')) return 'text-orange-600 bg-orange-50 dark:bg-orange-950/40';
    if (action.includes('login')) return 'text-blue-600 bg-blue-50 dark:bg-blue-950/40';
    return 'text-slate-600 bg-slate-50 dark:bg-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl text-white shadow-lg shadow-orange-500/10">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-orange-200">Platform Overview</span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">Super Admin Dashboard</h2>
          <p className="text-xs text-orange-100 mt-0.5">Real-time SamleyEduSuite platform monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('schools')}
            className="px-4 py-2 text-xs font-bold bg-white text-orange-700 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <School className="w-4 h-4" /> View Schools
          </button>
          <button
            onClick={() => onNavigate('announcements')}
            className="px-4 py-2 text-xs font-bold bg-orange-700/80 hover:bg-orange-800 text-white rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" /> Post Announcement
          </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Schools"
          value={stats.totalSchools}
          icon={School}
          subtitle={stats.totalSchools === 0 ? 'No schools registered yet' : `${stats.activeSchools} active, ${stats.suspendedSchools} suspended`}
          badge={`${stats.recentRegistrations} new (30d)`}
          badgeVariant={stats.recentRegistrations > 0 ? 'success' : 'neutral'}
          colorClass="text-orange-600 bg-orange-50 dark:bg-orange-950/40"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={GraduationCap}
          subtitle={stats.totalStudents === 0 ? 'No students enrolled yet' : 'Across all schools'}
          colorClass="text-purple-600 bg-purple-50 dark:bg-purple-950/40"
        />
        <StatCard
          title="Total Teachers"
          value={stats.totalTeachers}
          icon={UserCheck}
          subtitle={stats.totalTeachers === 0 ? 'No teachers yet' : 'Platform-wide faculty'}
          colorClass="text-blue-600 bg-blue-50 dark:bg-blue-950/40"
        />
        <StatCard
          title="Total Parents"
          value={stats.totalParents}
          icon={Users}
          subtitle={stats.totalParents === 0 ? 'No parents yet' : 'Registered parent accounts'}
          colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="School Admins"
          value={stats.totalSchoolAdmins}
          icon={UserCheck}
          subtitle="School owner accounts"
          colorClass="text-amber-600 bg-amber-50 dark:bg-amber-950/40"
        />
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="p-2.5 rounded-xl text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              GHS {stats.totalPaymentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {stats.totalPayments} total transactions
          </p>
        </div>
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          icon={Clock}
          subtitle={stats.pendingPayments === 0 ? 'All payments processed' : 'Awaiting verification'}
          colorClass="text-amber-600 bg-amber-50 dark:bg-amber-950/40"
        />
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">School Status</span>
            <div className="p-2.5 rounded-xl text-sky-600 bg-sky-50 dark:bg-sky-950/40">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.activeSchools} Active</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.suspendedSchools} Suspended</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.pendingSchools} Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Platform Activity */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Platform Activity</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Latest audit log events</p>
          </div>
          <button
            onClick={() => onNavigate('activity')}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1 cursor-pointer"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentActivity.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Platform activity will appear here as schools register and events occur."
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentActivity.slice(0, 8).map((log) => {
              const Icon = activityIcon(log.action);
              return (
                <div key={log.id} className="py-3 flex items-center gap-3 text-xs">
                  <div className={`p-2 rounded-lg shrink-0 ${activityColor(log.action)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {log.description || log.action}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      {log.actor_email || 'System'} • {log.school_name || 'Platform'}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            }            )}
          </div>
        )}
      </div>

      {/* Contact Messages */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Contact Form Messages</h3>
              {unreadContactMessages > 0 && (
                <Badge variant="primary" size="sm">{unreadContactMessages} new</Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Messages submitted from the landing page</p>
          </div>
          {contactMessages.length > 0 && (
            <button
              onClick={markAllContactMessagesRead}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
        </div>

        {contactMessages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No messages yet"
            description="Contact form submissions from visitors will appear here in real-time."
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {contactMessages.slice(0, 10).map((msg) => (
              <div
                key={msg.id}
                className={`py-3 flex items-start gap-3 text-xs transition-colors ${
                  !msg.is_read ? 'bg-orange-50/40 dark:bg-orange-950/20 -mx-5 px-5' : ''
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${
                  msg.is_read
                    ? 'text-slate-500 bg-slate-50 dark:bg-slate-800'
                    : 'text-orange-600 bg-orange-50 dark:bg-orange-950/40'
                }`}>
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {msg.full_name}
                    </p>
                    {!msg.is_read && (
                      <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                    {msg.school_name}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {msg.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Mail className="w-3 h-3" /> {msg.email}
                    </span>
                    {msg.phone && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Phone className="w-3 h-3" /> {msg.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(msg.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-1">
                    {!msg.is_read && (
                      <button
                        onClick={() => markContactMessageRead(msg.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors cursor-pointer"
                        title="Mark as read"
                      >
                        <MailOpen className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteContactMessage(msg.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
