'use client';

import { statusConfig, VOStatus } from '@/lib/validations/vo';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: VOStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold neo-badge',
        config.color,
        config.bgColor
      )}
    >
      {config.label}
    </span>
  );
}
