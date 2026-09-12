import React, { useEffect, useState, useCallback } from 'react';
import { 
  Printer, 
  Award, 
  Save, 
  CheckCircle2, 
  FileSpreadsheet,
  AlertTriangle,
  UserCheck,
  Bell
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { SchoolClass, Student, Subject, StudentResult, TerminalReport, ParentStudent, Profile } from '../../types/database';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';

export const TerminalReportCard: React.FC = () => {
  const { school, schoolSettings, profile } = useAuth();
  const { sendNotification } = useNotifications();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [academicYear, setAcademicYear] = useState(schoolSettings?.active_academic_year || '2025/2026');
  const [term, setTerm] = useState(schoolSettings?.active_term || 'Term 1');

  // Report Data
  const [results, setResults] = useState<(StudentResult & { subject?: Subject })[]>([]);
  const [attendanceCount, setAttendanceCount] = useState({ present: 0, total: 0 });
  const [classPosition, setClassPosition] = useState<string>('');
  const [conduct, setConduct] = useState('Respectful, humble, and obedient.');
  const [attitude, setAttitude] = useState('Shows strong interest in classroom discussions and group work.');
  const [interest, setInterest] = useState('ICT, Mathematics, and Creative Arts.');
  const [teacherRemarks, setTeacherRemarks] = useState('A conscientious pupil with remarkable academic progress. Promoted.');
  const [headTeacherRemarks, setHeadTeacherRemarks] = useState('Excellent performance. Keep up the high standard.');
  const [nextTermDate, setNextTermDate] = useState('2026-01-12');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const supabase = getSupabase();

  // Check authorization: Admin, Class Teacher, or Parent (view-only)
  const isAdminOrTeacher = profile?.role === 'admin' || profile?.role === 'teacher';
  const isParent = profile?.role === 'parent';
  const isAuthorized = isAdminOrTeacher || isParent;

  // 1. Fetch Classes (restricted to primary class for teachers)
  useEffect(() => {
    if (!school) return;
    async function loadClasses() {
      if (isParent) {
        // For parents, we don't need classes - we'll load wards directly
        setClasses([]);
        setLoading(false);
        return;
      }

      let query = supabase.from('classes').select('*').eq('school_id', school.id).order('order_index');

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
      }
    }
    loadClasses();
  }, [school, profile, supabase, isParent]);

  // 2. Fetch Students for Selected Class (Admin/Teacher) OR Wards (Parent)
  useEffect(() => {
    if (!school) return;
    
    if (isParent) {
      // For parents, load only their linked wards
      async function loadWards() {
        const { data: rels, error } = await supabase
          .from('parent_students')
          .select('student:students(*, current_class:classes(*))')
          .eq('parent_id', profile.id);

        if (error) {
          console.error('Error fetching wards:', error);
          setStudents([]);
          setSelectedStudentId('');
          return;
        }

        const list = (rels || []).map((r: any) => r.student).filter(Boolean);
        if (list.length > 0) {
          setStudents(list as Student[]);
          setSelectedStudentId(list[0].id);
        } else {
          setStudents([]);
          setSelectedStudentId('');
        }
      }
      loadWards();
    } else if (selectedClassId) {
      // For admin/teacher, load students from selected class
      async function loadStudents() {
        const { data } = await supabase
          .from('students')
          .select('*')
          .eq('school_id', school.id)
          .eq('current_class_id', selectedClassId)
          .eq('status', 'active')
          .order('last_name');

        if (data && data.length > 0) {
          setStudents(data as Student[]);
          setSelectedStudentId(data[0].id);
        } else {
          setStudents([]);
          setSelectedStudentId('');
        }
      }
      loadStudents();
    }
  }, [school, selectedClassId, supabase, profile.id, isParent]);

  // 3. Fetch Student's Results, Attendance, and Saved Terminal Report
  const fetchStudentReportData = useCallback(async () => {
    if (!school || !selectedStudentId) return;
    try {
      setLoading(true);
      setSavedSuccess(false);

      // Subject results
      const { data: resultsData } = await supabase
        .from('student_results')
        .select('*, subject:subjects(*)')
        .eq('school_id', school.id)
        .eq('student_id', selectedStudentId)
        .eq('academic_year', academicYear)
        .eq('term', term);

      setResults((resultsData || []) as any);

      // Attendance
      const { data: attData } = await supabase
        .from('attendance')
        .select('status')
        .eq('school_id', school.id)
        .eq('student_id', selectedStudentId);

      const totalDays = attData?.length || 65;
      const presentDays = attData?.filter((a: any) => a.status === 'present').length || 0;
      setAttendanceCount({ present: presentDays, total: totalDays });

      // Calculate this student's average
      const currentAvg = (resultsData || []).reduce((s: number, r: any) => s + Number(r.total_score || 0), 0);
      const currentCount = (resultsData || []).length || 1;
      const studentAvg = currentAvg / currentCount;

      // Fetch all students' results in this class to compute position
      const { data: classStudents } = await supabase
        .from('students')
        .select('id')
        .eq('school_id', school.id)
        .eq('current_class_id', selectedClassId)
        .eq('status', 'active');

      if (classStudents && classStudents.length > 0) {
        const studentIds = classStudents.map((s) => s.id);
        const { data: allResults } = await supabase
          .from('student_results')
          .select('student_id, total_score')
          .eq('school_id', school.id)
          .eq('class_id', selectedClassId)
          .eq('academic_year', academicYear)
          .eq('term', term)
          .in('student_id', studentIds);

        if (allResults && allResults.length > 0) {
          // Group by student and compute average
          const avgMap: Record<string, { total: number; count: number }> = {};
          (allResults as any[]).forEach((r) => {
            if (!avgMap[r.student_id]) avgMap[r.student_id] = { total: 0, count: 0 };
            avgMap[r.student_id].total += Number(r.total_score || 0);
            avgMap[r.student_id].count += 1;
          });

          // Compute averages and sort descending
          const avgs = Object.entries(avgMap).map(([sid, v]) => ({
            studentId: sid,
            avg: v.count > 0 ? v.total / v.count : 0
          }));
          avgs.sort((a, b) => b.avg - a.avg);

          // Find this student's rank
          const rank = avgs.findIndex((a) => a.studentId === selectedStudentId) + 1;
          const totalStudents = classStudents.length;

          // Ordinal suffix
          const ordinal = (n: number) => {
            const s = ['th', 'st', 'nd', 'rd'];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
          };

          setClassPosition(`${ordinal(rank)} of ${totalStudents}`);
        }
      }

      // Existing terminal report if saved
      let { data: reportData } = await supabase
        .from('terminal_reports')
        .select('*')
        .eq('school_id', school.id)
        .eq('student_id', selectedStudentId)
        .eq('academic_year', academicYear)
        .eq('term', term)
        .maybeSingle();

      // For parents, only show approved reports
      if (isParent && reportData && !reportData.is_approved) {
        reportData = null;
      }

      if (reportData) {
        if (reportData.conduct) setConduct(reportData.conduct);
        if (reportData.attitude) setAttitude(reportData.attitude);
        if (reportData.interest) setInterest(reportData.interest);
        if (reportData.class_teacher_remarks) setTeacherRemarks(reportData.class_teacher_remarks);
        if (reportData.head_teacher_remarks) setHeadTeacherRemarks(reportData.head_teacher_remarks);
        if (reportData.next_term_begins) setNextTermDate(reportData.next_term_begins);
        if (reportData.position) setClassPosition(reportData.position);
      }
    } catch (e) {
      console.error('Error fetching report data:', e);
    } finally {
      setLoading(false);
    }
  }, [school, selectedStudentId, academicYear, term, supabase]);

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentReportData();
    }
  }, [selectedStudentId, academicYear, term, fetchStudentReportData]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const currentClass = classes.find((c) => c.id === selectedClassId);

  // Calculations
  const totalMarks = results.reduce((sum, r) => sum + Number(r.total_score || 0), 0);
  const averageScore = results.length > 0 ? (totalMarks / results.length).toFixed(1) : '0';

  const handleSaveReport = async () => {
    if (!school || !selectedStudentId || !selectedClassId || !profile) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      const { error } = await supabase.from('terminal_reports').upsert({
        school_id: school.id,
        student_id: selectedStudentId,
        class_id: selectedClassId,
        academic_year: academicYear,
        term: term,
        total_score: totalMarks,
        average_score: Number(averageScore),
        position: classPosition,
        attendance_present: attendanceCount.present,
        attendance_total: attendanceCount.total,
        conduct,
        attitude,
        interest,
        class_teacher_remarks: teacherRemarks,
        head_teacher_remarks: headTeacherRemarks,
        next_term_begins: nextTermDate,
        is_approved: true,
        approved_by: profile.id
      }, {
        onConflict: 'school_id,student_id,academic_year,term'
      });

      if (error) {
        alert(`Failed to save report: ${error.message}`);
      } else {
        setSavedSuccess(true);
        
        // Send notifications to all parents of this student
        if (selectedStudentId && school) {
          await sendReportApprovedNotifications(selectedStudentId, school.id);
        }
        
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e: any) {
      alert(`Error saving report: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Send notifications to all parents linked to this student
  const sendReportApprovedNotifications = async (studentId: string, schoolId: string) => {
    try {
      // Fetch all parents linked to this student
      const { data: parentLinks, error: parentError } = await supabase
        .from('parent_students')
        .select('parent_id')
        .eq('student_id', studentId);

      if (parentError) {
        console.error('Error fetching parent links:', parentError);
        return;
      }

      const parentIds = (parentLinks || []).map((p: ParentStudent) => p.parent_id);

      if (parentIds.length === 0) {
        console.log('No parents linked to this student');
        return;
      }

      // Send notification to each parent
      const student = selectedStudent;
      const studentName = student ? `${student.first_name} ${student.last_name}` : 'Your child';

      for (const parentId of parentIds) {
        const success = await sendNotification({
          userId: parentId,
          schoolId: schoolId,
          type: 'report_card',
          title: 'Terminal Report Card Approved',
          message: `${studentName}'s terminal report card for ${academicYear} ${term} has been approved and is now available for viewing.`,
          relatedRecordId: selectedStudentId
        });

        if (success) {
          console.log(`Notification sent to parent ${parentId}`);
        }
      }
    } catch (e) {
      console.error('Error sending report approval notifications:', e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Non-class teachers should not access this page
  if (isAdminOrTeacher && profile?.role === 'teacher' && classes.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800 dark:text-white">No Primary Class Assigned</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Only primary class teachers can generate terminal report cards. Please ask your school administrator to assign you as a class teacher for a specific class.
        </p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800 dark:text-white">Authorization Required</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Only authorized Class Teachers and School Administrators have permission to compile and approve official Ghanaian Terminal Report Cards.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Non-Printable Header & Selection Controls */}
      <div className="print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isParent ? 'My Child\'s Report Card' : 'Ghanaian Terminal Report Card'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isParent 
                ? 'View your child\'s approved terminal report card'
                : 'Official A4 printable report card with Stanine scoring and conduct assessment'
              }
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isParent && results.length > 0 && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Approved Report
              </span>
            )}
            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Bell className="w-4 h-4" /> Report Card Approved! Parents have been notified.
              </span>
            )}
            {!isParent && (
              <>
                <button
                  onClick={handleSaveReport}
                  disabled={saving || !selectedStudentId}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save & Approve'}
                </button>
              </>
            )}
            <button
              onClick={handlePrint}
              disabled={!selectedStudentId}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print A4 Report
            </button>
          </div>
        </div>

        {/* Parent View: Show wards selector instead of class selector */}
        {isParent ? (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              My Children (Wards)
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name} ({s.current_class?.name || 'Class'}) - {s.student_id_number || 'No ID'}
                </option>
              ))}
            </select>
            {students.length === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                No children linked to your account. Please contact the school administrator.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            {/* Class selector - admin only; teachers see their assigned class as read-only */}
            {profile?.role !== 'teacher' ? (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Class
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.stage})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
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
                Student / Pupil
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name} ({s.student_id_number || 'No ID'})
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
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Term
              </label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
            </div>
          </div>
        )}
      </div>        {/* A4 REPORT CARD DOCUMENT */}
      {!selectedStudent ? (
        <EmptyState
          icon={isParent ? UserCheck : FileSpreadsheet}
          title={isParent ? "No ward selected" : "No student selected"}
          description={
            isParent 
              ? "Select your child from the dropdown above to view their approved terminal report card."
              : "Select a class and student from the dropdown above to preview and generate the terminal report card."
          }
        />
      ) : (!isParent && results.length === 0 && !loading) ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="No results recorded"
          description="No subject results have been recorded for this student yet. Please enter marks in Academic Results first."
        />
      ) : (isParent && results.length > 0 && !loading && !conduct && !teacherRemarks) ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Report Not Yet Approved</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            The terminal report card for {selectedStudent.first_name} {selectedStudent.last_name} has not been approved by the class teacher or school administrator yet. Please check back later.
          </p>
        </div>
      ) : (
        <div
          id="printable-report-card"
          className="relative mx-auto w-full max-w-[800px] bg-white text-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 print:border-none print:shadow-none print:p-0 print:pt-[10mm] print:px-[12mm] print:pb-[20mm] print:m-0 print:max-w-none text-xs font-serif overflow-hidden"
        >
          {/* School Logo Watermark */}
          {school?.logo_url && (
            <img
              src={school.logo_url}
              alt=""
              aria-hidden="true"
              className="report-watermark"
            />
          )}

          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4 text-center relative z-10">
            <div className="flex items-center justify-center gap-4 mb-2">
              {school?.logo_url ? (
                <img
                  src={school.logo_url}
                  alt={school.name}
                  className="w-16 h-16 object-contain border border-slate-300 rounded-lg p-1"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-orange-600 text-white font-bold flex items-center justify-center text-xl">
                  {school?.name?.charAt(0) || 'G'}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">
                  {school?.name || 'GHANAIAN PRIVATE SCHOOL'}
                </h1>
                {school?.motto && (
                  <p className="text-[11px] italic text-slate-600">&ldquo;{school.motto}&rdquo;</p>
                )}
                <p className="text-[10px] text-slate-600 mt-0.5">
                  {school?.address}, {school?.district} • {school?.region} Region, Ghana
                </p>
                <p className="text-[10px] text-slate-600">
                  Tel: {school?.phone} • Email: {school?.email}
                </p>
              </div>
            </div>

            <div className="mt-2 py-1 px-4 bg-slate-100 rounded-md inline-block border border-slate-300">
              <span className="font-bold tracking-wider text-xs uppercase">
                STUDENT&apos;S TERMINAL CONTINUOUS ASSESSMENT & REPORT CARD
              </span>
            </div>
          </div>

          {/* Student & Term Info Grid */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 border border-slate-300 rounded-lg mb-4 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Pupil&apos;s Name:</span>
              <span className="font-bold">
                {selectedStudent.first_name} {selectedStudent.last_name} {selectedStudent.other_names || ''}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Student ID / Adm No:</span>
              <span className="font-mono font-bold">
                {selectedStudent.student_id_number || selectedStudent.admission_number}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Class / Form:</span>
              <span className="font-bold">{selectedStudent.current_class?.name || currentClass?.name || 'Class'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Academic Period:</span>
              <span className="font-bold">
                {academicYear} • {term}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Attendance:</span>
              <span className="font-bold">
                {attendanceCount.present} / {attendanceCount.total} Days Present
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Position in Class:</span>
              {isParent ? (
                <span className="font-bold">{classPosition || '-'}</span>
              ) : (
                <input
                  type="text"
                  value={classPosition}
                  onChange={(e) => setClassPosition(e.target.value)}
                  className="font-bold text-xs bg-transparent border-b border-dashed border-slate-400 focus:outline-hidden w-24"
                />
              )}
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Total Marks:</span>
              <span className="font-bold">{totalMarks}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Average Score:</span>
              <span className="font-bold">{averageScore}%</span>
            </div>
          </div>

          {/* Academic Performance Table */}
          <div className="relative z-10 mb-4 overflow-hidden border border-slate-300 rounded-lg">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-2.5 border-r border-slate-300">Subject</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">Class Score (30%)</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">Exam Score (70%)</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">Total (100%)</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">Grade</th>
                  <th className="py-2 px-2.5">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-400 italic">
                      No subject results recorded for this pupil in {academicYear} {term}. Please enter marks in &quot;Academic Results&quot;.
                    </td>
                  </tr>
                ) : (
                  results.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50">
                      <td className="py-1.5 px-2.5 font-semibold border-r border-slate-300">
                        {res.subject?.name || 'Subject'}
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono border-r border-slate-300">
                        {res.class_score ?? '-'}
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono border-r border-slate-300">
                        {res.exam_score ?? '-'}
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono font-bold border-r border-slate-300">
                        {res.total_score ?? '-'}
                      </td>
                      <td className="py-1.5 px-2 text-center font-bold border-r border-slate-300">
                        {res.grade || '-'}
                      </td>
                      <td className="py-1.5 px-2.5 text-slate-700">
                        {res.remark || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Ghanaian Stanine Grading Legend */}
          <div className="relative z-10 p-2 border border-slate-200 rounded-md mb-4 bg-slate-50 text-[9px] flex justify-between text-slate-600">
            <span><strong>Grade 1 (90-100%):</strong> Excellent</span>
            <span><strong>Grade 2 (80-89%):</strong> Very Good</span>
            <span><strong>Grade 3 (70-79%):</strong> Good</span>
            <span><strong>Grade 4-5 (55-69%):</strong> Credit</span>
            <span><strong>Grade 6-7 (45-54%):</strong> Pass</span>
            <span><strong>Grade 8 (40-44%):</strong> Weak Pass</span>
            <span><strong>Grade 9 (0-39%):</strong> Needs Impr.</span>
          </div>

          {/* Conduct, Remarks, and Signatures */}
          <div className="relative z-10 space-y-2.5 border border-slate-300 p-3 rounded-lg mb-4 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-bold w-28 shrink-0">Conduct:</span>
              {isParent ? (
                <span className="flex-1 text-slate-700">{conduct || '-'}</span>
              ) : (
                <input
                  type="text"
                  value={conduct}
                  onChange={(e) => setConduct(e.target.value)}
                  className="flex-1 border-b border-dashed border-slate-400 bg-transparent px-1 py-0.5 focus:outline-hidden"
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold w-28 shrink-0">Attitude:</span>
              {isParent ? (
                <span className="flex-1 text-slate-700">{attitude || '-'}</span>
              ) : (
                <input
                  type="text"
                  value={attitude}
                  onChange={(e) => setAttitude(e.target.value)}
                  className="flex-1 border-b border-dashed border-slate-400 bg-transparent px-1 py-0.5 focus:outline-hidden"
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold w-28 shrink-0">Interest:</span>
              {isParent ? (
                <span className="flex-1 text-slate-700">{interest || '-'}</span>
              ) : (
                <input
                  type="text"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="flex-1 border-b border-dashed border-slate-400 bg-transparent px-1 py-0.5 focus:outline-hidden"
                />
              )}
            </div>

            <div className="flex items-start gap-2 pt-1">
              <span className="font-bold w-28 shrink-0 mt-0.5">Class Teacher&apos;s Remarks:</span>
              {isParent ? (
                <span className="flex-1 text-slate-700">{teacherRemarks || '-'}</span>
              ) : (
                <textarea
                  rows={2}
                  value={teacherRemarks}
                  onChange={(e) => setTeacherRemarks(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-md p-1.5 text-[11px] bg-transparent focus:outline-hidden"
                />
              )}
            </div>

            <div className="flex items-start gap-2 pt-1">
              <span className="font-bold w-28 shrink-0 mt-0.5">Head Teacher&apos;s Remarks:</span>
              {isParent ? (
                <span className="flex-1 text-slate-700">{headTeacherRemarks || '-'}</span>
              ) : (
                <textarea
                  rows={2}
                  value={headTeacherRemarks}
                  onChange={(e) => setHeadTeacherRemarks(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-md p-1.5 text-[11px] bg-transparent focus:outline-hidden"
                />
              )}
            </div>
          </div>

          {/* Footer Dates & Signatures */}
          <div className="relative z-10 pt-2 grid grid-cols-3 gap-6 text-[10px] text-center border-t border-slate-300">
            <div>
              <p className="font-bold mb-8">Next Term Begins</p>
              {isParent ? (
                <span className="font-bold text-red-600">{nextTermDate}</span>
              ) : (
                <>
                  <input
                    type="date"
                    value={nextTermDate}
                    onChange={(e) => setNextTermDate(e.target.value)}
                    className="font-bold text-center border-b border-dashed border-slate-400 bg-transparent print:hidden"
                  />
                  <span className="hidden print:inline font-bold text-red-600">{nextTermDate}</span>
                </>
              )}
            </div>
            <div>
              <p className="font-bold mb-8">Class Teacher&apos;s Signature</p>
              <div className="border-b border-slate-400 w-32 mx-auto" />
            </div>
            <div>
              <p className="font-bold mb-8">Head Teacher&apos;s Stamp & Signature</p>
              <div className="border-b border-slate-400 w-32 mx-auto" />
            </div>
          </div>

          {/* Print Footer - SamleyEduSuite */}
          <div className="print-footer hidden print:block">
            SamleyEduSuite Ghana &mdash; School Management System
          </div>
        </div>
      )}
    </div>
  );
};
