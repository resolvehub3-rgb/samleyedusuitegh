import React, { useEffect, useState, useCallback } from 'react';
import { 
  Users, 
  CalendarCheck, 
  Award, 
  FileSpreadsheet, 
  Megaphone, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { SchoolClass, Student } from '../../types/database';

interface TeacherDashboardProps {
  onNavigate: (view: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const { school, profile, schoolSettings } = useAuth();
  const [assignedClass, setAssignedClass] = useState<SchoolClass | null>(null);
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [todayAttendanceCount, setTodayAttendanceCount] = useState({ present: 0, total: 0 });
  const [recentMarks, setRecentMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = getSupabase();
  const today = new Date().toISOString().split('T')[0];

  const fetchTeacherData = useCallback(async () => {
    if (!school || !profile) return;
    try {
      setLoading(true);

      // Find class where profile is class_teacher_id OR in class_teacher_assignments
      let { data: myClass } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', school.id)
        .eq('class_teacher_id', profile.id)
        .maybeSingle();

      if (!myClass) {
        // Check assignments table
        const { data: assign } = await supabase
          .from('class_teacher_assignments')
          .select('class:classes(*)')
          .eq('teacher_id', profile.id)
          .maybeSingle();

        if (assign?.class) {
          myClass = assign.class as any;
        }
      }

      if (myClass) {
        setAssignedClass(myClass as SchoolClass);

        // Check if teacher is the primary class teacher
        setIsClassTeacher(myClass.class_teacher_id === profile.id);

        // Fetch students in this class
        const { data: students } = await supabase
          .from('students')
          .select('id')
          .eq('school_id', school.id)
          .eq('current_class_id', myClass.id)
          .eq('status', 'active');

        const totalStds = students?.length || 0;
        setStudentCount(totalStds);

        // Fetch today's attendance
        const { data: att } = await supabase
          .from('attendance')
          .select('status')
          .eq('school_id', school.id)
          .eq('class_id', myClass.id)
          .eq('date', today);

        const present = (att || []).filter((a) => a.status === 'present').length;
        setTodayAttendanceCount({ present, total: att?.length || 0 });

        // Recent marks entered by this teacher
        const { data: results } = await supabase
          .from('student_results')
          .select('*, student:students(*), subject:subjects(*)')
          .eq('school_id', school.id)
          .eq('class_id', myClass.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentMarks(results || []);
      }
    } catch (e) {
      console.error('Error fetching teacher data:', e);
    } finally {
      setLoading(false);
    }
  }, [school, profile, today, supabase]);

  useEffect(() => {
    fetchTeacherData();
  }, [fetchTeacherData]);

  const attRate =
    todayAttendanceCount.total > 0
      ? `${Math.round((todayAttendanceCount.present / todayAttendanceCount.total) * 100)}%`
      : 'Not Marked';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Teacher Workspace: {profile?.full_name}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Assigned Class:{' '}
            <span className="font-semibold text-orange-600 dark:text-orange-400">
              {assignedClass ? `${assignedClass.name} (${assignedClass.stage})` : 'No Class Assigned'}
            </span>{' '}
            • {schoolSettings?.active_academic_year} {schoolSettings?.active_term}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isClassTeacher && (
            <button
              onClick={() => onNavigate('attendance')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <CalendarCheck className="w-4 h-4" />
              Mark Today&apos;s Roll
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Class"
          value={assignedClass?.name || 'Pending'}
          subtitle={assignedClass ? `Curriculum: ${assignedClass.stage}` : 'Contact admin to assign'}
          icon={BookOpen}
        />
        <StatCard
          title="Class Enrolment"
          value={studentCount}
          subtitle="Registered pupils"
          icon={Users}
        />
        <StatCard
          title="Today's Attendance"
          value={attRate}
          subtitle={`${todayAttendanceCount.present} of ${studentCount} present today`}
          icon={CalendarCheck}
        />
        <StatCard
          title="Terminal Reports"
          value="A4 Ready"
          subtitle="Continuous assessment ready"
          icon={FileSpreadsheet}
        />
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isClassTeacher && (
          <div
            onClick={() => onNavigate('attendance')}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-orange-500/50 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Roll Register
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mark pupil attendance (Present, Absent, Late, Excused) with automatic instant parent notification.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 mt-4">
              Open Register <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        )}

        <div
          onClick={() => onNavigate('academic-results')}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-orange-500/50 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Enter Academic Scores
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Input class continuous assessments (30%) and end-of-term examination scores (70%).
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 mt-4">
            Enter Marks <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => onNavigate('terminal-reports')}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-orange-500/50 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Approve Report Cards
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Add teacher conduct remarks, position, attitude, and generate print-ready Ghanaian A4 report cards.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-4">
            Compile Reports <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Recent Marks Roster */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Recently Recorded Assessment Scores
        </h3>

        {recentMarks.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            No marks recorded yet for this academic term. Click &quot;Enter Academic Scores&quot; above to record marks.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentMarks.map((rm) => (
              <div key={rm.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {rm.student?.first_name} {rm.student?.last_name}
                  </span>
                  <span className="text-slate-400 ml-2">
                    ({rm.subject?.name || 'Subject'})
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-slate-600 dark:text-slate-300">
                    Total: {rm.total_score}%
                  </span>
                  <Badge variant="primary" size="sm">
                    Grade {rm.grade}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
