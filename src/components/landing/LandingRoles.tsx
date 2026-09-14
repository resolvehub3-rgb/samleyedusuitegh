import React from 'react';
import { Shield, BookOpen, Heart, Check } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

const roles = [
  {
    icon: Shield,
    title: 'School Admin',
    accent: 'orange',
    tagline: 'Full Control',
    description: 'Manage the entire school from one dashboard.',
    features: [
      'Students, Teachers & Parents',
      'Classes & Subjects',
      'Attendance Monitoring',
      'Academic Results',
      'Terminal Reports',
      'Transfers & Promotions',
      'Announcements & Payments',
      'School Settings',
    ],
  },
  {
    icon: BookOpen,
    title: 'Teachers',
    accent: 'blue',
    tagline: 'Classroom Tools',
    description: 'Manage assigned classes, attendance, academic results and terminal reports.',
    features: [
      'Class Attendance Recording',
      'Academic Results Entry',
      'Terminal Report Generation',
      'Class Information',
      'School Announcements',
      'Notifications',
    ],
  },
  {
    tagline: 'Stay Connected',
    icon: Heart,
    title: 'Parents',
    accent: 'green',
    description: "Monitor wards' attendance, performance, reports and make payments.",
    features: [
      'Ward Progress Monitoring',
      'Attendance History',
      'Academic Performance',
      'Terminal Reports',
      'School Announcements',
      'School Payments',
      'Teacher Reviews',
    ],
  },
] as const;

const accentStyles: Record<
  string,
  { iconBg: string; iconShadow: string; chip: string; check: string; hoverShadow: string; hoverRing: string; topBar: string }
> = {
  orange: {
    iconBg: 'bg-gradient-to-br from-orange-500 to-amber-500',
    iconShadow: 'shadow-orange-500/30',
    chip: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-200/60 dark:border-orange-800/30',
    check: 'text-orange-500',
    hoverShadow: 'hover:shadow-orange-500/15',
    hoverRing: 'hover:ring-orange-200 dark:hover:ring-orange-500/30',
    topBar: 'from-orange-500 via-amber-400 to-orange-400',
  },
  blue: {
    iconBg: 'bg-gradient-to-br from-blue-500 to-sky-500',
    iconShadow: 'shadow-blue-500/30',
    chip: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/30',
    check: 'text-blue-500',
    hoverShadow: 'hover:shadow-blue-500/15',
    hoverRing: 'hover:ring-blue-200 dark:hover:ring-blue-500/30',
    topBar: 'from-blue-500 via-sky-400 to-blue-400',
  },
  green: {
    iconBg: 'bg-gradient-to-br from-emerald-500 to-green-500',
    iconShadow: 'shadow-emerald-500/30',
    chip: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/30',
    check: 'text-emerald-500',
    hoverShadow: 'hover:shadow-emerald-500/15',
    hoverRing: 'hover:ring-emerald-200 dark:hover:ring-emerald-500/30',
    topBar: 'from-emerald-500 via-green-400 to-emerald-400',
  },
};

export function LandingRoles() {
  return (
    <SectionWrapper id="roles" className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block text-sm font-bold text-orange-500 uppercase tracking-wider mb-3">
            For Everyone
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Designed for Every Role
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Each user gets a tailored experience based on their role in the school.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {roles.map(({ icon: Icon, title, accent, tagline, description, features }, i) => {
            const styles = accentStyles[accent];
            return (
              <div
                key={i}
                className={`group relative flex flex-col bg-white dark:bg-slate-800/70 rounded-3xl border border-slate-100 dark:border-slate-700/50 ring-1 ring-transparent ${styles.hoverRing} hover:shadow-2xl ${styles.hoverShadow} hover:-translate-y-1.5 transition-all duration-300 overflow-hidden`}
              >
                {/* Accent top bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${styles.topBar} opacity-80 group-hover:opacity-100 transition-opacity`} />

                {/* Corner glow */}
                <div
                  className={`absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br ${styles.iconBg} rounded-full opacity-0 blur-3xl group-hover:opacity-15 transition-opacity duration-500 pointer-events-none`}
                />

                <div className="relative p-8 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-5">
                    {/* Gradient icon badge */}
                    <div
                      className={`w-14 h-14 rounded-2xl ${styles.iconBg} flex items-center justify-center shadow-lg ${styles.iconShadow} group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className={`px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${styles.chip}`}>
                      {tagline}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{description}</p>

                  <ul className="space-y-2.5 mb-2">
                    {features.map((feature, j) => (
                      <li
                        key={j}
                        className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300"
                      >
                        <span className={`w-4.5 h-4.5 rounded-full bg-current/10 flex items-center justify-center shrink-0 ${styles.check}`}>
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-slate-400 dark:text-slate-500">
          Note: SamleyEduSuite does not provide a student login portal.
        </p>
      </div>
    </SectionWrapper>
  );
}
