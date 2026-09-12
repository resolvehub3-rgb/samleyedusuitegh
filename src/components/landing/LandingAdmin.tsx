import React from 'react';
import {
  Users,
  GraduationCap,
  Heart,
  BookOpen,
  Layers,
  ClipboardCheck,
  BarChart3,
  FileText,
  ArrowRightLeft,
  Megaphone,
  CreditCard,
  Settings,
} from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

const adminCapabilities = [
  { icon: Users, label: 'Students' },
  { icon: GraduationCap, label: 'Teachers' },
  { icon: Heart, label: 'Parents' },
  { icon: BookOpen, label: 'Classes' },
  { icon: Layers, label: 'Subjects' },
  { icon: ClipboardCheck, label: 'Attendance' },
  { icon: BarChart3, label: 'Academic Results' },
  { icon: FileText, label: 'Reports' },
  { icon: ArrowRightLeft, label: 'Transfers/Promotions' },
  { icon: Megaphone, label: 'Announcements' },
  { icon: CreditCard, label: 'Payments' },
  { icon: Settings, label: 'School Settings' },
];

export function LandingAdmin() {
  return (
    <SectionWrapper
      id="for-schools"
      className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Visual Card */}
          <div className="order-2 lg:order-1 hidden lg:block">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-8 text-white shadow-2xl shadow-orange-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold">Admin Dashboard</div>
                  <div className="text-sm text-orange-100">Full School Control</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {adminCapabilities.slice(0, 8).map(({ icon: Icon, label }, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 bg-white/10 rounded-xl px-3 py-2.5"
                  >
                    <Icon className="w-4 h-4 text-white/80" />
                    <span className="text-xs font-semibold">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="inline-block text-sm font-bold text-orange-500 uppercase tracking-wider mb-3">
              School Administration
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Complete Control Over Your School
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              The School Admin dashboard gives administrators everything they need to manage
              their school efficiently — from student records to financial tracking.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {adminCapabilities.map(({ icon: Icon, label }, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-500/30 transition-colors"
                >
                  <Icon className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
