import React, { useEffect, useState, useMemo } from 'react';
import {
  School,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Users,
  GraduationCap,
  UserCheck,
  Eye,
  MoreVertical,
  Building2,
} from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { SkeletonTable } from '../common/SkeletonLoader';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface SuperAdminSchoolsProps {
  onNavigate: (view: string, id?: string) => void;
}

const ITEMS_PER_PAGE = 10;

export const SuperAdminSchools: React.FC<SuperAdminSchoolsProps> = ({ onNavigate }) => {
  const { schools, fetchSchools, updateSchoolStatus, loading } = useSuperAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState<{ schoolId: string; schoolName: string; status: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      const matchesSearch =
        !search ||
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.region?.toLowerCase().includes(search.toLowerCase()) ||
        s.district?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [schools, search, statusFilter]);

  const totalPages = Math.ceil(filteredSchools.length / ITEMS_PER_PAGE);
  const paginatedSchools = filteredSchools.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleStatusChange = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    const success = await updateSchoolStatus(confirmAction.schoolId, confirmAction.status);
    setActionLoading(false);
    setConfirmAction(null);
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

  if (loading && schools.length === 0) return <SkeletonTable rows={8} />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Schools Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {filteredSchools.length} school{filteredSchools.length !== 1 ? 's' : ''} registered on SamleyEduSuite
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, region, district..."
            className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="pl-9 pr-8 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Schools Table */}
      {paginatedSchools.length === 0 ? (
        <EmptyState
          icon={School}
          title="No schools found"
          description={search || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'No schools have been registered on the platform yet.'}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">School</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Location</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Contact</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Students</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Teachers</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Parents</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Registered</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedSchools.map((school) => (
                  <tr key={school.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {school.logo_url ? (
                          <img src={school.logo_url} alt="" className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200 dark:border-slate-700" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-orange-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{school.name}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{school.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {school.district || 'N/A'}, {school.region || ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {school.phone || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {school.student_count || 0}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {school.teacher_count || 0}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {school.parent_count || 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {statusBadge(school.status)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {new Date(school.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onNavigate('school-details', school.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <div className="relative group">
                          <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-10 hidden group-hover:block">
                            {school.status !== 'active' && (
                              <button
                                onClick={() => setConfirmAction({ schoolId: school.id, schoolName: school.name, status: 'active' })}
                                className="w-full text-left px-3 py-2 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
                              >
                                Activate School
                              </button>
                            )}
                            {school.status === 'active' && (
                              <button
                                onClick={() => setConfirmAction({ schoolId: school.id, schoolName: school.name, status: 'suspended' })}
                                className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                              >
                                Suspend School
                              </button>
                            )}
                            {school.status !== 'deactivated' && (
                              <button
                                onClick={() => setConfirmAction({ schoolId: school.id, schoolName: school.name, status: 'deactivated' })}
                                className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                              >
                                Deactivate School
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {paginatedSchools.map((school) => (
              <div
                key={school.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {school.logo_url ? (
                      <img src={school.logo_url} alt="" className="w-10 h-10 rounded-xl object-contain bg-white border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-orange-500" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{school.name}</p>
                      <p className="text-[11px] text-slate-500">{school.district}, {school.region}</p>
                    </div>
                  </div>
                  {statusBadge(school.status)}
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{school.student_count || 0}</p>
                    <p className="text-[10px] text-slate-400">Students</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{school.teacher_count || 0}</p>
                    <p className="text-[10px] text-slate-400">Teachers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{school.parent_count || 0}</p>
                    <p className="text-[10px] text-slate-400">Parents</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => onNavigate('school-details', school.id)}
                    className="flex-1 py-2 text-xs font-semibold text-orange-600 border border-orange-200 dark:border-orange-800 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, filteredSchools.length)} of {filteredSchools.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleStatusChange}
        title={`${confirmAction?.status === 'active' ? 'Activate' : confirmAction?.status === 'suspended' ? 'Suspend' : 'Deactivate'} School`}
        message={`Are you sure you want to ${confirmAction?.status} "${confirmAction?.schoolName}"? This action will be recorded in the audit log and the school will be notified.`}
        confirmLabel={confirmAction?.status === 'active' ? 'Activate' : confirmAction?.status === 'suspended' ? 'Suspend' : 'Deactivate'}
        variant={confirmAction?.status === 'active' ? 'primary' : 'danger'}
        loading={actionLoading}
      />
    </div>
  );
};
