import * as React from 'react';

import { cn } from '@/lib/utils';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-5 flex flex-wrap items-end justify-between gap-3', className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow mb-1">{eyebrow}</p> : null}
        <h1 className="text-xl font-semibold tracking-tight lg:text-2xl">{title}</h1>
        {description ? (
          <div className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</div>
        ) : null}
      </div>
      {actions ? <div className="no-print flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Section({
  id,
  title,
  description,
  actions,
  children,
  className,
}: {
  id?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn('min-w-0 scroll-mt-20 space-y-3', className)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="no-print flex items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function DefinitionRow({
  label,
  value,
  hint,
  emphasise,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  emphasise?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/70 py-2 last:border-0">
      <div className="min-w-0">
        <span className="text-xs text-muted-foreground">{label}</span>
        {hint ? <p className="text-2xs text-muted-foreground/80">{hint}</p> : null}
      </div>
      <span
        className={cn(
          'tnum shrink-0 text-sm',
          emphasise ? 'font-semibold' : 'font-medium',
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/50 px-6 py-14 text-center">
      <p className="text-sm font-medium">{title}</p>
      {description ? (
        <p className="max-w-sm text-xs text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
