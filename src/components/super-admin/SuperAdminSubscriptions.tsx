import React, { useEffect, useState, useCallback } from 'react';
import {
  CreditCard, Search, Filter, CheckCircle2, XCircle, Clock, Eye, Shield,
  AlertTriangle, ChevronLeft, ChevronRight, Download, Copy, Check
} from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { SchoolSubscription, SubscriptionPayment, formatDaysRemaining, getDaysRemaining } from '../../types/subscription';
import { getSupabase } from '../../lib/supabase';
import { Badge } from '../common/Badge';
import { SkeletonTable } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';
import { Modal } from '../common/Modal';

export const SuperAdminSubscriptions: React.FC = () => {
  const {
    allSubscriptions, allPayments, fetchAllSubscriptions, fetchAllPayments,
    approvePayment, rejectPayment, subscriptionStats, fetchSubscriptionStats
  } = useSubscription();
  const { logAuditEvent } = useSuperAdmin();
  const supabase = getSupabase();

  const [activeTab, setActiveTab] = useState<'subscriptions' | 'payments'>('subscriptions');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<SubscriptionPayment | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await Promise.all([fetchAllSubscriptions(), fetchAllPayments(), fetchSubscriptionStats()]);
      setLoading(false);
    }
    load();
  }, [fetchAllSubscriptions, fetchAllPayments, fetchSubscriptionStats]);

  // Realtime subscription for new payments
  useEffect(() => {
    const channel = supabase
      .channel('super_admin_subscriptions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscription_payments' }, () => {
        fetchAllPayments();
        fetchSubscriptionStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'school_subscriptions' }, () => {
        fetchAllSubscriptions();
        fetchSubscriptionStats();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, fetchAllPayments, fetchAllSubscriptions, fetchSubscriptionStats]);

  const handleApprove = async (paymentId: string) => {
    setProcessing(true);
    setActionError(null);
    const result = await approvePayment(paymentId);
    setProcessing(false);
    if (result.success) {
      setActionSuccess('Payment approved successfully');
      setSelectedPayment(null);
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      setActionError(result.error || 'Approval failed');
      setTimeout(() => setActionError(null), 5000);
    }
  };

  const handleReject = async () => {
    if (!selectedPayment || !rejectReason.trim()) return;
    setProcessing(true);
    setActionError(null);
    const result = await rejectPayment(selectedPayment.id, rejectReason.trim());
    setProcessing(false);
    if (result.success) {
      setActionSuccess('Payment rejected');
      setShowRejectModal(false);
      setSelectedPayment(null);
      setRejectReason('');
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      setActionError(result.error || 'Rejection failed');
      setTimeout(() => setActionError(null), 5000);
    }
  };

  const getSchoolName = (schoolId: string): string => {
    const sub = allSubscriptions.find(s => s.school_id === schoolId);
    return sub ? `School ${schoolId.slice(0, 8)}` : 'Unknown';
  };

  // Fetch school name by ID
  const [schoolNames, setSchoolNames] = useState<Record<string, string>>({});
  const fetchSchoolNames = useCallback(async () => {
    const { data } = await supabase.from('schools').select('id, name');
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((s: any) => { map[s.id] = s.name; });
      setSchoolNames(map);
    }
  }, [supabase]);

  useEffect(() => { fetchSchoolNames(); }, [fetchSchoolNames]);

  const filteredSubscriptions = allSubscriptions.filter(s => {
    const name = schoolNames[s.school_id] || '';
    const matchesSearch = !searchQuery || name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = allPayments.filter(p => {
    const name = schoolNames[p.school_id] || '';
    const txn = p.transaction_id || '';
    const matchesSearch = !searchQuery || name.toLowerCase().includes(searchQuery.toLowerCase()) || txn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = paymentStatusFilter === 'all' || p.status === paymentStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      TRIAL: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
      ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
      PENDING_VERIFICATION: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
      EXPIRED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      SUSPENDED: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
      REJECTED: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
      APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Subscription Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage school subscriptions, payments, and verification</p>
        </div>
        {actionSuccess && (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> {actionSuccess}
          </span>
        )}
        {actionError && (
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <XCircle className="w-4 h-4" /> {actionError}
          </span>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl">
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">Trial</p>
          <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{subscriptionStats.trial}</p>
        </div>
        <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Active</p>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{subscriptionStats.active}</p>
        </div>
        <div className="p-3.5 bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 rounded-xl">
          <p className="text-[10px] text-sky-600 dark:text-sky-400 font-bold uppercase">Pending</p>
          <p className="text-lg font-bold text-sky-700 dark:text-sky-300">{subscriptionStats.paymentsPending}</p>
        </div>
        <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl">
          <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase">Suspended</p>
          <p className="text-lg font-bold text-rose-700 dark:text-rose-300">{subscriptionStats.suspended}</p>
        </div>
        <div className="p-3.5 bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Total Schools</p>
          <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{subscriptionStats.totalSchools}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-0">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'subscriptions'
              ? 'border-orange-600 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Subscriptions ({allSubscriptions.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'payments'
              ? 'border-orange-600 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Payments ({allPayments.length})
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by school name or transaction ID..."
            className="w-full text-xs bg-transparent border-none focus:outline-hidden text-slate-800 dark:text-slate-200"
          />
        </div>
        <select
          value={activeTab === 'subscriptions' ? statusFilter : paymentStatusFilter}
          onChange={(e) => activeTab === 'subscriptions' ? setStatusFilter(e.target.value) : setPaymentStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
        >
          <option value="all">All Status</option>
          {activeTab === 'subscriptions' ? (
            <>
              <option value="TRIAL">Trial</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </>
          ) : (
            <>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </>
          )}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonTable rows={5} />
      ) : activeTab === 'subscriptions' ? (
        filteredSubscriptions.length === 0 ? (
          <EmptyState icon={Shield} title="No subscriptions found" description="No subscriptions match your filters." />
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">School</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Trial/Start</th>
                    <th className="py-3 px-4">Expiry</th>
                    <th className="py-3 px-4">Days Left</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSubscriptions.map((sub) => {
                    const expiryDate = sub.status === 'TRIAL' ? sub.trial_expires_at : sub.subscription_expires_at;
                    const days = getDaysRemaining(expiryDate);
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {schoolNames[sub.school_id] || sub.school_id.slice(0, 8)}
                        </td>
                        <td className="py-3 px-4">{statusBadge(sub.status)}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {sub.trial_started_at ? new Date(sub.trial_started_at).toLocaleDateString() : '-'}
                          {sub.subscription_started_at ? ` / ${new Date(sub.subscription_started_at).toLocaleDateString()}` : ''}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {expiryDate ? new Date(expiryDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold ${days <= 3 ? 'text-rose-600' : days <= 7 ? 'text-amber-600' : 'text-slate-600'}`}>
                            {expiryDate ? formatDaysRemaining(expiryDate) : '-'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        filteredPayments.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payments found" description="No payments match your filters." />
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">School</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {schoolNames[pay.school_id] || pay.school_id.slice(0, 8)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        GH₵{pay.amount}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {pay.transaction_id}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {new Date(pay.payment_date || pay.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">{statusBadge(pay.status)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedPayment(pay)}
                          className="px-2.5 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Payment Review Modal */}
      <Modal
        isOpen={!!selectedPayment}
        onClose={() => { setSelectedPayment(null); setRejectReason(''); }}
        title="Review Payment"
        subtitle={selectedPayment ? `Transaction: ${selectedPayment.transaction_id}` : ''}
        maxWidth="md"
      >
        {selectedPayment && (
          <div className="space-y-4">
            {/* School Info */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <p className="text-[10px] text-slate-500 uppercase font-bold">School</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{schoolNames[selectedPayment.school_id] || 'Unknown'}</p>
            </div>

            {/* Payment Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Amount</p>
                <p className="text-sm font-bold text-orange-600 dark:text-orange-400">GH₵{selectedPayment.amount}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Transaction ID</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{selectedPayment.transaction_id}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Payment Date</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{new Date(selectedPayment.payment_date).toLocaleDateString()}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Submitted</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{new Date(selectedPayment.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Screenshot */}
            {selectedPayment.screenshot_url && (
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Payment Screenshot</p>
                <img
                  src={selectedPayment.screenshot_url}
                  alt="Payment screenshot"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 max-h-64 object-contain bg-slate-100 dark:bg-slate-800"
                />
              </div>
            )}

            {/* Note */}
            {selectedPayment.note && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Note</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">{selectedPayment.note}</p>
              </div>
            )}

            {/* Rejection Reason (if rejected) */}
            {selectedPayment.rejection_reason && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl">
                <p className="text-[10px] text-rose-600 uppercase font-bold">Rejection Reason</p>
                <p className="text-xs text-rose-700 dark:text-rose-300">{selectedPayment.rejection_reason}</p>
              </div>
            )}

            {/* Actions */}
            {selectedPayment.status === 'PENDING_VERIFICATION' && (
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 rounded-xl cursor-pointer"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedPayment.id)}
                  disabled={processing}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Approve Payment'}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => { setShowRejectModal(false); setRejectReason(''); }}
        title="Reject Payment"
        subtitle="Provide a reason for rejection"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Invalid transaction ID, screenshot unclear, amount incorrect..."
            className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setShowRejectModal(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={processing || !rejectReason.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Reject Payment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
