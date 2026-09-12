import React, { useEffect, useState, useMemo } from 'react';
import { UserCheck, Search, Filter, ChevronLeft, ChevronRight, Mail, Phone, Building2 } from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { SkeletonTable } from '../common/SkeletonLoader';

const ITEMS_PER_PAGE = 15;

export const SuperAdminTeachers: React.FC = () => {
  const { teachers, fetchTeachers, loading } = useSuperAdmin();
  const [search, setSearch] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  const uniqueSchools = useMemo(() => {
    const map = new Map<string, string>();
    teachers.forEach((t: any) => { if (t.school?.name) map.set(t.school_id, t.school.name); });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [teachers]);

  const filtered = useMemo(() => {
    return teachers.filter((t: any) => {
      const matchSearch = !search ||
        t.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        t.email?.toLowerCase().includes(search.toLowerCase());
      const matchSchool = schoolFilter === 'all' || t.school_id === schoolFilter;
      const matchStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && t.is_active) ||
        (statusFilter === 'inactive' && !t.is_active);
      return matchSearch && matchSchool && matchStatus;
    });
  }, [teachers, search, schoolFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (loading && teachers.length === 0) return <SkeletonTable rows={8} />;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Platform Teachers</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{filtered.length} teachers across all schools</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..." className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none placeholder:text-slate-400" />
        </div>
        <select value={schoolFilter} onChange={(e) => { setSchoolFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer">
          <option value="all">All Schools</option>
          {uniqueSchools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {paginated.length === 0 ? (
        <EmptyState icon={UserCheck} title="No teachers found" description={search || schoolFilter !== 'all' ? 'Try adjusting your filters.' : 'No teachers have been registered yet.'} />
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Teacher</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Phone</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">School</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginated.map((teacher: any) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-[11px] font-bold text-blue-700 dark:text-blue-300">
                          {teacher.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'T'}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{teacher.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{teacher.email}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{teacher.phone || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Building2 className="w-3 h-3 text-slate-400" />{teacher.school?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={teacher.is_active ? 'success' : 'danger'} size="sm">{teacher.is_active ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {new Date(teacher.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {paginated.map((teacher: any) => (
              <div key={teacher.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-300">
                    {teacher.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'T'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{teacher.full_name}</p>
                    <p className="text-[11px] text-slate-500">{teacher.email}</p>
                  </div>
                  <Badge variant={teacher.is_active ? 'success' : 'danger'} size="sm">{teacher.is_active ? 'Active' : 'Inactive'}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{teacher.school?.name || 'N/A'}</span>
                  {teacher.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{teacher.phone}</span>}
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
