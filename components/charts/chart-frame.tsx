'use client';

import { Table2, BarChart3 } from 'lucide-react';
import * as React from 'react';

import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface SeriesKey {
  key: string;
  label: string;
  colour: string;
  /** Dashed swatch for projected / reference series. */
  dashed?: boolean;
}

/**
 * Every figure ships with a legend (for ≥ 2 series) and a table view, so
 * identity is never carried by colour alone and the numbers stay readable to a
 * screen reader.
 */
export function ChartFrame({
  title,
  subtitle,
  series,
  tableColumns,
  tableRows,
  children,
  footnote,
  className,
  height = 260,
}: {
  title: string;
  subtitle?: string;
  series?: SeriesKey[];
  tableColumns?: string[];
  tableRows?: Array<Array<string | number>>;
  children: React.ReactNode;
  footnote?: string;
  className?: string;
  height?: number;
}) {
  const [view, setView] = React.useState<'chart' | 'table'>('chart');
  const hasTable = Boolean(tableColumns?.length && tableRows?.length);

  return (
    <section
      className={cn('flex flex-col rounded-lg border border-border bg-card shadow-card', className)}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pb-2 pt-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        {hasTable ? (
          <div className="no-print flex shrink-0 rounded-md border border-border p-0.5">
            <button
              type="button"
              onClick={() => setView('chart')}
              aria-pressed={view === 'chart'}
              className={cn(
                'flex items-center gap-1.5 rounded px-2 py-1 text-2xs font-medium transition-colors',
                view === 'chart' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <BarChart3 className="size-3" /> Chart
            </button>
            <button
              type="button"
              onClick={() => setView('table')}
              aria-pressed={view === 'table'}
              className={cn(
                'flex items-center gap-1.5 rounded px-2 py-1 text-2xs font-medium transition-colors',
                view === 'table' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Table2 className="size-3" /> Table
            </button>
          </div>
        ) : null}
      </header>

      {series && series.length > 1 ? (
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 pb-2">
          {series.map((entry) => (
            <li key={entry.key} className="flex items-center gap-1.5 text-2xs text-muted-foreground">
              <span
                aria-hidden
                className="inline-block h-0.5 w-4 rounded-full"
                style={
                  entry.dashed
                    ? {
                        backgroundImage: `repeating-linear-gradient(90deg, ${entry.colour} 0 4px, transparent 4px 7px)`,
                      }
                    : { backgroundColor: entry.colour }
                }
              />
              {entry.label}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex-1 px-2 pb-3">
        {view === 'chart' ? (
          <div style={{ height }}>{children}</div>
        ) : (
          <div className="max-h-[320px] overflow-auto px-3">
            <Table>
              <THead>
                <TR>
                  {tableColumns!.map((column, index) => (
                    <TH key={column} numeric={index > 0}>
                      {column}
                    </TH>
                  ))}
                </TR>
              </THead>
              <TBody>
                {tableRows!.map((row, index) => (
                  <TR key={index}>
                    {row.map((cell, cellIndex) => (
                      <TD key={cellIndex} numeric={cellIndex > 0}>
                        {cell}
                      </TD>
                    ))}
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        )}
      </div>

      {footnote ? (
        <p className="border-t border-border px-5 py-2 text-2xs text-muted-foreground">{footnote}</p>
      ) : null}
    </section>
  );
}

/** Shared Recharts tooltip so every figure reads the same. */
export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; dataKey?: string | number; value?: number; color?: string; payload?: Record<string, unknown> }>;
  label?: string | number;
  formatter?: (value: number, name: string) => string;
  labelFormatter?: (label: string | number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="pointer-events-none rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-pop">
      <p className="mb-1 font-medium text-foreground">
        {labelFormatter ? labelFormatter(label ?? '') : label}
      </p>
      <ul className="space-y-0.5">
        {payload.map((entry, index) => (
          <li key={index} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                aria-hidden
                className="inline-block size-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="tnum font-medium text-foreground">
              {formatter ? formatter(entry.value ?? 0, String(entry.name)) : entry.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
