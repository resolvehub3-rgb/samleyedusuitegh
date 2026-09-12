import React from 'react';
import { LandingNavbar } from './LandingNavbar';
import { LandingHero } from './LandingHero';
import { LandingTrust } from './LandingTrust';
import { LandingFeatures } from './LandingFeatures';
import { LandingRealtime } from './LandingRealtime';
import { LandingRoles } from './LandingRoles';
import { LandingHowItWorks } from './LandingHowItWorks';
import { LandingParent } from './LandingParent';
import { LandingAdmin } from './LandingAdmin';
import { LandingSecurity } from './LandingSecurity';
import { LandingFAQ } from './LandingFAQ';
import { LandingContact } from './LandingContact';
import { LandingPricing } from './LandingPricing';
import { LandingCTA } from './LandingCTA';
import { LandingFooter } from './LandingFooter';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export function LandingPage({ onNavigateToLogin, onNavigateToRegister }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
      <LandingNavbar
        onNavigateToLogin={onNavigateToLogin}
        onNavigateToRegister={onNavigateToRegister}
      />
      <main>
        <LandingHero onNavigateToRegister={onNavigateToRegister} />
        <LandingTrust />
        <LandingFeatures />
        <LandingRealtime />
        <LandingRoles />
        <LandingHowItWorks />
        <LandingParent />
        <LandingAdmin />
        <LandingSecurity />
        <LandingPricing
          onNavigateToLogin={onNavigateToLogin}
          onNavigateToRegister={onNavigateToRegister}
        />
        <LandingFAQ />
        <LandingContact />
        <LandingCTA
          onNavigateToLogin={onNavigateToLogin}
          onNavigateToRegister={onNavigateToRegister}
        />
      </main>
      <LandingFooter
        onNavigateToLogin={onNavigateToLogin}
        onNavigateToRegister={onNavigateToRegister}
      />
    </div>
  );
}
