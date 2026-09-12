import React, { useEffect, useState, useCallback } from 'react';
import { Layers, PlusCircle, Users, UserCheck, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { SchoolClass, Profile, Student } from '../../types/database';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { SkeletonTable } from '../common/SkeletonLoader';

export const ClassManagement: React.FC = () => {
  const { school, role, profile } = useAuth();
  const isAdmin = role === 'admin';
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Add class modal (Admin only)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('A');
  const [stage, setStage] = useState<'Kindergarten' | 'Primary' | 'Junior High'>('Primary');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [saving, setSaving] = useState(false);

  const supabase = getSupabase();

  const fetchClasses = useCallback(async () => {
    if (!school) return;
    try {
      setLoading(true);
      const [classesRes, teachersRes, studentsRes, assignmentsRes] = await Promise.all([
        supabase
          .from('classes')
          .select('*')
          .eq('school_id', school.id)
          .order('order_index'),
        supabase
          .from('profiles')
          .select('*')
          .eq('school_id', school.id)
          .eq('role', 'teacher'),
        supabase
          .from('students')
          .select('current_class_id')
          .eq('school_id', school.id),
        supabase
          .from('class_teacher_assignments')
          .select('class_id, teacher_id, profiles:teacher_id(*)')
          .eq('school_id', school.id)
      ]);

      // Map class teacher assignments onto classes
      const assignments = (assignmentsRes.data || []) as any[];
      const teacherMap: Record<string, Profile> = {};
      assignments.forEach((a: any) => {
        if (a.class_id && a.profiles) {
          teacherMap[a.class_id] = a.profiles as Profile;
        }
      });

      const classesWithTeachers = (classesRes.data || []).map((cls: any) => ({
        ...cls,
        class_teacher: teacherMap[cls.id] || null
      }));

      setClasses(classesWithTeachers as SchoolClass[]);
      setTeachers((teachersRes.data || []) as Profile[]);

      // Count students per class
      const counts: Record<string, number> = {};
      (studentsRes.data || []).forEach((s: any) => {
        if (s.current_class_id) {
          counts[s.current_class_id] = (counts[s.current_class_id] || 0) + 1;
        }
      });
      setStudentCounts(counts);
    } catch (e) {
      console.error('Failed to fetch classes:', e);
    } finally {
      setLoading(false);
    }
  }, [school, supabase]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Only school administrators and proprietors are authorized to create or configure classes and sections.');
      return;
    }
    if (!school || !className) return;

    setSaving(true);
    try {
      const nextOrder = classes.length + 1;
      const { error } = await supabase.from('classes').insert({
        school_id: school.id,
        name: className.trim(),
        section: section.trim() || 'A',
        stage,
        class_teacher_id: selectedTeacherId || null,
        order_index: nextOrder
      });

      if (error) {
        alert(`Error adding class: ${error.message}`);
      } else {
        setIsModalOpen(false);
        setClassName('');
        setSelectedTeacherId('');
        fetchClasses();
      }
    } catch (err: any) {
      alert(`Exception: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Class Management (KG to JHS)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isAdmin
              ? 'Standard Ghanaian academic levels, sections, assigned class teachers, and student rosters'
              : 'Official Ghanaian curriculum class roster. Class allocations and sections are configured by School Administration.'}
          </p>
        </div>
        {isAdmin ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Add Custom Class / Section
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
            <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />
            <span>Curriculum Managed by School Admin</span>
          </div>
        )}
      </div>

      {loading ? (
        <SkeletonTable rows={8} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => {
            const count = studentCounts[cls.id] || 0;
            const isAssignedToCurrentTeacher = profile?.role === 'teacher' && cls.class_teacher_id === profile.id;
            return (
              <div
                key={cls.id}
                className={`p-5 bg-white dark:bg-slate-900 border rounded-2xl shadow-xs transition-all flex flex-col justify-between ${
                  isAssignedToCurrentTeacher
                    ? 'border-emerald-500/80 ring-2 ring-emerald-500/20 dark:ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400">
                      Level {cls.order_index}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isAssignedToCurrentTeacher && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Your Class
                        </span>
                      )}
                      <Badge
                        variant={
                          cls.stage === 'Kindergarten'
                            ? 'warning'
                            : cls.stage === 'Junior High'
                            ? 'primary'
                            : 'info'
                        }
                        size="sm"
                      >
                        {cls.stage}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {cls.name} {cls.section ? `(Section ${cls.section})` : ''}
                  </h3>

                  <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Users className="w-3.5 h-3.5" /> Enrolled Students:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {count} pupils
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <UserCheck className="w-3.5 h-3.5" /> Class Teacher:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">
                        {cls.class_teacher?.full_name || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Ghana Basic Education Curriculum</span>
                  <span className="text-orange-600 dark:text-orange-400 font-semibold">Active</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Class Modal (Admin Only) */}
      <Modal
        isOpen={isModalOpen && isAdmin}
        onClose={() => setIsModalOpen(false)}
        title="Add Class / Stream"
        subtitle="Create custom sections (e.g. Basic 4 Section B)"
        maxWidth="md"
      >
        <form onSubmit={handleAddClass} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Class Name *
            </label>
            <input
              type="text"
              required
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. Basic 4"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Section / Stream
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. A, B, Gold"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Curriculum Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Kindergarten">Kindergarten</option>
                <option value="Primary">Primary</option>
                <option value="Junior High">Junior High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assign Primary Class Teacher
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="">-- Assign Later --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {saving ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
