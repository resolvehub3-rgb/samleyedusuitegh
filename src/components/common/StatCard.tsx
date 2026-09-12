import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'success' | 'warning' | 'primary' | 'neutral';
  colorClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  icon: Icon,
  subtitle,
  badge,
  badgeVariant = 'neutral',
  colorClass = 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40'
}) => {
  return (
    <div
      id={id}
      className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </span>
        {badge && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              badgeVariant === 'success'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};
