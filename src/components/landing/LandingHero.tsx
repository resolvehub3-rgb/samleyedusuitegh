import React from 'react';
import { ArrowRight } from 'lucide-react';
import { usePublicPlatformSettings } from '../../hooks/usePublicPlatformSettings';

interface LandingHeroProps {
  onNavigateToRegister: () => void;
}

export function LandingHero({ onNavigateToRegister }: LandingHeroProps) {
  const { platform_motto } = usePublicPlatformSettings();
  const scrollToFeatures = () => {
    document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-20 pb-16 bg-gradient-to-b from-orange-50/80 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 overflow-hidden transition-colors"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-100 dark:bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-orange-50 dark:bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              Built for Ghanaian Private Schools
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
              Smarter School{' '}
              <span className="text-orange-500">Management.</span>
              <br />
              Better Education.
            </h1>

            <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {platform_motto}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={onNavigateToRegister}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all active:scale-[0.98]"
              >
                Register Your School
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={scrollToFeatures}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500/50 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Explore Features
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="hidden lg:block relative">
            <img
              src="/hero-img.png"
              alt="SamleyEduSuite Dashboard Preview"
              className="w-full h-auto rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-100 dark:border-slate-700"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
