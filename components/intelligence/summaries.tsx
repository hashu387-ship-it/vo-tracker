'use client';

import { motion } from 'framer-motion';
import {
  ipaSummary,
  voSummary,
  formatSAR,
} from '@/lib/data/commercial';
import { cn } from '@/lib/utils';

const pct2 = (n: number) => `${(n * 100).toFixed(2)}%`;

/* ============================================================= */
/*  IPA summary (Summary of IPA's + Advance Recovery + Retention) */
/* ============================================================= */

export function IpaSummary() {
  const d = ipaSummary();

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      {/* Summary of IPAs */}
      <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/50 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] lg:col-span-2">
        <div className="bg-rsg-navy/85 backdrop-blur-md px-4 py-2.5 text-center text-sm font-bold uppercase tracking-wide text-white dark:bg-zinc-800">
          Summary of IPA&apos;s (without VAT)
        </div>
        <div className="p-4">
          {/* Contract values */}
          <div className="mb-3 space-y-1.5">
            <ContractRow label="Original Contract Value" value={d.originalContract} tint="#1f4e5f" />
            <ContractRow label="Revised Contract Value" value={d.revisedContract} tint="#b08d57" />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Work-done donut */}
            <div className="flex shrink-0 flex-col items-center">
              <div
                className="relative h-24 w-24 rounded-full"
                style={{ background: `conic-gradient(#2a8a99 ${d.totalWorkDone.pct * 360}deg, #e2e8f0 0deg)` }}
              >
                <div className="absolute inset-[16%] flex flex-col items-center justify-center rounded-full bg-white text-center dark:bg-zinc-900">
                  <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400">Work</span>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400">Done</span>
                </div>
              </div>
              <span className="mt-1.5 text-lg font-bold text-[#2a8a99]">{pct2(d.totalWorkDone.pct)}</span>
            </div>

            {/* Status rows */}
            <div className="flex-1 space-y-1.5">
              {d.statuses.map((row, i) => (
                <SummaryBar key={row.label} label={row.label} value={row.value} pct={row.pct} hex={row.hex} index={i} />
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="mt-4 space-y-1.5">
            <SummaryBar label="Total Work Done" value={d.totalWorkDone.value} pct={d.totalWorkDone.pct} hex="#2a8a99" strong />
            <SummaryBar label="Balance Work Done" value={d.balanceWorkDone.value} pct={d.balanceWorkDone.pct} hex="#c4694e" strong />
          </div>
        </div>
      </div>

      {/* Advance + Retention */}
      <div className="space-y-3">
        <RecoveryCard
          title="Advance Payment Recovery"
          rows={[
            { label: 'Advance Payment', value: d.advance.total, pct: d.advance.totalPct },
            { label: 'Deducted till Date', value: d.advance.deducted, pct: d.advance.deductedPct, highlight: true },
            { label: 'Balance', value: d.advance.balance, pct: d.advance.balancePct, danger: true },
          ]}
        />
        <RecoveryCard
          title="Summary of Retention"
          rows={[
            { label: 'Total Retention', value: d.retention.total, pct: d.retention.totalPct },
            { label: 'Deducted till Date', value: d.retention.deducted, pct: d.retention.deductedPct, highlight: true },
            { label: 'Balance', value: d.retention.balance, pct: d.retention.balancePct, danger: true },
          ]}
        />
      </div>
    </div>
  );
}

function ContractRow({ label, value, tint }: { label: string; value: number; tint: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-1.5 text-sm" style={{ backgroundColor: `${tint}14` }}>
      <span className="font-semibold text-slate-700 dark:text-zinc-200">{label}</span>
      <span className="font-bold text-slate-900 dark:text-white">{formatSAR(value)}</span>
    </div>
  );
}

function SummaryBar({
  label,
  value,
  pct,
  hex,
  index = 0,
  strong,
}: {
  label: string;
  value: number;
  pct: number;
  hex: string;
  index?: number;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm">
      <span className={cn('w-36 shrink-0 truncate font-semibold', strong ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-zinc-300')} style={{ color: hex }}>
        {label}
      </span>
      <span className="flex-1 text-right font-bold tabular-nums text-slate-900 dark:text-white">{formatSAR(value)}</span>
      <div className="hidden h-3 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10 sm:block">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.min(pct * 100, 100)}%` }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.06, duration: 0.6 }}
          className="h-full rounded-full"
          style={{ backgroundColor: hex }}
        />
      </div>
      <span className="w-16 shrink-0 text-right font-bold tabular-nums" style={{ color: hex }}>
        {pct2(pct)}
      </span>
    </div>
  );
}

function RecoveryCard({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number; pct: number; highlight?: boolean; danger?: boolean }[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/50 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
      <div className="bg-rsg-navy/85 backdrop-blur-md px-4 py-2 text-center text-xs font-bold uppercase tracking-wide text-white dark:bg-zinc-800">
        {title}
      </div>
      <div className="space-y-1 p-3">
        {rows.map((r) => (
          <div
            key={r.label}
            className={cn(
              'flex items-center justify-between rounded-lg px-3 py-1.5 text-xs',
              r.highlight && 'bg-[#2a8a99]/10',
              r.danger && 'bg-rose-500/5',
            )}
          >
            <span className={cn('font-semibold', r.danger ? 'text-rose-500' : 'text-slate-700 dark:text-zinc-200')}>{r.label}</span>
            <span className="flex items-center gap-3">
              <span className={cn('font-bold tabular-nums', r.danger ? 'text-rose-500' : 'text-slate-900 dark:text-white')}>{formatSAR(r.value)}</span>
              <span className={cn('w-16 text-right font-bold tabular-nums', r.danger ? 'text-rose-500' : 'text-[#2a8a99]')}>{pct2(r.pct)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================= */
/*  VO status summary (Submitted VO breakdown)                   */
/* ============================================================= */

export function VoStatusSummary() {
  const { rows, totalCount, totalValue } = voSummary();

  return (
    <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/50 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
      <div className="bg-rsg-navy/85 backdrop-blur-md px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white dark:bg-zinc-800">
        Submitted Variation Orders — Status Summary
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {rows.map((r, i) => (
          <motion.div
            key={r.key}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="grid grid-cols-12 items-center gap-2 px-4 py-2.5 text-sm"
          >
            <span className="col-span-7 flex items-center gap-2.5 font-semibold text-slate-700 dark:text-zinc-200">
              <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: r.config.hex }} />
              {r.config.label}
            </span>
            <span className="col-span-2 text-center font-bold tabular-nums text-slate-900 dark:text-white">{r.count}</span>
            <span
              className={cn('col-span-3 text-right font-bold tabular-nums', r.value < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white')}
            >
              {formatSAR(r.value)}
            </span>
          </motion.div>
        ))}
        {/* Total */}
        <div className="grid grid-cols-12 items-center gap-2 bg-rsg-navy/90 px-4 py-3 text-sm text-white dark:bg-zinc-800">
          <span className="col-span-7 font-bold uppercase tracking-wide">Total Submitted VO</span>
          <span className="col-span-2 text-center text-base font-extrabold tabular-nums">{totalCount}</span>
          <span className="col-span-3 text-right text-base font-extrabold tabular-nums">{formatSAR(totalValue)}</span>
        </div>
      </div>
    </div>
  );
}
