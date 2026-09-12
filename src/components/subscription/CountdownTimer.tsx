import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: string | null;
  isTrial: boolean;
  isActive: boolean;
  isSuspended: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(expiresAt: string | null): TimeLeft {
  if (!expiresAt) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiresAt,
  isTrial,
  isActive,
  isSuspended,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(expiresAt));

  useEffect(() => {
    if (!expiresAt) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(expiresAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  const totalDays = timeLeft.days;

  // Color scheme based on urgency
  const getUrgencyColor = () => {
    if (isSuspended) return {
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      border: 'border-rose-200 dark:border-rose-800/60',
      text: 'text-rose-700 dark:text-rose-300',
      digitBg: 'bg-rose-100 dark:bg-rose-900/60',
      label: 'text-rose-500 dark:text-rose-400',
    };
    if (totalDays <= 2) return {
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      border: 'border-rose-200 dark:border-rose-800/60',
      text: 'text-rose-700 dark:text-rose-300',
      digitBg: 'bg-rose-100 dark:bg-rose-900/60',
      label: 'text-rose-500 dark:text-rose-400',
    };
    if (totalDays <= 7) return {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800/60',
      text: 'text-amber-700 dark:text-amber-300',
      digitBg: 'bg-amber-100 dark:bg-amber-900/60',
      label: 'text-amber-500 dark:text-amber-400',
    };
    if (isTrial) return {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800/60',
      text: 'text-amber-700 dark:text-amber-300',
      digitBg: 'bg-amber-100 dark:bg-amber-900/60',
      label: 'text-amber-500 dark:text-amber-400',
    };
    return {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      digitBg: 'bg-emerald-100 dark:bg-emerald-900/60',
      label: 'text-emerald-500 dark:text-emerald-400',
    };
  };

  const colors = getUrgencyColor();
  const isExpired = totalDays === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  const pad = (n: number) => String(n).padStart(2, '0');

  const segments = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Mins' },
    { value: timeLeft.seconds, label: 'Secs' },
  ];

  return (
    <div className="flex items-center gap-2">
      {/* Icon */}
      {isSuspended || isExpired ? (
        <AlertTriangle className={`w-3 h-3 shrink-0 ${colors.text}`} />
      ) : isTrial ? (
        <Clock className={`w-3 h-3 shrink-0 ${colors.text}`} />
      ) : (
        <CheckCircle2 className={`w-3 h-3 shrink-0 ${colors.text}`} />
      )}

      {/* Countdown digits inline */}
      <div className="flex items-center gap-0.5">
        {segments.map((seg, i) => (
          <React.Fragment key={seg.label}>
            <div className="flex flex-col items-center">
              <span className={`text-[11px] font-black font-mono tabular-nums leading-none ${colors.text}`}>
                {pad(seg.value)}
              </span>
              <span className={`text-[7px] font-semibold ${colors.label} leading-none mt-0.5`}>
                {seg.label}
              </span>
            </div>
            {i < segments.length - 1 && (
              <span className={`text-[11px] font-bold ${colors.label} -mt-1.5`}>:</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Expiry date */}
      {expiresAt && (
        <span className="text-[9px] text-slate-400 dark:text-slate-500 ml-1">
          {isExpired ? 'Expired' : 'Exp'} {new Date(expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </span>
      )}
    </div>
  );
};
