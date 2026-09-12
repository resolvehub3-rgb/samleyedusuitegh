import React, { useEffect, useState, useCallback } from 'react';
import { CalendarCheck, Calendar, Filter, Save, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { SchoolClass, Student, AttendanceRecord, Profile } from '../../types/database';
import { Badge } from '../common/Badge';
import { SkeletonTable } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';

export const AttendanceOverview: React.FC = () => {
  const { school, profile } = useAuth();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceRecord['status']; remarks: string; id?: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [wards, setWards] = useState<(Student & { current_class?: SchoolClass })[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<string>('');
  const supabase = getSupabase();

  const isParent = profile?.role === 'parent';

  // 1. Fetch Classes (restricted by role) or Wards (for parents)
  useEffect(() => {
    if (!school) return;
    async function loadData() {
      // Parent: fetch linked wards
      if (isParent && profile) {
        const { data: rels } = await supabase
          .from('parent_students')
          .select('student:students(*, current_class:classes(*))')
          .eq('parent_id', profile.id);

        const list = (rels || []).map((r: any) => r.student).filter(Boolean);
        setWards(list as any);
        if (list.length > 0) setSelectedWardId(list[0].id);
        setLoading(false);
        return;
      }

      // Admin/Teacher: fetch classes
      let query = supabase.from('classes').select('*').eq('school_id', school.id).order('order_index');

      if (profile?.role === 'teacher') {
        const { data: ownClasses } = await supabase
          .from('classes').select('id')
          .eq('school_id', school.id)
          .eq('class_teacher_id', profile.id);
        const { data: assignedClasses } = await supabase
          .from('class_teacher_assignments').select('class_id')
          .eq('teacher_id', profile.id)
          .eq('is_class_teacher', true);
        const allClassIds = [
          ...(ownClasses || []).map((c) => c.id),
          ...(assignedClasses || []).map((a) => a.class_id)
        ];
        const uniqueClassIds = [...new Set(allClassIds)];
        if (uniqueClassIds.length > 0) {
          query = query.in('id', uniqueClassIds);
        } else {
          setClasses([]);
          setLoading(false);
          return;
        }
      }

      const { data } = await query;
      if (data && data.length > 0) {
        setClasses(data as SchoolClass[]);
        setSelectedClassId(data[0].id);
      } else {
        setLoading(false);
      }
    }
    loadData();
  }, [school, profile, supabase, isParent]);

  // 2. Fetch Students and Attendance for Selected Class & Date (or Ward for parents)
  const fetchRosterAndAttendance = useCallback(async () => {
    // Parent: fetch attendance for selected ward only
    if (isParent && selectedWardId && school) {
      try {
        setLoading(true);
        setSaveSuccess(false);

        const ward = wards.find((w) => w.id === selectedWardId);
        const attQuery = supabase
          .from('attendance')
          .select('*')
          .eq('school_id', school.id)
          .eq('student_id', selectedWardId)
          .eq('date', selectedDate);

        const { data: attData } = await attQuery;
        const map: Record<string, { status: AttendanceRecord['status']; remarks: string; id?: string }> = {};
        (attData || []).forEach((rec: any) => {
          map[rec.student_id] = { status: rec.status, remarks: rec.remarks || '', id: rec.id };
        });

        if (ward) {
          map[ward.id] = map[ward.id] || { status: 'present', remarks: '' };
          setStudents([ward as Student]);
          setAttendanceMap(map);
        }
      } catch (e) {
        console.error('Error fetching ward attendance:', e);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Admin/Teacher: fetch class roster
    if (!school || !selectedClassId) return;
    try {
      setLoading(true);
      setSaveSuccess(false);

      const { data: studentsData } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', school.id)
        .eq('current_class_id', selectedClassId)
        .eq('status', 'active')
        .order('last_name');

      // Get attendance records for this date
      const { data: attData } = await supabase
        .from('attendance')
        .select('*')
        .eq('school_id', school.id)
        .eq('class_id', selectedClassId)
        .eq('date', selectedDate);

      const map: Record<string, { status: AttendanceRecord['status']; remarks: string; id?: string }> = {};

      (attData || []).forEach((rec: any) => {
        map[rec.student_id] = {
          status: rec.status,
          remarks: rec.remarks || '',
          id: rec.id
        };
      });

      // Default unmarked students to 'present'
      (studentsData || []).forEach((std: any) => {
        if (!map[std.id]) {
          map[std.id] = { status: 'present', remarks: '' };
        }
      });

      setStudents((studentsData || []) as Student[]);
      setAttendanceMap(map);
    } catch (e) {
      console.error('Error fetching attendance:', e);
    } finally {
      setLoading(false);
    }
  }, [school, selectedClassId, selectedDate, supabase, isParent, selectedWardId, wards]);

  useEffect(() => {
    if (isParent) {
      if (selectedWardId) fetchRosterAndAttendance();
    } else {
      if (selectedClassId) fetchRosterAndAttendance();
    }
  }, [selectedClassId, selectedDate, fetchRosterAndAttendance, isParent, selectedWardId]);

  const handleStatusChange = (studentId: string, status: AttendanceRecord['status']) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const handleMarkAll = (status: AttendanceRecord['status']) => {
    const updated: typeof attendanceMap = {};
    students.forEach((s) => {
      updated[s.id] = {
        ...attendanceMap[s.id],
        status
      };
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    if (!school || !selectedClassId || !profile) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const recordsToUpsert = students.map((std) => {
        const item = attendanceMap[std.id];
        return {
          school_id: school.id,
          class_id: selectedClassId,
          student_id: std.id,
          date: selectedDate,
          status: item?.status || 'present',
          remarks: item?.remarks || null,
          recorded_by: profile.id
        };
      });

      const { error } = await supabase
        .from('attendance')
        .upsert(recordsToUpsert, {
          onConflict: 'student_id,date'
        });

      if (error) {
        alert(`Failed to save attendance: ${error.message}`);
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(`Error saving: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Metrics for today's selected sheet
  const attendanceValues = Object.values(attendanceMap) as { status: AttendanceRecord['status']; remarks: string; id?: string }[];
  const presentCount = attendanceValues.filter((a) => a.status === 'present').length;
  const absentCount = attendanceValues.filter((a) => a.status === 'absent').length;
  const lateCount = attendanceValues.filter((a) => a.status === 'late').length;
  const excusedCount = attendanceValues.filter((a) => a.status === 'excused').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isParent ? 'Ward Attendance' : 'Daily Class Attendance Register'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isParent
              ? 'View your child\'s daily attendance record'
              : 'Record, monitor, and synchronize pupil attendance with realtime parent alerts'}
          </p>
        </div>

        {!isParent && (
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Saved Successfully!
              </span>
            )}
            <button
              onClick={handleSaveAttendance}
              disabled={saving || students.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Register...' : 'Save Daily Register'}
            </button>
          </div>
        )}
      </div>

      {/* Control Bar: Ward (parents) or Class (admin/teacher), Date */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Parent: Ward Selector */}
          {isParent ? (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Select Ward
              </label>
              <select
                value={selectedWardId}
                onChange={(e) => setSelectedWardId(e.target.value)}
                className="px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium min-w-[180px]"
              >
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.first_name} {w.last_name} ({w.current_class?.name || 'Class'})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Select Class
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium min-w-[160px]"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.stage})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
            />
          </div>
        </div>

        {/* Quick bulk buttons - admin/teacher only */}
        {!isParent && (
          <div className="flex items-center gap-1.5 w-full md:w-auto justify-end">
            <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Mark All:</span>
            <button
              onClick={() => handleMarkAll('present')}
              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-lg transition-colors cursor-pointer"
            >
            All Present
          </button>
          <button
            onClick={() => handleMarkAll('absent')}
            className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 rounded-lg transition-colors cursor-pointer"
          >
            All Absent
          </button>
        </div>
        )}
      </div>

      {/* Attendance Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">Present</span>
          <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{presentCount}</span>
        </div>
        <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-center justify-between">
          <span className="text-xs font-medium text-rose-800 dark:text-rose-300">Absent</span>
          <span className="text-lg font-bold text-rose-700 dark:text-rose-400">{absentCount}</span>
        </div>
        <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center justify-between">
          <span className="text-xs font-medium text-amber-800 dark:text-amber-300">Late</span>
          <span className="text-lg font-bold text-amber-700 dark:text-amber-400">{lateCount}</span>
        </div>
        <div className="p-3.5 bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 rounded-xl flex items-center justify-between">
          <span className="text-xs font-medium text-sky-800 dark:text-sky-300">Excused</span>
          <span className="text-lg font-bold text-sky-700 dark:text-sky-400">{excusedCount}</span>
        </div>
      </div>

      {/* Students Roll Register Table */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : profile?.role === 'teacher' && classes.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No classes assigned"
          description="Only primary class teachers can mark attendance. Please ask your school administrator to assign you as a class teacher for a specific class."
        />
      ) : isParent && wards.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No wards linked"
          description="No children are linked to your account. Please contact your school administrator."
        />
      ) : students.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No students in this class"
          description="Please assign students to this class in Student Management to take attendance."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Pupil / Student</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Teacher Remark / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((std, idx) => {
                  const currentStatus = attendanceMap[std.id]?.status || 'present';
                  const remarks = attendanceMap[std.id]?.remarks || '';

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {std.first_name} {std.last_name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                        {std.student_id_number || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        {isParent ? (
                          <span className={`inline-flex px-3 py-1 text-[11px] font-semibold rounded-lg capitalize ${
                            currentStatus === 'present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' :
                            currentStatus === 'absent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' :
                            currentStatus === 'late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' :
                            'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300'
                          }`}>{currentStatus}</span>
                        ) : (
                          <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
                            {(['present', 'absent', 'late', 'excused'] as const).map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleStatusChange(std.id, st)}
                                className={`px-3 py-1 text-[11px] font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                                  currentStatus === st
                                    ? st === 'present'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : st === 'absent'
                                      ? 'bg-rose-600 text-white shadow-xs'
                                      : st === 'late'
                                      ? 'bg-amber-600 text-white shadow-xs'
                                      : 'bg-sky-600 text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isParent ? (
                          <span className="text-[11px] text-slate-600 dark:text-slate-400">
                            {remarks || 'No remark'}
                          </span>
                        ) : (
                          <input
                            type="text"
                            value={remarks}
                            onChange={(e) => handleRemarksChange(std.id, e.target.value)}
                            placeholder="e.g. excused due to clinic visit..."
                            className="w-full max-w-xs px-2.5 py-1 text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-orange-500"
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
