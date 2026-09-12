import React, { useEffect, useState, useCallback } from 'react';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  Layers, 
  CalendarCheck, 
  CreditCard, 
  Megaphone, 
  MessageSquareQuote,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { SkeletonCard, SkeletonRow } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';
import { SchoolSubscriptionDashboard } from '../subscription/SchoolSubscriptionDashboard';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { school, schoolSettings } = useAuth();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    students: 0,
    teachers: 0,
    parents: 0,
    classes: 0,
    todayAttendance: 0,
    totalVerifiedFees: 0,
    pendingFeedback: 0,
    activeAnnouncements: 0
  });

  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<any[]>([]);

  const supabase = getSupabase();

  const fetchDashboardData = useCallback(async () => {
    if (!school) return;
    try {
      setLoading(true);

      // Fetch Real counts (NO dummy numbers!)
      const [
        studentsRes,
        teachersRes,
        parentsRes,
        classesRes,
        todayAttRes,
        paymentsRes,
        feedbackRes,
        announcementsRes
      ] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', school.id),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_id', school.id).eq('role', 'teacher'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_id', school.id).eq('role', 'parent'),
        supabase.from('classes').select('id', { count: 'exact', head: true }).eq('school_id', school.id),
        supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('school_id', school.id).eq('date', new Date().toISOString().split('T')[0]),
        supabase.from('payments').select('*').eq('school_id', school.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('parent_feedback').select('*, parent:profiles!parent_id(full_name)').eq('school_id', school.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('announcements').select('*').eq('school_id', school.id).order('created_at', { ascending: false }).limit(4)
      ]);

      const verifiedFeesTotal = (paymentsRes.data || [])
        .filter((p: any) => p.status === 'verified' || p.status === 'paid')
        .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

      const pendingFeedbackCount = (feedbackRes.data || []).filter((f: any) => f.status === 'open').length;

      setCounts({
        students: studentsRes.count || 0,
        teachers: teachersRes.count || 0,
        parents: parentsRes.count || 0,
        classes: classesRes.count || 0,
        todayAttendance: todayAttRes.count || 0,
        totalVerifiedFees: verifiedFeesTotal,
        pendingFeedback: pendingFeedbackCount,
        activeAnnouncements: announcementsRes.data?.length || 0
      });

      setRecentPayments(paymentsRes.data || []);
      setRecentFeedback(feedbackRes.data || []);
      setRecentAnnouncements(announcementsRes.data || []);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [school, supabase]);

  useEffect(() => {
    fetchDashboardData();

    if (!school) return;

    // Realtime subscriptions for dashboard metrics
    const channel = supabase
      .channel(`admin_dashboard_${school.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance', filter: `school_id=eq.${school.id}` }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments', filter: `school_id=eq.${school.id}` }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parent_feedback', filter: `school_id=eq.${school.id}` }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements', filter: `school_id=eq.${school.id}` }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [school, supabase, fetchDashboardData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Dashboard */}
      <SchoolSubscriptionDashboard />

      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl text-white shadow-lg shadow-orange-500/10">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-orange-200">
            {school?.region} Region • {school?.district}
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
            {school?.name || 'Ghanaian Private School'}
          </h2>
          {school?.motto && (
            <p className="text-xs text-orange-100 italic mt-0.5">&ldquo;{school.motto}&rdquo;</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('students')}
            className="px-4 py-2 text-xs font-bold bg-white text-orange-700 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Add Student
          </button>
          <button
            onClick={() => onNavigate('teachers')}
            className="px-4 py-2 text-xs font-bold bg-orange-700/80 hover:bg-orange-800 text-white rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" /> Invite Teacher
          </button>
        </div>
      </div>

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-students"
          title="Total Students"
          value={counts.students}
          icon={GraduationCap}
          subtitle={counts.students === 0 ? 'No students enrolled yet' : 'Enrolled in classes'}
          colorClass="text-orange-600 bg-orange-50 dark:bg-orange-950/40"
        />
        <StatCard
          id="stat-teachers"
          title="Staff Teachers"
          value={counts.teachers}
          icon={UserCheck}
          subtitle={counts.teachers === 0 ? 'No teachers added yet' : 'Active faculty members'}
          colorClass="text-blue-600 bg-blue-50 dark:bg-blue-950/40"
        />
        <StatCard
          id="stat-classes"
          title="Ghanaian Classes"
          value={counts.classes}
          icon={Layers}
          subtitle="KG 1 through JHS 3"
          colorClass="text-purple-600 bg-purple-50 dark:bg-purple-950/40"
        />
        <StatCard
          id="stat-attendance"
          title="Today's Attendance"
          value={counts.todayAttendance}
          icon={CalendarCheck}
          subtitle={counts.todayAttendance === 0 ? 'No attendance recorded today' : 'Recorded entries'}
          colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
        />
      </div>

      {/* Financial & Feedback Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Fees Collected</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              GHS {counts.totalVerifiedFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Verified parent payments</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Parent Feedback</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {counts.pendingFeedback}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Awaiting school review</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <MessageSquareQuote className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Announcements</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {counts.activeAnnouncements}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Broadcasted to parents & teachers</p>
          </div>
          <div className="p-3 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-xl">
            <Megaphone className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Fee Payments & Parent Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Fee Payments</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ghanaian Mobile Money and Bank transactions</p>
            </div>
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1 cursor-pointer"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentPayments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No payments recorded yet"
              description="When parents submit fee payments via Mobile Money or Bank transfer, they will appear here in real-time."
              actionLabel="Record Payment"
              onAction={() => onNavigate('payments')}
            />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{payment.purpose}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Ref: {payment.invoice_number} • {payment.payment_method}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">
                      GHS {Number(payment.amount).toFixed(2)}
                    </p>
                    <Badge
                      variant={
                        payment.status === 'verified'
                          ? 'success'
                          : payment.status === 'pending'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Parent Feedback Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Parent Reports & Feedback</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Incoming inquiries from registered parents</p>
            </div>
            <button
              onClick={() => onNavigate('feedback')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1 cursor-pointer"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentFeedback.length === 0 ? (
            <EmptyState
              icon={MessageSquareQuote}
              title="No parent feedback yet"
              description="Parents can submit academic inquiries or general school concerns from their parent portal."
            />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentFeedback.map((fb) => (
                <div key={fb.id} className="py-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {fb.parent?.full_name || 'Parent'}
                    </span>
                    <Badge variant={fb.status === 'open' ? 'warning' : 'success'} size="sm">
                      {fb.status}
                    </Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                    {fb.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Category: {fb.category.replace('_', ' ')} • {new Date(fb.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
