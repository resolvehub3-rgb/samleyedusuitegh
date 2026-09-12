import React from 'react';
import { Shield, Lock, Database, Key, Users, Zap } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

const securityFeatures = [
  {
    icon: Key,
    title: 'Supabase Authentication',
    description: 'Secure email-based authentication with session management.',
  },
  {
    icon: Database,
    title: 'PostgreSQL Database',
    description: 'Industry-standard relational database powering all school data.',
  },
  {
    icon: Shield,
    title: 'Row Level Security',
    description: 'Database-level policies ensure users only access authorized data.',
  },
  {
    icon: Lock,
    title: 'Secure Storage',
    description: 'School assets stored securely in Supabase Storage buckets.',
  },
  {
    icon: Users,
    title: 'Role-Based Authorization',
    description: 'Each role — Admin, Teacher, Parent — has specific access permissions.',
  },
  {
    icon: Zap,
    title: 'Realtime Infrastructure',
    description: 'Supabase Realtime delivers updates through secure WebSocket connections.',
  },
];

export function LandingSecurity() {
  return (
    <SectionWrapper id="security" className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block text-sm font-bold text-orange-500 uppercase tracking-wider mb-3">
            Security
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Built With Security in Mind
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            The platform uses secure cloud infrastructure and role-based access to protect your school&apos;s data.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map(({ icon: Icon, title, description }, i) => (
            <div
              key={i}
              className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:border-orange-200 dark:hover:border-orange-500/20 transition-colors"
            >
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/15 rounded-2xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
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
