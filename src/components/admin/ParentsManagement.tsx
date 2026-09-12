import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  GraduationCap,
  UserCheck,
  ShieldCheck,
  ChevronRight,
  X
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Profile } from '../../types/database';
import { StatCard } from '../common/StatCard';
import { EmptyState } from '../common/EmptyState';
import { SkeletonTable } from '../common/SkeletonLoader';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

interface ParentWithStudents extends Profile {
  student_count: number;
  students: { id: string; first_name: string; last_name: string; admission_number: string; status: string }[];
}

export const ParentsManagement: React.FC = () => {
  const { school } = useAuth();
  const [parents, setParents] = useState<ParentWithStudents[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParent, setSelectedParent] = useState<ParentWithStudents | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const supabase = getSupabase();

  const fetchData = useCallback(async () => {
    if (!school) return;
    setLoading(true);

    try {
      // 1. Fetch all parent profiles for this school
      const { data: parentProfiles, error: parentErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('school_id', school.id)
        .eq('role', 'parent')
        .order('full_name', { ascending: true });

      if (parentErr) {
        console.error('Error fetching parents:', parentErr);
        setLoading(false);
        return;
      }

      if (!parentProfiles || parentProfiles.length === 0) {
        setParents([]);
        setLoading(false);
        return;
      }

      // 2. Fetch all parent_student links
      const parentIds = parentProfiles.map((p) => p.id);
      const { data: links } = await supabase
        .from('parent_students')
        .select('parent_id, student_id')
        .in('parent_id', parentIds);

      // 3. Fetch student details for linked students
      const studentIds = [...new Set((links || []).map((l) => l.student_id))];
      let studentMap: Record<string, { id: string; first_name: string; last_name: string; admission_number: string; status: string }> = {};

      if (studentIds.length > 0) {
        const { data: students } = await supabase
          .from('students')
          .select('id, first_name, last_name, admission_number, status')
          .in('id', studentIds);

        if (students) {
          studentMap = Object.fromEntries(students.map((s) => [s.id, s]));
        }
      }

      // 4. Combine
      const enriched: ParentWithStudents[] = parentProfiles.map((parent) => {
        const parentLinks = (links || []).filter((l) => l.parent_id === parent.id);
        const studentList = parentLinks
          .map((l) => studentMap[l.student_id])
          .filter(Boolean);

        return {
          ...parent,
          student_count: parentLinks.length,
          students: studentList
        };
      });

      setParents(enriched);
    } catch (err) {
      console.error('Error fetching parents data:', err);
    } finally {
      setLoading(false);
    }
  }, [school, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = parents.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q)
    );
  });

  const totalParents = parents.length;
  const totalLinkedStudents = parents.reduce((sum, p) => sum + p.student_count, 0);
  const activeParents = parents.filter((p) => p.is_active).length;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Parent Management
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          View all parents/guardians and their linked students
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Parents"
          value={totalParents}
          icon={Users}
          subtitle="Registered parent accounts"
          colorClass="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40"
        />
        <StatCard
          title="Linked Students"
          value={totalLinkedStudents}
          icon={GraduationCap}
          subtitle="Ward connections across all parents"
          colorClass="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
        />
        <StatCard
          title="Active Parents"
          value={activeParents}
          icon={ShieldCheck}
          subtitle="Currently active accounts"
          colorClass="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40"
        />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search parents by name, email, or phone..."
          className="block w-full pl-10 pr-3 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400"
        />
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={5} cols={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchQuery ? 'No parents match your search' : 'No Parents Yet'}
          description={
            searchQuery
              ? 'Try adjusting your search terms.'
              : 'Parents will appear here once they are linked to students from the Students tab.'
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {/* Desktop Header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <div className="col-span-3">Parent Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-2 text-center">Linked Students</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-1"></div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((parent) => (
              <div
                key={parent.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors items-center cursor-pointer"
                onClick={() => {
                  setSelectedParent(parent);
                  setIsDetailModalOpen(true);
                }}
              >
                {/* Name */}
                <div className="sm:col-span-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-xs font-bold shrink-0">
                    {parent.full_name
                      ?.split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || 'P'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {parent.full_name}
                    </p>
                    <p className="text-[11px] text-slate-400 sm:hidden">{parent.email}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="hidden sm:block sm:col-span-3">
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    {parent.email}
                  </p>
                </div>

                {/* Phone */}
                <div className="hidden sm:block sm:col-span-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    {parent.phone || '—'}
                  </p>
                </div>

                {/* Student Count */}
                <div className="sm:col-span-2 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      parent.student_count > 0
                        ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <GraduationCap className="w-3 h-3" />
                    {parent.student_count} {parent.student_count === 1 ? 'student' : 'students'}
                  </span>
                </div>

                {/* Status */}
                <div className="hidden sm:block sm:col-span-1 text-center">
                  <Badge variant={parent.is_active ? 'success' : 'danger'} size="sm">
                    {parent.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Arrow */}
                <div className="hidden sm:block sm:col-span-1 text-right">
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 inline" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedParent?.full_name || 'Parent Details'}
        subtitle={selectedParent?.email || ''}
        maxWidth="md"
      >
        {selectedParent && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1">Full Name</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedParent.full_name}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1">Gender</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedParent.gender || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1">Email</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedParent.email}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1">Phone</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedParent.phone || '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1">Status</p>
                <Badge variant={selectedParent.is_active ? 'success' : 'danger'} size="sm">
                  {selectedParent.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            {/* Linked Students */}
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-2">
                Linked Students ({selectedParent.student_count})
              </p>
              {selectedParent.students.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <UserCheck className="w-5 h-5 mx-auto mb-1.5 text-slate-300 dark:text-slate-600" />
                  No students linked yet
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedParent.students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-orange-700 dark:text-orange-300 text-xs font-bold">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Admission: {student.admission_number}
                          </p>
                        </div>
                      </div>
                      <Badge variant={student.status === 'active' ? 'success' : 'neutral'} size="sm">
                        {student.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
