import React, { useEffect, useState, useCallback } from 'react';
import { Award, Save, CheckCircle2, AlertCircle, BookOpen, Layers } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { SchoolClass, Subject, Student, StudentResult } from '../../types/database';
import { Badge } from '../common/Badge';
import { SkeletonTable } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';

export const AcademicResultsEntry: React.FC = () => {
  const { school, schoolSettings, profile } = useAuth();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [academicYear, setAcademicYear] = useState(schoolSettings?.active_academic_year || '2025/2026');
  const [term, setTerm] = useState(schoolSettings?.active_term || 'Term 1');

  // Student results map: studentId -> { classScore, examScore, totalScore, grade, remark, id }
  const [marksMap, setMarksMap] = useState<Record<string, { classScore: string; examScore: string; remark: string; id?: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const supabase = getSupabase();

  // Helper for Ghanaian Grade and Remark
  const calculateGradeAndRemark = (total: number): { grade: string; remark: string } => {
    if (total >= 90) return { grade: '1', remark: 'Excellent' };
    if (total >= 80) return { grade: '2', remark: 'Very Good' };
    if (total >= 70) return { grade: '3', remark: 'Good' };
    if (total >= 60) return { grade: '4', remark: 'Credit' };
    if (total >= 55) return { grade: '5', remark: 'Credit' };
    if (total >= 50) return { grade: '6', remark: 'Pass' };
    if (total >= 45) return { grade: '7', remark: 'Pass' };
    if (total >= 40) return { grade: '8', remark: 'Weak Pass' };
    return { grade: '9', remark: 'Needs Improvement' };
  };

  // 1. Fetch Classes and Subjects
  useEffect(() => {
    if (!school) return;
    async function loadMeta() {
      let classesQuery = supabase.from('classes').select('*').eq('school_id', school.id).order('order_index');
      const subRes = await supabase.from('subjects').select('*').eq('school_id', school.id).order('name');

      // For teachers, only load classes where they are the primary class teacher
      if (profile?.role === 'teacher') {
        const { data: ownClasses } = await supabase
          .from('classes')
          .select('id')
          .eq('school_id', school.id)
          .eq('class_teacher_id', profile.id);

        const { data: assignedClasses } = await supabase
          .from('class_teacher_assignments')
          .select('class_id')
          .eq('teacher_id', profile.id)
          .eq('is_class_teacher', true);

        const allClassIds = [
          ...(ownClasses || []).map((c) => c.id),
          ...(assignedClasses || []).map((a) => a.class_id)
        ];
        const uniqueClassIds = [...new Set(allClassIds)];

        if (uniqueClassIds.length > 0) {
          classesQuery = classesQuery.in('id', uniqueClassIds);
        } else {
          setClasses([]);
          setLoading(false);
          return;
        }
      }

      const clsRes = await classesQuery;

      if (clsRes.data && clsRes.data.length > 0) {
        setClasses(clsRes.data as SchoolClass[]);
        setSelectedClassId(clsRes.data[0].id);
      }
      if (subRes.data && subRes.data.length > 0) {
        setSubjects(subRes.data as Subject[]);
        setSelectedSubjectId(subRes.data[0].id);
      }
    }
    loadMeta();
  }, [school, profile, supabase]);

  // 2. Fetch Students and Existing Marks
  const fetchMarks = useCallback(async () => {
    if (!school || !selectedClassId || !selectedSubjectId) return;
    try {
      setLoading(true);
      setSavedSuccess(false);

      const [stdRes, resRes] = await Promise.all([
        supabase
          .from('students')
          .select('*')
          .eq('school_id', school.id)
          .eq('current_class_id', selectedClassId)
          .eq('status', 'active')
          .order('last_name'),
        supabase
          .from('student_results')
          .select('*')
          .eq('school_id', school.id)
          .eq('class_id', selectedClassId)
          .eq('subject_id', selectedSubjectId)
          .eq('academic_year', academicYear)
          .eq('term', term)
      ]);

      const map: Record<string, { classScore: string; examScore: string; remark: string; id?: string }> = {};

      (resRes.data || []).forEach((r: any) => {
        map[r.student_id] = {
          classScore: r.class_score !== null ? String(r.class_score) : '',
          examScore: r.exam_score !== null ? String(r.exam_score) : '',
          remark: r.remark || '',
          id: r.id
        };
      });

      (stdRes.data || []).forEach((s: any) => {
        if (!map[s.id]) {
          map[s.id] = { classScore: '', examScore: '', remark: '' };
        }
      });

      setStudents((stdRes.data || []) as Student[]);
      setMarksMap(map);
    } catch (e) {
      console.error('Error fetching marks:', e);
    } finally {
      setLoading(false);
    }
  }, [school, selectedClassId, selectedSubjectId, academicYear, term, supabase]);

  useEffect(() => {
    if (selectedClassId && selectedSubjectId) {
      fetchMarks();
    }
  }, [selectedClassId, selectedSubjectId, academicYear, term, fetchMarks]);

  const handleScoreChange = (
    studentId: string,
    field: 'classScore' | 'examScore' | 'remark',
    value: string
  ) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSaveMarks = async () => {
    if (!school || !selectedClassId || !selectedSubjectId || !profile) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      const recordsToUpsert = students.map((std) => {
        const item = marksMap[std.id] || { classScore: '', examScore: '', remark: '' };
        const cScore = item.classScore !== '' ? Number(item.classScore) : 0;
        const eScore = item.examScore !== '' ? Number(item.examScore) : 0;
        const total = Math.min(100, Math.max(0, cScore + eScore));
        const { grade, remark } = calculateGradeAndRemark(total);

        return {
          school_id: school.id,
          student_id: std.id,
          class_id: selectedClassId,
          subject_id: selectedSubjectId,
          academic_year: academicYear,
          term: term,
          class_score: cScore,
          exam_score: eScore,
          grade: grade,
          remark: item.remark.trim() || remark,
          recorded_by: profile.id
        };
      });

      const { error } = await supabase
        .from('student_results')
        .upsert(recordsToUpsert, {
          onConflict: 'school_id,student_id,class_id,subject_id,academic_year,term'
        });

      if (error) {
        alert(`Failed to save marks: ${error.message}`);
      } else {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(`Error saving marks: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Academic Performance & Results Entry
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Standard Ghanaian continuous assessment (Class Score + Exam Score = 100%) and Stanine/BECE grading
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Marks Saved Successfully!
            </span>
          )}
          <button
            onClick={handleSaveMarks}
            disabled={saving || students.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Academic Marks'}
          </button>
        </div>
      </div>

      {/* Control Selector Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Class selector - hidden for teachers (auto-selected to their primary class) */}
        {profile?.role !== 'teacher' && (
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.stage})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* For teachers, show their assigned class as read-only info */}
        {profile?.role === 'teacher' && classes.length > 0 && (
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Your Class
            </label>
            <div className="w-full px-3 py-2 text-xs bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 rounded-xl text-orange-800 dark:text-orange-300 font-medium">
              {classes[0]?.name} ({classes[0]?.stage})
            </div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Subject
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Academic Year
          </label>
          <input
            type="text"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Term
          </label>
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value as any)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
          >
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>
        </div>
      </div>

      {/* Marks Table */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : profile?.role === 'teacher' && classes.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No primary class assigned"
          description="Only primary class teachers can enter academic marks. Please ask your school administrator to assign you as a class teacher for a specific class."
        />
      ) : students.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No students enrolled in this class"
          description="Enroll students to begin entering scores for this subject."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class Score (30%)</th>
                  <th className="py-3 px-4">Exam Score (70%)</th>
                  <th className="py-3 px-4">Total (100%)</th>
                  <th className="py-3 px-4">Ghana Grade</th>
                  <th className="py-3 px-4">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((std, idx) => {
                  const m = marksMap[std.id] || { classScore: '', examScore: '', remark: '' };
                  const c = m.classScore !== '' ? Number(m.classScore) : 0;
                  const e = m.examScore !== '' ? Number(m.examScore) : 0;
                  const total = Math.min(100, Math.max(0, c + e));
                  const { grade, remark } = calculateGradeAndRemark(total);

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {std.first_name} {std.last_name}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {std.student_id_number || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={m.classScore}
                          onChange={(e) => handleScoreChange(std.id, 'classScore', e.target.value)}
                          placeholder="e.g. 25"
                          className="w-20 px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min={0}
                          max={70}
                          value={m.examScore}
                          onChange={(e) => handleScoreChange(std.id, 'examScore', e.target.value)}
                          placeholder="e.g. 55"
                          className="w-20 px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {m.classScore || m.examScore ? `${total}%` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {m.classScore || m.examScore ? (
                          <Badge
                            variant={
                              Number(grade) <= 3
                                ? 'success'
                                : Number(grade) <= 6
                                ? 'primary'
                                : 'danger'
                            }
                            size="sm"
                          >
                            Grade {grade}
                          </Badge>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={m.remark || (m.classScore || m.examScore ? remark : '')}
                          onChange={(e) => handleScoreChange(std.id, 'remark', e.target.value)}
                          placeholder="Auto remark"
                          className="w-full max-w-xs px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                        />
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
