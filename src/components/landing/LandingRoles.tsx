import React from 'react';
import { Shield, BookOpen, Heart, ChevronRight } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

const roles = [
  {
    icon: Shield,
    title: 'School Admin',
    color: 'bg-orange-500',
    lightBg: 'bg-orange-50 dark:bg-orange-500/10',
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
    color: 'bg-blue-500',
    lightBg: 'bg-blue-50 dark:bg-blue-500/10',
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
    icon: Heart,
    title: 'Parents',
    color: 'bg-green-500',
    lightBg: 'bg-green-50 dark:bg-green-500/10',
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
];

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

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map(({ icon: Icon, title, color, lightBg, description, features }, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 transition-all duration-300"
            >
              <div className={`w-14 h-14 ${lightBg} rounded-2xl flex items-center justify-center mb-5`}>
                <Icon className={`w-7 h-7 ${color.replace('bg-', 'text-')}`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{description}</p>
              <ul className="space-y-2.5">
                {features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <ChevronRight className={`w-4 h-4 ${color.replace('bg-', 'text-')} shrink-0`} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-400 dark:text-slate-500">
          Note: SamleyEduSuite does not provide a student login portal.
        </p>
      </div>
    </SectionWrapper>
  );
}
