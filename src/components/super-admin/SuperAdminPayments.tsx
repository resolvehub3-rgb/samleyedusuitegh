import React, { useEffect, useState, useMemo } from 'react';
import { CreditCard, Search, Filter, ChevronLeft, ChevronRight, Building2, Banknote } from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { Badge } from '../common/Badge';
import { StatCard } from '../common/StatCard';
import { EmptyState } from '../common/EmptyState';
import { SkeletonTable, SkeletonCard } from '../common/SkeletonLoader';

const ITEMS_PER_PAGE = 20;

export const SuperAdminPayments: React.FC = () => {
  const { payments, fetchPayments, paymentStats, loading } = useSuperAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const uniqueSchools = useMemo(() => {
    const map = new Map<string, string>();
    payments.forEach((p: any) => { if (p.school?.name) map.set(p.school_id, p.school.name); });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [payments]);

  const filtered = useMemo(() => {
    return payments.filter((p: any) => {
      const matchSearch = !search ||
        p.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
        p.purpose?.toLowerCase().includes(search.toLowerCase()) ||
        p.student?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.student?.last_name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchSchool = schoolFilter === 'all' || p.school_id === schoolFilter;
      return matchSearch && matchStatus && matchSchool;
    });
  }, [payments, search, statusFilter, schoolFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (loading && payments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
        <SkeletonTable rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Platform Payments</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Monitor all payment activity across SamleyEduSuite</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Payments" value={paymentStats.total} icon={CreditCard} colorClass="text-orange-600 bg-orange-50 dark:bg-orange-950/40" />
        <StatCard title="Total Amount" value={`GHS ${paymentStats.amount.toLocaleString()}`} icon={Banknote} colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" />
        <StatCard title="Verified" value={paymentStats.verified} icon={CreditCard} subtitle="Completed payments" colorClass="text-blue-600 bg-blue-50 dark:bg-blue-950/40" />
        <StatCard title="Pending" value={paymentStats.pending} icon={CreditCard} subtitle="Awaiting verification" colorClass="text-amber-600 bg-amber-50 dark:bg-amber-950/40" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by invoice, purpose, student name..." className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none placeholder:text-slate-400" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
        <select value={schoolFilter} onChange={(e) => { setSchoolFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer">
          <option value="all">All Schools</option>
          {uniqueSchools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {paginated.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments found" description={search || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'No payments have been recorded on the platform yet.'} />
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Invoice</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">School</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Student</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Purpose</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Method</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginated.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-800 dark:text-slate-200">{payment.invoice_number}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3 text-slate-400" />{payment.school?.name || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {payment.student ? `${payment.student.first_name} ${payment.student.last_name}` : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{payment.purpose}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                      {payment.currency || 'GHS'} {Number(payment.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{payment.payment_method}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={payment.status === 'verified' || payment.status === 'paid' ? 'success' : payment.status === 'pending' ? 'warning' : 'danger'}
                        size="sm"
                      >{payment.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {paginated.map((payment: any) => (
              <div key={payment.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{payment.invoice_number}</span>
                  <Badge variant={payment.status === 'verified' || payment.status === 'paid' ? 'success' : payment.status === 'pending' ? 'warning' : 'danger'} size="sm">{payment.status}</Badge>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {payment.currency || 'GHS'} {Number(payment.amount).toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{payment.purpose} • {payment.payment_method}</p>
                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{payment.school?.name || 'N/A'}</span>
                  <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{page}/{totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
