import React from 'react';
import { LucideIcon, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  id?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  id
}) => {
  return (
    <div
      id={id || 'empty-state-card'}
      className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/40 my-4"
    >
      <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4 shadow-xs">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
        {title}
      </h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 dark:bg-orange-600 dark:hover:bg-orange-500 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
