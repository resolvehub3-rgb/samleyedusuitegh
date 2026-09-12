import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = ''
}) => {
  const variantStyles = {
    primary: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border whitespace-nowrap ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
