import Link from 'next/link';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * A stat tile, not a chart. Per the "is it even a chart?" test: a single
 * headline figure with at most one comparison reads better as a number than as
 * a one-bar plot.
 */
export function KpiTile({
  label,
  value,
  unit,
  caption,
  meter,
  meterLabel,
  tone = 'default',
  href,
  className,
}: {
  label: string;
  value: string;
  unit?: string;
  caption?: React.ReactNode;
  /** 0–1. Renders a thin progress meter under the value. */
  meter?: number;
  meterLabel?: string;
  tone?: 'default' | 'primary' | 'accent' | 'good' | 'warning' | 'serious';
  href?: string;
  className?: string;
}) {
  const meterColour =
    tone === 'good'
      ? 'bg-good'
      : tone === 'warning'
        ? 'bg-warning'
        : tone === 'serious'
          ? 'bg-serious'
          : tone === 'accent'
            ? 'bg-accent'
            : 'bg-primary';

  const body = (
    <div
      className={cn(
        'group relative flex h-full flex-col justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-card transition-shadow',
        href && 'hover:shadow-lift',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="eyebrow">{label}</span>
        {unit ? (
          <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </div>

      <div>
        <p className="tnum text-2xl font-semibold leading-none tracking-tight">{value}</p>
        {caption ? <p className="mt-1.5 text-xs text-muted-foreground">{caption}</p> : null}
      </div>

      {meter !== undefined ? (
        <div className="space-y-1">
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="img"
            aria-label={`${meterLabel ?? label}: ${Math.round(meter * 100)}%`}
          >
            <div
              className={cn('h-full rounded-full transition-[width] duration-500', meterColour)}
              style={{ width: `${Math.max(0, Math.min(1, meter)) * 100}%` }}
            />
          </div>
          {meterLabel ? (
            <p className="text-2xs text-muted-foreground">{meterLabel}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  if (!href) return body;
  return (
    <Link href={href} className="block h-full focus-ring rounded-lg">
      {body}
    </Link>
  );
}

export function KpiGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 xl:grid-cols-4', className)}>{children}</div>
  );
}
