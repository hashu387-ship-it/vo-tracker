'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight, AlertTriangle, Info, CheckCircle2, Sparkles } from 'lucide-react';
import { CountUp } from '@/components/ui/count-up';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { useWorkspace } from '@/components/providers/workspace-provider';
import { recommendations } from '@/lib/intelligence/engine';
import {
  variationOrders,
  statusConfigOf,
  formatCompact,
  formatDateShort,
  type Kpi,
} from '@/lib/data/commercial';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  KPI card                                                          */
/* ------------------------------------------------------------------ */

export function KpiCard({ kpi, index }: { kpi: Kpi; index: number }) {
  const mode = kpi.format === 'currency' ? 'compact' : kpi.format === 'percent' ? 'percent' : 'plain';
  const up = (kpi.delta ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 120, damping: 18 }}
    >
      <SpotlightCard className="group h-full p-5">
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-400">
            {kpi.label}
          </p>
          {kpi.delta != null && (
            <span
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                up
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
              )}
            >
              {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(kpi.delta).toFixed(1)}%
            </span>
          )}
        </div>
        <div className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          <CountUp value={kpi.value} mode={mode as any} decimals={kpi.decimals ?? 0} />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-400 dark:text-zinc-500">{kpi.hint}</p>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: index * 0.08 + 0.3, duration: 1 }}
            className="h-full rounded-full bg-gradient-to-r from-rsg-navy to-sky-500 dark:from-rsg-gold dark:to-amber-400"
          />
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Progress ring                                                     */
/* ------------------------------------------------------------------ */

export function ProgressRing({
  label,
  pct,
  caption,
  color = '#10b981',
  size = 116,
}: {
  label: string;
  pct: number;
  caption?: string;
  color?: string;
  size?: number;
}) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, pct));

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-slate-100 dark:stroke-white/5" />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            whileInView={{ strokeDashoffset: c * (1 - clamped) }}
            viewport={{ once: true }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            <CountUp value={clamped * 100} mode="percent" decimals={1} />
          </span>
        </div>
      </div>
      <p className="text-sm font-medium text-slate-700 dark:text-zinc-200">{label}</p>
      {caption && <p className="text-center text-[11px] text-slate-400">{caption}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AI insights panel                                                 */
/* ------------------------------------------------------------------ */

const SEVERITY = {
  warning: { icon: AlertTriangle, cls: 'text-amber-500', bg: 'bg-amber-500/10' },
  info: { icon: Info, cls: 'text-sky-500', bg: 'bg-sky-500/10' },
  positive: { icon: CheckCircle2, cls: 'text-emerald-500', bg: 'bg-emerald-500/10' },
} as const;

export function InsightsPanel() {
  const { askAssistant } = useWorkspace();
  const recs = recommendations();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-rsg-navy dark:text-rsg-gold" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI Insights</h3>
        </div>
        <button
          onClick={() => askAssistant('What needs my attention?')}
          className="flex items-center gap-1 text-xs font-medium text-rsg-navy hover:underline dark:text-rsg-gold"
        >
          Ask follow-up <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>
      <div className="space-y-2">
        {recs.slice(0, 4).map((r, i) => {
          const sev = SEVERITY[r.severity];
          const Icon = sev.icon;
          return (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-3 rounded-xl border border-slate-200/70 bg-white/50 p-3 dark:border-white/5 dark:bg-white/[0.02]"
            >
              <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', sev.bg)}>
                <Icon className={cn('h-4 w-4', sev.cls)} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-zinc-100">{r.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">{r.detail}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Recent VO activity timeline                                       */
/* ------------------------------------------------------------------ */

export function VoTimeline() {
  const recent = [...variationOrders]
    .filter((v) => v.dateIn)
    .sort((a, b) => new Date(b.dateIn!).getTime() - new Date(a.dateIn!).getTime())
    .slice(0, 6);

  return (
    <div className="relative space-y-4 pl-1">
      <div className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent dark:from-white/10 dark:via-white/10" />
      {recent.map((v, i) => {
        const cfg = statusConfigOf(v);
        const val = v.value ?? v.rsgAssessment ?? v.costProposal ?? 0;
        return (
          <motion.div
            key={v.sno}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative flex gap-3"
          >
            <span
              className="relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white dark:border-zinc-950"
              style={{ backgroundColor: cfg.hex }}
            />
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-zinc-100">
                  {v.voNumber ?? 'VO'} · {v.subject}
                </p>
                <span className={cn('shrink-0 text-xs font-semibold', val < 0 ? 'text-rose-500' : 'text-slate-700 dark:text-zinc-200')}>
                  {formatCompact(val)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {formatDateShort(v.dateIn)} · {cfg.label}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
