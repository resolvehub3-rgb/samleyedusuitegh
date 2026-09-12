import React from 'react';
import { UserPlus, Settings, Rocket } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

const steps = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Register Your School',
    description: "School owner creates the school's account in just a few minutes.",
  },
  {
    icon: Settings,
    number: '02',
    title: 'Set Up Your School',
    description: 'Add teachers, students, parents, classes and subjects.',
  },
  {
    icon: Rocket,
    number: '03',
    title: 'Manage Everything',
    description: 'Run daily school operations through the connected platform.',
  },
];

export function LandingHowItWorks() {
  return (
    <SectionWrapper
      id="how-it-works"
      className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block text-sm font-bold text-orange-500 uppercase tracking-wider mb-3">
            Getting Started
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Get started in three simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-20 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200 dark:from-orange-500/20 dark:via-orange-500/40 dark:to-orange-500/20" />

          {steps.map(({ icon: Icon, number, title, description }, i) => (
            <div key={i} className="relative text-center">
              <div className="relative inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/20 mb-6 z-10">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-xs font-bold text-orange-400 dark:text-orange-500 mb-2">
                Step {number}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
