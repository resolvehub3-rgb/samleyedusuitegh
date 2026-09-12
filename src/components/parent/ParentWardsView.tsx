import React, { useEffect, useState, useCallback } from 'react';
import {
  GraduationCap, CalendarCheck, Award, CreditCard, Phone, Mail,
  BookOpen, ChevronRight, Users, FileSpreadsheet
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Student, SchoolClass, AttendanceRecord, StudentResult } from '../../types/database';
import { Badge } from '../common/Badge';
import { StatCard } from '../common/StatCard';
import { EmptyState } from '../common/EmptyState';
import { SkeletonTable } from '../common/SkeletonLoader';

interface ParentWardsViewProps {
  onNavigate: (view: string) => void;
}

interface WardDetail {
  student: Student & { current_class?: SchoolClass };
  attendance: { present: number; total: number; rate: string };
  results: { subject: string; score: number; grade: string }[];
  averageScore: number;
}

export const ParentWardsView: React.FC<ParentWardsViewProps> = ({ onNavigate }) => {
  const { school, profile, schoolSettings } = useAuth();
  const [wards, setWards] = useState<WardDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);
  const supabase = getSupabase();

  const fetchWards = useCallback(async () => {
    if (!school || !profile) return;
    try {
      setLoading(true);

      // 1. Get linked students
      const { data: rels } = await supabase
        .from('parent_students')
        .select('student:students(*, current_class:classes(*))')
        .eq('parent_id', profile.id);

      const studentList = (rels || []).map((r: any) => r.student).filter(Boolean) as (Student & { current_class?: SchoolClass })[];

      if (studentList.length === 0) {
        setWards([]);
        setLoading(false);
        return;
      }

      // 2. Fetch attendance + results for each ward
      const wardDetails: WardDetail[] = await Promise.all(
        studentList.map(async (student) => {
          // Attendance
          const { data: attData } = await supabase
            .from('attendance')
            .select('status')
            .eq('school_id', school.id)
            .eq('student_id', student.id);

          const totalDays = attData?.length || 0;
          const presentDays = (attData || []).filter((a: any) => a.status === 'present').length;
          const rate = totalDays > 0 ? `${Math.round((presentDays / totalDays) * 100)}%` : 'N/A';

          // Results for current term
          const { data: resultsData } = await supabase
            .from('student_results')
            .select('total_score, grade, subject:subjects(name)')
            .eq('school_id', school.id)
            .eq('student_id', student.id)
            .eq('academic_year', schoolSettings?.active_academic_year || '2025/2026')
            .eq('term', schoolSettings?.active_term || 'Term 1');

          const results = (resultsData || []).map((r: any) => ({
            subject: r.subject?.name || 'Subject',
            score: Number(r.total_score || 0),
            grade: r.grade || '-',
          }));

          const avgScore = results.length > 0
            ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
            : 0;

          return {
            student,
            attendance: { present: presentDays, total: totalDays, rate },
            results,
            averageScore: avgScore,
          };
        })
      );

      setWards(wardDetails);
      if (wardDetails.length > 0 && !selectedWardId) {
        setSelectedWardId(wardDetails[0].student.id);
      }
    } catch (e) {
      console.error('Error fetching wards:', e);
    } finally {
      setLoading(false);
    }
  }, [school, profile, schoolSettings, supabase, selectedWardId]);

  useEffect(() => {
    fetchWards();
  }, [fetchWards]);

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonTable rows={3} />
      </div>
    );
  }

  if (wards.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No wards linked"
        description="Please contact your school administrator to link your parent profile to your enrolled children."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          My Wards
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          View your children&apos;s attendance, academic performance, and class details
        </p>
      </div>

      {/* Ward Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wards.map((ward) => {
          const isSelected = selectedWardId === ward.student.id;
          return (
            <div
              key={ward.student.id}
              onClick={() => setSelectedWardId(ward.student.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-orange-50/60 dark:bg-orange-950/20 border-orange-300 dark:border-orange-700 shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-orange-300/50 dark:hover:border-orange-700/50 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-bold flex items-center justify-center text-sm">
                  {ward.student.first_name.charAt(0)}{ward.student.last_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {ward.student.first_name} {ward.student.last_name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {ward.student.current_class?.name || 'No class'} • {ward.student.current_class?.stage || ''}
                  </p>
                </div>
                <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-orange-500' : 'text-slate-400'}`} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Attendance</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{ward.attendance.rate}</p>
                  <p className="text-[10px] text-slate-400">{ward.attendance.present}/{ward.attendance.total} days</p>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Average</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{ward.averageScore}%</p>
                  <p className="text-[10px] text-slate-400">{ward.results.length} subjects</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Ward Details */}
      {selectedWardId && (() => {
        const ward = wards.find(w => w.student.id === selectedWardId);
        if (!ward) return null;

        return (
          <div className="space-y-4">
            {/* Student Info */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Student Information</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Full Name</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    {ward.student.first_name} {ward.student.last_name} {ward.student.other_names || ''}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Admission No</p>
                  <p className="text-xs font-mono font-semibold text-slate-900 dark:text-white">
                    {ward.student.admission_number}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Class</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    {ward.student.current_class?.name || 'N/A'} ({ward.student.current_class?.stage || ''})
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Gender</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{ward.student.gender}</p>
                </div>
                {ward.student.guardian_name && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Guardian</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{ward.student.guardian_name}</p>
                  </div>
                )}
                {ward.student.guardian_phone && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Guardian Phone</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{ward.student.guardian_phone}</p>
                  </div>
                )}
                {ward.student.date_of_birth && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Date of Birth</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      {new Date(ward.student.date_of_birth).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Status</p>
                  <Badge variant={ward.student.status === 'active' ? 'success' : 'neutral'} size="sm">
                    {ward.student.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Attendance Summary</h3>
                <button
                  onClick={() => onNavigate('attendance')}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  View Full Attendance
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-center">
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{ward.attendance.present}</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Present</p>
                </div>
                <div className="p-3 bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{ward.attendance.total - ward.attendance.present}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Absent/Late</p>
                </div>
                <div className="p-3 bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 rounded-xl text-center">
                  <p className="text-lg font-bold text-orange-700 dark:text-orange-300">{ward.attendance.rate}</p>
                  <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase">Rate</p>
                </div>
              </div>
            </div>

            {/* Academic Performance */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Academic Performance — {schoolSettings?.active_academic_year} {schoolSettings?.active_term}
                </h3>
                <button
                  onClick={() => onNavigate('terminal-reports')}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  View Report Card
                </button>
              </div>
              {ward.results.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  No results recorded for this term yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                      <tr>
                        <th className="py-2 px-3">Subject</th>
                        <th className="py-2 px-3 text-center">Score</th>
                        <th className="py-2 px-3 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {ward.results.map((r, i) => (
                        <tr key={i}>
                          <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{r.subject}</td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-slate-900 dark:text-white">{r.score}%</td>
                          <td className="py-2 px-3 text-center">
                            <Badge
                              variant={
                                Number(r.grade) <= 3 ? 'success' :
                                Number(r.grade) <= 6 ? 'primary' : 'danger'
                              }
                              size="sm"
                            >
                              Grade {r.grade}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {ward.results.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
                  <span className="text-xs text-slate-500">Average: </span>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{ward.averageScore}%</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => onNavigate('attendance')}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-orange-500/50 transition-all cursor-pointer text-left"
              >
                <CalendarCheck className="w-5 h-5 text-orange-600 mb-2" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">Attendance</p>
                <p className="text-[11px] text-slate-500">View daily attendance records</p>
              </button>
              <button
                onClick={() => onNavigate('terminal-reports')}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-orange-500/50 transition-all cursor-pointer text-left"
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 mb-2" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">Report Card</p>
                <p className="text-[11px] text-slate-500">Download terminal report card</p>
              </button>
              <button
                onClick={() => onNavigate('payments')}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-orange-500/50 transition-all cursor-pointer text-left"
              >
                <CreditCard className="w-5 h-5 text-blue-600 mb-2" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">Pay Fees</p>
                <p className="text-[11px] text-slate-500">Pay school fees via Mobile Money</p>
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
