import React from 'react';
import { useScrollAnimation } from './useScrollAnimation';

interface SectionWrapperProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}

export function SectionWrapper({ id, children, className = '', dark = false }: SectionWrapperProps) {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section
      id={id}
      ref={ref}
      className={`${dark ? 'bg-slate-900 dark:bg-slate-950' : 'bg-white dark:bg-slate-900'} transition-colors duration-300 ${className}`}
    >
      <div
        className={`transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {children}
      </div>
    </section>
  );
}
