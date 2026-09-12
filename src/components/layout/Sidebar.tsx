import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  Layers,
  CalendarCheck,
  Award,
  FileSpreadsheet,
  ArrowRightLeft,
  CreditCard,
  Megaphone,
  Star,
  MessageSquareQuote,
  Settings,
  X,
  User,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSupabase } from '../../lib/supabase';

export type AdminView = 
  | 'dashboard' 
  | 'teachers' 
  | 'students' 
  | 'parents' 
  | 'classes' 
  | 'subjects' 
  | 'attendance' 
  | 'results' 
  | 'reports' 
  | 'promotions' 
  | 'payments' 
  | 'announcements' 
  | 'reviews' 
  | 'feedback' 
  | 'settings';

export type TeacherView = 
  | 'dashboard' 
  | 'classes' 
  | 'attendance' 
  | 'results' 
  | 'reports' 
  | 'reviews' 
  | 'announcements';

export type ParentView = 
  | 'dashboard' 
  | 'wards' 
  | 'attendance' 
  | 'results' 
  | 'reports' 
  | 'teacher' 
  | 'payments' 
  | 'announcements' 
  | 'feedback';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpen,
  onClose
}) => {
  const { profile, school } = useAuth();
  const role = profile?.role || 'admin';
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const supabase = getSupabase();

  useEffect(() => {
    async function checkClassTeacher() {
      if (role !== 'teacher' || !profile) return;

      // Check if teacher is primary class teacher for any class
      const { data: classData } = await supabase
        .from('classes')
        .select('id')
        .eq('school_id', profile.school_id)
        .eq('class_teacher_id', profile.id)
        .limit(1);

      if (classData && classData.length > 0) {
        setIsClassTeacher(true);
        return;
      }

      // Also check class_teacher_assignments with is_class_teacher flag
      const { data: assignData } = await supabase
        .from('class_teacher_assignments')
        .select('id')
        .eq('teacher_id', profile.id)
        .eq('is_class_teacher', true)
        .limit(1);

      if (assignData && assignData.length > 0) {
        setIsClassTeacher(true);
      }
    }
    checkClassTeacher();
  }, [role, profile, supabase]);

  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'teachers', label: 'Teachers', icon: UserCheck },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'parents', label: 'Parents', icon: Users },
    { id: 'classes', label: 'Classes (KG-JHS)', icon: Layers },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'results', label: 'Academic Results', icon: Award },
    { id: 'reports', label: 'Terminal Reports', icon: FileSpreadsheet },
    { id: 'promotions', label: 'Promote / Transfer', icon: ArrowRightLeft },
    { id: 'payments', label: 'Fee Payments (GHS)', icon: CreditCard },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'reviews', label: 'Teacher Reviews', icon: Star },
    { id: 'feedback', label: 'Parent Feedback', icon: MessageSquareQuote },
    { id: 'settings', label: 'School Settings', icon: Settings },
  ];

  const teacherNav = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'classes', label: 'My Classes & Students', icon: Layers },
    // Only show Mark Attendance for class teachers
    ...(isClassTeacher ? [{ id: 'attendance', label: 'Mark Attendance', icon: CalendarCheck }] : []),
    { id: 'results', label: 'Enter Academic Marks', icon: Award },
    { id: 'reports', label: 'Generate Terminal Reports', icon: FileSpreadsheet },
    { id: 'reviews', label: 'Parent Reviews & Feedback', icon: Star },
    { id: 'announcements', label: 'School Announcements', icon: Megaphone },
  ];

  const parentNav = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'wards', label: 'My Wards', icon: GraduationCap },
    { id: 'attendance', label: 'Ward Attendance', icon: CalendarCheck },
    { id: 'reports', label: 'Terminal Report Cards', icon: FileSpreadsheet },
    { id: 'teacher', label: 'Class Teacher & Reviews', icon: UserCheck },
    { id: 'payments', label: 'Pay Fees (Mobile Money/Bank)', icon: CreditCard },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'feedback', label: 'Submit School Feedback', icon: MessageSquareQuote },
  ];

  const items = role === 'teacher' ? teacherNav : role === 'parent' ? parentNav : adminNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full py-4 overflow-y-auto">
          {/* Section title */}
          <div className="px-5 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              {role === 'admin' ? 'School Administration' : role === 'teacher' ? 'Teacher Workspace' : 'Parent Portal'}
            </span>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 px-3 space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-xs dark:bg-orange-600'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Portal Footer info */}
          <div className="px-4 pt-3 mt-auto border-t border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-500 dark:text-slate-400">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Ghana Private School SaaS</p>
              <p className="text-[10px] mt-0.5">Strict Multi-Tenant RLS & Realtime</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
