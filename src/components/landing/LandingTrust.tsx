import React from 'react';
import {
  Cloud,
  Shield,
  Smartphone,
  Zap,
  MessageSquare,
  LayoutDashboard,
} from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

const trustItems = [
  {
    icon: Cloud,
    title: 'Cloud-Based',
    description: 'Access your school from anywhere, anytime. No software installation required.',
  },
  {
    icon: Zap,
    title: 'Real-Time Updates',
    description: 'Important school activities update instantly without refreshing the page.',
  },
  {
    icon: Shield,
    title: 'Secure Access',
    description: 'Role-based access ensures each user sees only what they are authorized to view.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-Friendly',
    description: 'Works beautifully on phones, tablets and desktop computers.',
  },
  {
    icon: MessageSquare,
    title: 'Parent Communication',
    description: 'Keep parents informed through announcements, notifications and their portal.',
  },
  {
    icon: LayoutDashboard,
    title: 'Digital Administration',
    description: 'Manage your entire school operations from one connected dashboard.',
  },
];

export function LandingTrust() {
  return (
    <SectionWrapper
      id="trust"
      className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Built for Modern Private Schools
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Everything you need to run your school efficiently, all in one place.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustItems.map(({ icon: Icon, title, description }, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
            >
              <div className="w-11 h-11 bg-orange-50 dark:bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
