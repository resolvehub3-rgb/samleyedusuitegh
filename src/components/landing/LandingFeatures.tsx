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
    gradient: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50 dark:bg-blue-500/10',
    ring: 'group-hover:ring-blue-200 dark:group-hover:ring-blue-500/20',
  },
  {
    icon: GraduationCap,
    title: 'Teacher Management',
    description:
      'Manage teachers, class assignments and subject assignments.',
    gradient: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    ring: 'group-hover:ring-emerald-200 dark:group-hover:ring-emerald-500/20',
  },
  {
    icon: Heart,
    title: 'Parent Portal',
    description:
      "Parents can access their wards' progress, attendance, reports and school information.",
    gradient: 'from-rose-500 to-pink-600',
    lightBg: 'bg-rose-50 dark:bg-rose-500/10',
    ring: 'group-hover:ring-rose-200 dark:group-hover:ring-rose-500/20',
  },
  {
    icon: ClipboardCheck,
    title: 'Attendance',
    description:
      'Teachers can record attendance for authorized classes while administrators can monitor attendance.',
    gradient: 'from-amber-500 to-orange-600',
    lightBg: 'bg-amber-50 dark:bg-amber-500/10',
    ring: 'group-hover:ring-amber-200 dark:group-hover:ring-amber-500/20',
  },
  {
    icon: BarChart3,
    title: 'Academic Performance',
    description:
      'Manage student academic performance and results across subjects and terms.',
    gradient: 'from-violet-500 to-purple-600',
    lightBg: 'bg-violet-50 dark:bg-violet-500/10',
    ring: 'group-hover:ring-violet-200 dark:group-hover:ring-violet-500/20',
  },
  {
    icon: FileText,
    title: 'Terminal Report Cards',
    description:
      'Generate professional terminal report cards for students at the end of each term.',
    gradient: 'from-cyan-500 to-sky-600',
    lightBg: 'bg-cyan-50 dark:bg-cyan-500/10',
    ring: 'group-hover:ring-cyan-200 dark:group-hover:ring-cyan-500/20',
  },
  {
    icon: CreditCard,
    title: 'School Payments',
    description:
      'Parents can make and monitor school payments through their portal.',
    gradient: 'from-yellow-500 to-amber-600',
    lightBg: 'bg-yellow-50 dark:bg-yellow-500/10',
    ring: 'group-hover:ring-yellow-200 dark:group-hover:ring-yellow-500/20',
  },
  {
    icon: Megaphone,
    title: 'Announcements',
    description:
      'Send important school announcements to relevant users — all, parents, teachers or specific classes.',
    gradient: 'from-orange-500 to-red-500',
    lightBg: 'bg-orange-50 dark:bg-orange-500/10',
    ring: 'group-hover:ring-orange-200 dark:group-hover:ring-orange-500/20',
  },
  {
    icon: Zap,
    title: 'Real-Time Notifications',
    description:
      'Keep parents, teachers and administrators updated in realtime.',
    gradient: 'from-lime-500 to-green-600',
    lightBg: 'bg-lime-50 dark:bg-lime-500/10',
    ring: 'group-hover:ring-lime-200 dark:group-hover:ring-lime-500/20',
  },
  {
    icon: ArrowRightLeft,
    title: 'Student Promotion & Transfer',
    description:
      'Move students between classes while preserving their academic history.',
    gradient: 'from-sky-500 to-blue-600',
    lightBg: 'bg-sky-50 dark:bg-sky-500/10',
    ring: 'group-hover:ring-sky-200 dark:group-hover:ring-sky-500/20',
  },
  {
    icon: Star,
    title: 'Teacher Reviews',
    description:
      "Parents can review their ward's assigned class teacher and submit comments.",
    gradient: 'from-fuchsia-500 to-pink-600',
    lightBg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10',
    ring: 'group-hover:ring-fuchsia-200 dark:group-hover:ring-fuchsia-500/20',
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {features.map(({ icon: Icon, title, description, gradient, lightBg, ring }, i) => (
            <div
              key={i}
              className={`group relative p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800/60 ring-1 ring-transparent ${ring} hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300 cursor-default`}
            >
              {/* Gradient icon */}
              <div className={`w-12 h-12 ${lightBg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                {title}
              </h3>

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
