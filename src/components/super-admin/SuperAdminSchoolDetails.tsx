import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft,
  School,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  GraduationCap,
  UserCheck,
  CreditCard,
  Layers,
  BookOpen,
  Activity,
  Megaphone,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Edit3,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { Badge } from '../common/Badge';
import { StatCard } from '../common/StatCard';
import { SkeletonCard, SkeletonRow } from '../common/SkeletonLoader';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface SuperAdminSchoolDetailsProps {
  schoolId: string;
  onNavigate: (view: string) => void;
}

export const SuperAdminSchoolDetails: React.FC<SuperAdminSchoolDetailsProps> = ({ schoolId, onNavigate }) => {
  const { updateSchoolStatus } = useSuperAdmin();
  const [school, setSchool] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [stats, setStats] = useState({
    students: 0, teachers: 0, parents: 0, admins: 0, classes: 0,
    payments: 0, attendance: 0, announcements: 0, totalPaymentAmount: 0,
  });
  const [owner, setOwner] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showManageMenu, setShowManageMenu] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const manageMenuRef = useRef<HTMLDivElement>(null);
  const supabase = getSupabase();

  // Compute display status based on school status and subscription
  const computeDisplayStatus = (schoolStatus: string | null, sub: any): string => {
    if (schoolStatus === 'suspended') return 'suspended';
    if (schoolStatus === 'deactivated') return 'deactivated';
    if (schoolStatus === 'pending') return 'pending';
    if (!sub) return schoolStatus || 'active';
    const subStatus = sub.status;
    if (subStatus === 'SUSPENDED' || subStatus === 'EXPIRED' || subStatus === 'REJECTED') return 'deactivated';
    if (subStatus === 'TRIAL' && sub.trial_expires_at && new Date(sub.trial_expires_at).getTime() < Date.now()) return 'deactivated';
    if (subStatus === 'ACTIVE' && sub.subscription_expires_at && new Date(sub.subscription_expires_at).getTime() < Date.now()) return 'deactivated';
    return schoolStatus || 'active';
  };

  const displayStatus = computeDisplayStatus(school?.status, subscription);

  useEffect(() => {
    async function fetchDetails() {
      try {
        setLoading(true);
        const [
          schoolRes, studentsRes, teachersRes, parentsRes, adminsRes,
          classesRes, paymentsRes, attendanceRes, announcementsRes, ownerRes, activityRes, subRes,
        ] = await Promise.all([
          supabase.from('schools').select('*').eq('id', schoolId).maybeSingle(),
          supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'teacher'),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'parent'),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'admin'),
          supabase.from('classes').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
          supabase.from('payments').select('amount, status').eq('school_id', schoolId),
          supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
          supabase.from('announcements').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
          supabase.from('profiles').select('*').eq('school_id', schoolId).eq('role', 'admin').maybeSingle(),
          supabase.from('audit_logs').select('*').eq('school_id', schoolId).order('created_at', { ascending: false }).limit(10),
          supabase.from('school_subscriptions').select('*').eq('school_id', schoolId).maybeSingle(),
        ]);

        setSchool(schoolRes.data);
        setSubscription(subRes.data);
        setOwner(ownerRes.data);
        setRecentActivity(activityRes.data || []);

        const paymentData = paymentsRes.data || [];
        setStats({
          students: studentsRes.count || 0,
          teachers: teachersRes.count || 0,
          parents: parentsRes.count || 0,
          admins: adminsRes.count || 0,
          classes: classesRes.count || 0,
          payments: paymentData.length,
          attendance: attendanceRes.count || 0,
          announcements: announcementsRes.count || 0,
          totalPaymentAmount: paymentData.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0),
        });
      } catch (err) {
        console.error('Error fetching school details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [schoolId, supabase]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (manageMenuRef.current && !manageMenuRef.current.contains(e.target as Node)) {
        setShowManageMenu(false);
      }
    }
    if (showManageMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showManageMenu]);

  const handleStatusChange = async () => {
    if (!confirmAction || !school) return;
    setActionLoading(true);
    await updateSchoolStatus(school.id, confirmAction);
    setActionLoading(false);
    setConfirmAction(null);
    setShowManageMenu(false);
    const { data } = await supabase.from('schools').select('*').eq('id', schoolId).maybeSingle();
    if (data) setSchool(data);
  };

  const handleDeleteSchool = async () => {
    if (!school) return;
    setDeleteLoading(true);
    try {
      const { error } = await supabase.from('schools').delete().eq('id', school.id);
      if (!error) {
        onNavigate('schools');
      } else {
        console.error('Error deleting school:', error);
        setDeleteLoading(false);
        setDeleteConfirm(false);
      }
    } catch (err) {
      console.error('Error deleting school:', err);
      setDeleteLoading(false);
      setDeleteConfirm(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="success" size="sm">Active</Badge>;
      case 'suspended': return <Badge variant="danger" size="sm">Suspended</Badge>;
      case 'pending': return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'deactivated': return <Badge variant="neutral" size="sm">Deactivated</Badge>;
      default: return <Badge variant="neutral" size="sm">{status || 'Unknown'}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="text-center py-12">
        <School className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500">School not found.</p>
        <button onClick={() => onNavigate('schools')} className="mt-3 text-xs text-orange-600 hover:text-orange-700 font-semibold cursor-pointer">
          ← Back to Schools
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('schools')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Schools
      </button>

      {/* School Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {school.logo_url ? (
            <img src={school.logo_url} alt={school.name} className="w-16 h-16 rounded-2xl object-contain border border-slate-200 dark:border-slate-700 bg-white" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
              <School className="w-8 h-8 text-orange-500" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{school.name}</h2>
                {school.motto && <p className="text-xs text-slate-500 italic mt-0.5">"{school.motto}"</p>}
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(displayStatus)}
                <div className="relative" ref={manageMenuRef}>
                  <button
                    onClick={() => setShowManageMenu(!showManageMenu)}
                    className="px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1"
                  >
                    <MoreVertical className="w-3.5 h-3.5" /> Manage
                  </button>
                  {showManageMenu && (
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-20">
                      {displayStatus !== 'active' && (
                        <button onClick={() => { setConfirmAction('active'); setShowManageMenu(false); }} className="w-full text-left px-3 py-2 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer">
                          Activate School
                        </button>
                      )}
                      {displayStatus === 'active' && (
                        <button onClick={() => { setConfirmAction('suspended'); setShowManageMenu(false); }} className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer">
                          Suspend School
                        </button>
                      )}
                      {displayStatus !== 'deactivated' && (
                        <button onClick={() => { setConfirmAction('deactivated'); setShowManageMenu(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                          Deactivate School
                        </button>
                      )}
                      <hr className="my-1 border-slate-100 dark:border-slate-800" />
                      <button onClick={() => { setDeleteConfirm(true); setShowManageMenu(false); }} className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer flex items-center gap-2">
                        <Trash2 className="w-3.5 h-3.5" /> Delete School
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
              {school.region && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{school.district}, {school.region}</span>}
              {school.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{school.phone}</span>}
              {school.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{school.email}</span>}
              {school.website && <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{school.website}</span>}
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Registered {new Date(school.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Students" value={stats.students} icon={GraduationCap} colorClass="text-purple-600 bg-purple-50 dark:bg-purple-950/40" />
        <StatCard title="Teachers" value={stats.teachers} icon={UserCheck} colorClass="text-blue-600 bg-blue-50 dark:bg-blue-950/40" />
        <StatCard title="Parents" value={stats.parents} icon={Users} colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" />
        <StatCard title="Classes" value={stats.classes} icon={Layers} colorClass="text-orange-600 bg-orange-50 dark:bg-orange-950/40" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Payments" value={stats.payments} icon={CreditCard} subtitle={`GHS ${stats.totalPaymentAmount.toLocaleString()}`} colorClass="text-amber-600 bg-amber-50 dark:bg-amber-950/40" />
        <StatCard title="Attendance Records" value={stats.attendance} icon={BookOpen} colorClass="text-sky-600 bg-sky-50 dark:bg-sky-950/40" />
        <StatCard title="Announcements" value={stats.announcements} icon={Megaphone} colorClass="text-rose-600 bg-rose-50 dark:bg-rose-950/40" />
        <StatCard title="School Admins" value={stats.admins} icon={UserCheck} colorClass="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40" />
      </div>

      {/* Subscription Info */}
      {subscription && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Subscription Status</h3>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Status:</span>
              <Badge variant={
                subscription.status === 'ACTIVE' ? 'success' :
                subscription.status === 'TRIAL' ? 'primary' :
                subscription.status === 'SUSPENDED' || subscription.status === 'EXPIRED' ? 'danger' :
                subscription.status === 'PENDING_VERIFICATION' ? 'warning' : 'neutral'
              } size="sm">
                {subscription.status}
              </Badge>
            </div>
            {subscription.status === 'TRIAL' && subscription.trial_expires_at && (
              <div className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                Trial {new Date(subscription.trial_expires_at).getTime() < Date.now() ? 'expired' : 'expires'} {new Date(subscription.trial_expires_at).toLocaleDateString()}
              </div>
            )}
            {subscription.status === 'ACTIVE' && subscription.subscription_expires_at && (
              <div className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                Renews {new Date(subscription.subscription_expires_at).toLocaleDateString()}
              </div>
            )}
            {subscription.amount && (
              <div className="text-slate-500">
                Plan: GHS {subscription.amount}/{subscription.currency === 'GHS' ? 'mo' : subscription.currency}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Two Column: Owner Info + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* School Owner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">School Owner / Admin</h3>
          {owner ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-sm font-bold text-orange-700 dark:text-orange-300">
                  {owner.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'SA'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{owner.full_name}</p>
                  <p className="text-[11px] text-slate-500">{owner.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                {owner.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{owner.phone}</span>}
                <Badge variant={owner.is_active ? 'success' : 'danger'} size="sm">
                  {owner.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No admin profile found for this school.</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No activity recorded for this school yet.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recentActivity.map((log: any) => (
                <div key={log.id} className="flex items-start gap-2 text-xs py-2 border-b border-slate-50 dark:border-slate-800/60 last:border-0">
                  <Activity className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-slate-700 dark:text-slate-300">{log.description || log.action}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(log.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleStatusChange}
        title={`${confirmAction === 'active' ? 'Activate' : confirmAction === 'suspended' ? 'Suspend' : 'Deactivate'} School`}
        message={`Are you sure you want to ${confirmAction} "${school.name}"? This will be recorded in the audit log.`}
        confirmLabel={confirmAction === 'active' ? 'Activate' : confirmAction === 'suspended' ? 'Suspend' : 'Deactivate'}
        variant={confirmAction === 'active' ? 'primary' : 'danger'}
        loading={actionLoading}
      />

      {/* Delete School Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDeleteSchool}
        title="Delete School"
        message={`Are you sure you want to permanently delete "${school?.name}"? This action cannot be undone and will remove all associated data.`}
        confirmLabel="Delete School"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};
