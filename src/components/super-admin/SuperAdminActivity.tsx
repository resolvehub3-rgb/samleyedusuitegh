import React, { useEffect, useState } from 'react';
import { Activity, Search, Filter, School, CreditCard, UserCheck, Settings, LogIn, Calendar } from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { SkeletonTable } from '../common/SkeletonLoader';

export const SuperAdminActivity: React.FC = () => {
  const { auditLogs, fetchAuditLogs, loading } = useSuperAdmin();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => { fetchAuditLogs(); }, [fetchAuditLogs]);

  const filtered = auditLogs.filter((log) => {
    const matchSearch = !search ||
      log.description?.toLowerCase().includes(search.toLowerCase()) ||
      log.actor_email?.toLowerCase().includes(search.toLowerCase()) ||
      log.school_name?.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'all' || log.action?.includes(actionFilter);
    return matchSearch && matchAction;
  });

  const actionIcon = (action: string) => {
    if (action.includes('school')) return School;
    if (action.includes('payment')) return CreditCard;
    if (action.includes('login')) return LogIn;
    if (action.includes('setting')) return Settings;
    if (action.includes('announcement')) return Activity;
    return UserCheck;
  };

  const actionColor = (action: string) => {
    if (action.includes('suspend') || action.includes('deactivate') || action.includes('delete')) return 'text-rose-600 bg-rose-50 dark:bg-rose-950/40';
    if (action.includes('activate') || action.includes('reactivate')) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40';
    if (action.includes('register')) return 'text-orange-600 bg-orange-50 dark:bg-orange-950/40';
    if (action.includes('login')) return 'text-blue-600 bg-blue-50 dark:bg-blue-950/40';
    return 'text-slate-600 bg-slate-50 dark:bg-slate-800';
  };

  if (loading && auditLogs.length === 0) return <SkeletonTable rows={10} />;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Activity / Audit Log</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{filtered.length} events recorded</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by description, actor, school..." className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none placeholder:text-slate-400" />
        </div>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer">
          <option value="all">All Actions</option>
          <option value="school">School Events</option>
          <option value="payment">Payment Events</option>
          <option value="login">Login Events</option>
          <option value="setting">Settings Changes</option>
          <option value="announcement">Announcements</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Activity} title="No activity recorded" description={search ? 'Try adjusting your search.' : 'Platform activity will appear here as events occur.'} />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((log) => {
              const Icon = actionIcon(log.action);
              return (
                <div key={log.id} className="px-4 py-3 flex items-start gap-3 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${actionColor(log.action)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{log.description || log.action}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      {log.actor_email && <span>{log.actor_email}</span>}
                      {log.school_name && <span className="flex items-center gap-0.5"><School className="w-3 h-3" />{log.school_name}</span>}
                      <span className="capitalize">{log.entity || ''}</span>
                      <span>{new Date(log.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <Badge variant="neutral" size="sm">{log.action?.replace(/_/g, ' ')}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
