import React, { useEffect, useState, useMemo } from 'react';
import { UserCheck, Search, Filter, ChevronLeft, ChevronRight, Mail, Phone, Building2 } from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { SkeletonTable } from '../common/SkeletonLoader';

const ITEMS_PER_PAGE = 15;

export const SuperAdminUsers: React.FC = () => {
  const { schoolAdmins, fetchSchoolAdmins, loading } = useSuperAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchSchoolAdmins(); }, [fetchSchoolAdmins]);

  const filtered = useMemo(() => {
    return schoolAdmins.filter((a) => {
      const matchSearch = !search ||
        a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        a.email?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && a.is_active) ||
        (statusFilter === 'inactive' && !a.is_active);
      return matchSearch && matchStatus;
    });
  }, [schoolAdmins, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (loading && schoolAdmins.length === 0) return <SkeletonTable rows={8} />;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">School Administrators</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{filtered.length} school admin accounts across all schools</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..." className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none placeholder:text-slate-400" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {paginated.length === 0 ? (
        <EmptyState icon={UserCheck} title="No school admins found" description={search ? 'Try adjusting your search.' : 'No school administrators registered yet.'} />
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Admin</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">School</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginated.map((admin: any) => (
                  <tr key={admin.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-[11px] font-bold text-orange-700 dark:text-orange-300">
                          {admin.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'SA'}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{admin.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{admin.email}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {admin.school?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={admin.is_active ? 'success' : 'danger'} size="sm">{admin.is_active ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {new Date(admin.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {paginated.map((admin: any) => (
              <div key={admin.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-sm font-bold text-orange-700 dark:text-orange-300">
                    {admin.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'SA'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{admin.full_name}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" />{admin.email}</p>
                  </div>
                  <Badge variant={admin.is_active ? 'success' : 'danger'} size="sm">{admin.is_active ? 'Active' : 'Inactive'}</Badge>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1"><Building2 className="w-3 h-3" />{admin.school?.name || 'N/A'}</p>
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
