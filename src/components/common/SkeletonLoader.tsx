import React from 'react';

export const SkeletonRow: React.FC<{ cols?: number }> = ({ cols = 4 }) => {
  return (
    <div className="flex items-center gap-4 py-3 animate-pulse border-b border-slate-100 dark:border-slate-800/60">
      {Array.from({ length: cols }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md flex-1"
          style={{ width: `${80 - i * 10}%` }}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
      <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-md mb-2" />
      <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
      <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded-md mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
};
