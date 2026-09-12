import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

interface LandingCTAProps {
  onNavigateToRegister: () => void;
  onNavigateToLogin: () => void;
}

export function LandingCTA({ onNavigateToRegister, onNavigateToLogin }: LandingCTAProps) {
  return (
    <SectionWrapper className="py-20 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-red-500 rounded-3xl p-10 sm:p-14 shadow-2xl shadow-orange-500/20">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Modernize Your School?
          </h2>
          <p className="text-lg text-orange-100 max-w-xl mx-auto mb-8">
            Bring your school&apos;s daily operations into one simple, connected platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onNavigateToRegister}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-orange-600 bg-white hover:bg-orange-50 rounded-2xl shadow-lg transition-all active:scale-[0.98]"
            >
              Register Your School
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onNavigateToLogin}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white border-2 border-white/30 hover:border-white/60 rounded-2xl transition-all"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
