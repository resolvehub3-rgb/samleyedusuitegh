import React from 'react';
import {
  Cloud,
  Shield,
  Smartphone,
  Zap,
  MessageSquare,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

const trustItems = [
  {
    icon: Cloud,
    title: 'Cloud-Based',
    description: 'Access your school from anywhere, anytime. No software installation required.',
    gradient: 'from-sky-500 to-blue-600',
    iconShadow: 'shadow-sky-500/30',
    hoverShadow: 'hover:shadow-sky-500/15',
    hoverRing: 'hover:ring-sky-200 dark:hover:ring-sky-500/30',
  },
  {
    icon: Zap,
    title: 'Real-Time Updates',
    description: 'Important school activities update instantly without refreshing the page.',
    gradient: 'from-amber-500 to-orange-600',
    iconShadow: 'shadow-amber-500/30',
    hoverShadow: 'hover:shadow-amber-500/15',
    hoverRing: 'hover:ring-amber-200 dark:hover:ring-amber-500/30',
  },
  {
    icon: Shield,
    title: 'Secure Access',
    description: 'Role-based access ensures each user sees only what they are authorized to view.',
    gradient: 'from-emerald-500 to-teal-600',
    iconShadow: 'shadow-emerald-500/30',
    hoverShadow: 'hover:shadow-emerald-500/15',
    hoverRing: 'hover:ring-emerald-200 dark:hover:ring-emerald-500/30',
  },
  {
    icon: Smartphone,
    title: 'Mobile-Friendly',
    description: 'Works beautifully on phones, tablets and desktop computers.',
    gradient: 'from-violet-500 to-purple-600',
    iconShadow: 'shadow-violet-500/30',
    hoverShadow: 'hover:shadow-violet-500/15',
    hoverRing: 'hover:ring-violet-200 dark:hover:ring-violet-500/30',
  },
  {
    icon: MessageSquare,
    title: 'Parent Communication',
    description: 'Keep parents informed through announcements, notifications and their portal.',
    gradient: 'from-rose-500 to-pink-600',
    iconShadow: 'shadow-rose-500/30',
    hoverShadow: 'hover:shadow-rose-500/15',
    hoverRing: 'hover:ring-rose-200 dark:hover:ring-rose-500/30',
  },
  {
    icon: LayoutDashboard,
    title: 'Digital Administration',
    description: 'Manage your entire school operations from one connected dashboard.',
    gradient: 'from-cyan-500 to-sky-600',
    iconShadow: 'shadow-cyan-500/30',
    hoverShadow: 'hover:shadow-cyan-500/15',
    hoverRing: 'hover:ring-cyan-200 dark:hover:ring-cyan-500/30',
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
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-800/30 text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Why SamleyEduSuite
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Built for Modern Private Schools
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Everything you need to run your school efficiently, all in one place.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {trustItems.map(
            ({ icon: Icon, title, description, gradient, iconShadow, hoverShadow, hoverRing }, i) => (
              <div
                key={i}
                className={`group relative flex items-start gap-4 p-6 bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-100 dark:border-slate-700/50 ring-1 ring-transparent ${hoverRing} hover:shadow-xl ${hoverShadow} hover:-translate-y-1 transition-all duration-300`}
              >
                {/* Soft corner glow on hover */}
                <div
                  className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full opacity-0 blur-3xl group-hover:opacity-15 transition-opacity duration-500 pointer-events-none`}
                />

                {/* Gradient icon badge */}
                <div
                  className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-lg ${iconShadow} group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <div className="relative">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                    {title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
