import React from 'react';
import { Shield, Lock, Database, Key, Users, Zap, ShieldCheck } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

const securityFeatures = [
  {
    icon: Key,
    title: 'Supabase Authentication',
    description: 'Secure email-based authentication with session management.',
    gradient: 'from-orange-500 to-amber-500',
    lightBg: 'bg-orange-50 dark:bg-orange-500/10',
    hoverShadow: 'hover:shadow-orange-500/10',
    hoverRing: 'hover:ring-orange-200 dark:hover:ring-orange-500/25',
  },
  {
    icon: Database,
    title: 'PostgreSQL Database',
    description: 'Industry-standard relational database powering all school data.',
    gradient: 'from-sky-500 to-blue-600',
    lightBg: 'bg-sky-50 dark:bg-sky-500/10',
    hoverShadow: 'hover:shadow-sky-500/10',
    hoverRing: 'hover:ring-sky-200 dark:hover:ring-sky-500/25',
  },
  {
    icon: Shield,
    title: 'Row Level Security',
    description: 'Database-level policies ensure users only access authorized data.',
    gradient: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    hoverShadow: 'hover:shadow-emerald-500/10',
    hoverRing: 'hover:ring-emerald-200 dark:hover:ring-emerald-500/25',
  },
  {
    icon: Lock,
    title: 'Secure Storage',
    description: 'School assets stored securely in Supabase Storage buckets.',
    gradient: 'from-violet-500 to-purple-600',
    lightBg: 'bg-violet-50 dark:bg-violet-500/10',
    hoverShadow: 'hover:shadow-violet-500/10',
    hoverRing: 'hover:ring-violet-200 dark:hover:ring-violet-500/25',
  },
  {
    icon: Users,
    title: 'Role-Based Authorization',
    description: 'Each role — Admin, Teacher, Parent — has specific access permissions.',
    gradient: 'from-rose-500 to-pink-600',
    lightBg: 'bg-rose-50 dark:bg-rose-500/10',
    hoverShadow: 'hover:shadow-rose-500/10',
    hoverRing: 'hover:ring-rose-200 dark:hover:ring-rose-500/25',
  },
  {
    icon: Zap,
    title: 'Realtime Infrastructure',
    description: 'Supabase Realtime delivers updates through secure WebSocket connections.',
    gradient: 'from-cyan-500 to-sky-600',
    lightBg: 'bg-cyan-50 dark:bg-cyan-500/10',
    hoverShadow: 'hover:shadow-cyan-500/10',
    hoverRing: 'hover:ring-cyan-200 dark:hover:ring-cyan-500/25',
  },
];

export function LandingSecurity() {
  return (
    <SectionWrapper id="security" className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/30 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Security
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Built With Security in Mind
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            The platform uses secure cloud infrastructure and role-based access to protect your school&apos;s data.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {securityFeatures.map(
            ({ icon: Icon, title, description, gradient, lightBg, hoverShadow, hoverRing }, i) => (
              <div
                key={i}
                className={`group relative p-6 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 ring-1 ring-transparent ${hoverRing} hover:shadow-xl ${hoverShadow} hover:-translate-y-1 transition-all duration-300`}
              >
                {/* Soft corner glow on hover */}
                <div
                  className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full opacity-0 blur-3xl group-hover:opacity-15 transition-opacity duration-500 pointer-events-none`}
                />

                <div className="relative flex items-start gap-4">
                  {/* Tinted badge + gradient icon on hover */}
                  <div
                    className={`w-12 h-12 ${lightBg} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">{title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
