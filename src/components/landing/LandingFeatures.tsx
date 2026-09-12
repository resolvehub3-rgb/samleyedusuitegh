import React from 'react';
import {
  Users,
  GraduationCap,
  Heart,
  ClipboardCheck,
  BarChart3,
  FileText,
  CreditCard,
  Megaphone,
  Zap,
  ArrowRightLeft,
  Star,
} from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

const features = [
  {
    icon: Users,
    title: 'Student Management',
    description:
      'Manage student records, classes, transfers, promotions and academic history.',
  },
  {
    icon: GraduationCap,
    title: 'Teacher Management',
    description:
      'Manage teachers, class assignments and subject assignments.',
  },
  {
    icon: Heart,
    title: 'Parent Portal',
    description:
      "Parents can access their wards' progress, attendance, reports and school information.",
  },
  {
    icon: ClipboardCheck,
    title: 'Attendance',
    description:
      'Teachers can record attendance for authorized classes while administrators can monitor attendance.',
  },
  {
    icon: BarChart3,
    title: 'Academic Performance',
    description:
      'Manage student academic performance and results across subjects and terms.',
  },
  {
    icon: FileText,
    title: 'Terminal Report Cards',
    description:
      'Generate professional terminal report cards for students at the end of each term.',
  },
  {
    icon: CreditCard,
    title: 'School Payments',
    description:
      'Parents can make and monitor school payments through their portal.',
  },
  {
    icon: Megaphone,
    title: 'Announcements',
    description:
      'Send important school announcements to relevant users — all, parents, teachers or specific classes.',
  },
  {
    icon: Zap,
    title: 'Real-Time Notifications',
    description:
      'Keep parents, teachers and administrators updated in realtime.',
  },
  {
    icon: ArrowRightLeft,
    title: 'Student Promotion & Transfer',
    description:
      'Move students between classes while preserving their academic history.',
  },
  {
    icon: Star,
    title: 'Teacher Reviews',
    description:
      "Parents can review their ward's assigned class teacher and submit comments.",
  },
];

export function LandingFeatures() {
  return (
    <SectionWrapper id="features" className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block text-sm font-bold text-orange-500 uppercase tracking-wider mb-3">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Everything Your School Needs
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            A complete set of tools designed specifically for private schools in Ghana.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }, i) => (
            <div
              key={i}
              className="group p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:bg-orange-50 dark:hover:bg-orange-500/5 hover:border-orange-200 dark:hover:border-orange-500/20 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/15 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
