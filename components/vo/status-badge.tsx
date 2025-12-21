'use client';

import { statusConfig, VOStatus } from '@/lib/validations/vo';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<VOStatus, { bg: string; text: string; border: string; dot: string }> = {
  PendingWithFFC: {
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800/50',
    dot: 'bg-orange-500',
  },
  PendingWithRSG: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/50',
    dot: 'bg-amber-500',
  },
  PendingWithRSGFFC: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/40',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800/50',
    dot: 'bg-yellow-500',
  },
  ApprovedAwaitingDVO: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-800/50',
    dot: 'bg-cyan-500',
  },
  DVORRIssued: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    dot: 'bg-emerald-500',
  },
};

interface StatusBadgeProps {
  status: VOStatus;
  showDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, showDot = true, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const styles = STATUS_STYLES[status];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border transition-all',
        styles.bg,
        styles.text,
        styles.border,
        sizeClasses[size]
      )}
    >
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', styles.dot)} />
      )}
      <span>{config.label}</span>
    </span>
  );
}
