'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  variationOrders,
  statusConfigOf,
  statusKeyOf,
  VO_STATUS,
  VO_STATUS_ORDER,
  formatCompact,
  formatDateShort,
  voStatusBreakdown,
  type VOStatusKey,
} from '@/lib/data/commercial';
import { cn } from '@/lib/utils';

const toTime = (d: string | null) => (d ? new Date(d).getTime() : null);
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * VO lifecycle Gantt — each variation order is a bar spanning logged → submitted,
 * laid out on a real month axis, filterable by status. Self-contained / data-driven.
 */
export function VoGantt() {
  const [active, setActive] = useState<VOStatusKey | 'all'>('all');
  const [hover, setHover] = useState<number | null>(null);

  const dated = useMemo(() => {
    return variationOrders
      .map((v) => {
        const a = toTime(v.dateIn) ?? toTime(v.submissionDate);
        const b = toTime(v.submissionDate) ?? toTime(v.dateIn);
        if (a == null || b == null) return null;
        return { v, start: Math.min(a, b), end: Math.max(a, b) };
      })
      .filter((d): d is { v: (typeof variationOrders)[number]; start: number; end: number } => d != null);
  }, []);

  const min = useMemo(() => Math.min(...dated.map((d) => d.start)), [dated]);
  const max = useMemo(() => Math.max(...dated.map((d) => d.end)), [dated]);
  const span = max - min || 1;
  const pct = (t: number) => ((t - min) / span) * 100;

  const rows = useMemo(
    () =>
      dated
        .filter((d) => active === 'all' || statusKeyOf(d.v) === active)
        .sort((a, b) => a.start - b.start),
    [dated, active],
  );

  const ticks = useMemo(() => {
    const out: Date[] = [];
    const d = new Date(min);
    d.setDate(1);
    const stepMonths = span > 1000 * 60 * 60 * 24 * 540 ? 2 : 1;
    while (d.getTime() <= max) {
      out.push(new Date(d));
      d.setMonth(d.getMonth() + stepMonths);
    }
    return out;
  }, [min, max, span]);

  const breakdown = useMemo(() => voStatusBreakdown(), []);

  return (
    <div className="space-y-3">
      {/* Status filter */}
      <div className="flex flex-wrap items-center gap-1.5">
        <FilterChip label="All" count={dated.length} active={active === 'all'} onClick={() => setActive('all')} />
        {VO_STATUS_ORDER.map((key) => {
          const agg = breakdown.find((b) => b.key === key);
          if (!agg) return null;
          return (
            <FilterChip
              key={key}
              label={VO_STATUS[key].short}
              count={agg.count}
              hex={VO_STATUS[key].hex}
              active={active === key}
              onClick={() => setActive(active === key ? 'all' : key)}
            />
          );
        })}
      </div>

      {/* Month axis */}
      <div className="relative ml-[88px] h-5 border-b border-slate-200/70 dark:border-white/10">
        {ticks.map((t, i) => (
          <span
            key={i}
            className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-[10px] text-slate-400"
            style={{ left: `${pct(t.getTime())}%` }}
          >
            {MONTH[t.getMonth()]} {String(t.getFullYear()).slice(2)}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="max-h-[420px] space-y-[3px] overflow-y-auto pr-1">
        {rows.map((d, i) => {
          const cfg = statusConfigOf(d.v);
          const left = pct(d.start);
          const width = Math.max(pct(d.end) - pct(d.start), 0.8);
          const isHover = hover === d.v.sno;
          return (
            <div
              key={d.v.sno}
              className="group flex items-center gap-2"
              onMouseEnter={() => setHover(d.v.sno)}
              onMouseLeave={() => setHover(null)}
            >
              <span className="w-[80px] shrink-0 truncate text-right font-mono text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-200">
                {d.v.voNumber ?? `#${d.v.sno}`}
              </span>
              <div className="relative h-[18px] flex-1 rounded bg-slate-100/60 dark:bg-white/[0.03]">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: Math.min(i * 0.012, 0.5), duration: 0.5, ease: 'easeOut' }}
                  style={{ left: `${left}%`, width: `${width}%`, backgroundColor: cfg.hex, transformOrigin: 'left' }}
                  className={cn(
                    'absolute top-1/2 h-[12px] min-w-[6px] -translate-y-1/2 rounded-full shadow-sm transition-all',
                    isHover ? 'h-[16px] ring-2 ring-white/60 dark:ring-white/20' : 'opacity-90',
                  )}
                  title={`${d.v.voNumber ?? ''} · ${d.v.subject}\n${formatDateShort(d.v.dateIn)} → ${formatDateShort(d.v.submissionDate)}\n${cfg.label} · ${formatCompact(d.v.value ?? d.v.rsgAssessment ?? d.v.costProposal ?? 0)}`}
                />
                {isHover && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pointer-events-none absolute -top-1 left-1/2 z-20 w-max max-w-[280px] -translate-x-1/2 -translate-y-full rounded-lg border border-white/15 bg-white/95 px-2.5 py-1.5 text-[11px] shadow-xl backdrop-blur-xl dark:bg-zinc-900/95"
                  >
                    <p className="font-semibold text-slate-700 dark:text-zinc-100">
                      {d.v.voNumber} · <span className="font-normal text-slate-500 dark:text-zinc-400">{d.v.subject}</span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-slate-400">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.hex }} />
                      {cfg.label} · {formatDateShort(d.v.dateIn)} → {formatDateShort(d.v.submissionDate)}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className="py-8 text-center text-xs text-slate-400">No dated variations for this filter.</p>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
  hex,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  hex?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all',
        active
          ? 'border-transparent bg-rsg-navy text-white shadow-sm dark:bg-rsg-gold dark:text-zinc-900'
          : 'border-slate-200 bg-white/60 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300',
      )}
    >
      {hex && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: hex }} />}
      {label}
      <span className={cn('rounded-full px-1.5 text-[10px]', active ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/10')}>
        {count}
      </span>
    </button>
  );
}
