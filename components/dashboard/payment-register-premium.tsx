'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  CreditCard,
  Building2,
  Wallet,
  CalendarDays,
  LineChart as LineIcon,
} from 'lucide-react';
import {
  payments,
  commercialSummary,
  paymentState,
  PAYMENT_STATE_CONFIG,
  formatSAR,
  formatCompact,
  formatPct,
  formatDateShort,
  type PaymentRecord,
} from '@/lib/data/commercial';
import { CountUp } from '@/components/ui/count-up';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { SCurveChart } from '@/components/intelligence/charts';
import { cn } from '@/lib/utils';

/**
 * Next-generation Payment Register — self-contained, data-driven (no auth or
 * database dependency). Premium KPIs, cumulative S-curve, animated rows.
 */
export function PaymentRegisterPremium() {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.toLowerCase().trim();
    const list = q
      ? payments.filter((p) => `${p.no} ${p.description} ${p.approvalStatus}`.toLowerCase().includes(q))
      : payments;
    return [...list].reverse(); // newest first
  }, [query]);

  const s = commercialSummary;
  const inFlight = payments.filter((p) => p.no.startsWith('IPA') && paymentState(p) !== 'received');
  const inFlightValue = inFlight.reduce((n, p) => n + (p.net ?? 0), 0);

  const kpis = [
    { label: 'Cash Received', value: s.received, mode: 'compact' as const, hint: `${formatPct(s.receivedPct)} of contract` },
    { label: 'Gross Certified', value: s.totalClaimedGross, mode: 'compact' as const, hint: `${formatPct(s.workDonePct)} complete` },
    { label: 'In Flight (Net)', value: inFlightValue, mode: 'compact' as const, hint: `${inFlight.length} applications` },
    { label: 'Retention Held', value: s.totalRetention, mode: 'compact' as const, hint: `${formatPct(s.retentionPct)} retention` },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-rsg-navy via-rsg-blue to-slate-900 p-6 text-white shadow-2xl sm:p-7 dark:from-zinc-900 dark:via-zinc-900 dark:to-black"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <Wallet className="h-3.5 w-3.5 text-rsg-gold" /> Payment Register
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Interim Payment Applications</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-white/70">
            <Building2 className="h-3.5 w-3.5" /> {commercialSummary.project} · {payments.length} applications
          </p>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <SpotlightCard className="h-full p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-400">{k.label}</p>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                <CountUp value={k.value} mode={k.mode} />
              </p>
              <p className="mt-1 text-[11px] text-slate-400">{k.hint}</p>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>

      {/* S-curve */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]"
      >
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rsg-navy/5 text-rsg-navy dark:bg-rsg-gold/10 dark:text-rsg-gold">
            <LineIcon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Cumulative Cashflow</h3>
            <p className="text-[11px] text-slate-400">Gross certified vs cash received over the project timeline</p>
          </div>
        </div>
        <div className="h-60 text-slate-400">
          <SCurveChart />
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search applications…"
          className="w-full rounded-xl border border-slate-200 bg-white/70 py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-rsg-navy/40 dark:border-white/10 dark:bg-white/5 dark:focus:border-rsg-gold/40"
        />
      </div>

      {/* Table */}
      <div className="space-y-2.5">
        <p className="px-1 text-xs text-slate-400">{rows.length} applications</p>
        {rows.map((p, i) => {
          const cfg = PAYMENT_STATE_CONFIG[paymentState(p)];
          const isOpen = expanded === p.no;
          return (
            <motion.div key={p.no} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.4) }} layout>
              <div
                className={cn(
                  'group relative overflow-hidden rounded-2xl border bg-white/70 backdrop-blur-xl transition-all duration-300 dark:bg-white/[0.03]',
                  isOpen ? 'border-rsg-navy/30 shadow-lg dark:border-rsg-gold/30' : 'border-slate-200/70 hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:hover:border-white/20',
                )}
              >
                <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: cfg.hex }} />
                <button onClick={() => setExpanded(isOpen ? null : p.no)} className="flex w-full items-center gap-3 px-4 py-3 pl-5 text-left">
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="shrink-0 text-slate-400">
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                  <div className="grid flex-1 grid-cols-12 items-center gap-3">
                    <div className="col-span-12 sm:col-span-5">
                      <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">{p.no}</p>
                      <p className="truncate text-xs text-slate-400">{p.description}</p>
                    </div>
                    <div className="col-span-4 hidden text-right text-xs text-blue-600 dark:text-blue-400 sm:block">
                      {formatCompact(p.gross)}
                    </div>
                    <div className="col-span-6 text-right sm:col-span-2">
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCompact(p.net)}</span>
                    </div>
                    <div className="col-span-6 flex justify-end sm:col-span-1">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: `${cfg.hex}1a`, color: cfg.hex }}>
                        {cfg.label.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden border-t border-slate-100 dark:border-white/5"
                    >
                      <div className="grid grid-cols-2 gap-3 p-4 pl-5 md:grid-cols-4">
                        <Stat k="Gross Certified" v={formatSAR(p.gross)} />
                        <Stat k="Advance Recovery" v={formatSAR(p.advanceRecovery)} tone="neg" />
                        <Stat k="Retention" v={formatSAR(p.retention)} tone="neg" />
                        <Stat k="VAT (15%)" v={formatSAR(p.vat)} />
                        <Stat k="Net Payment" v={formatSAR(p.net)} strong />
                        <Stat k="Submitted" v={formatDateShort(p.submittedDate)} />
                        <Stat k="Tax Invoice" v={formatDateShort(p.invoiceDate)} />
                        <Stat k="Status" v={p.approvalStatus || cfg.label} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ k, v, strong, tone }: { k: string; v: string; strong?: boolean; tone?: 'neg' }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{k}</p>
      <p
        className={cn(
          'mt-0.5 text-sm',
          tone === 'neg' ? 'text-rose-500' : strong ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-zinc-200',
        )}
      >
        {v}
      </p>
    </div>
  );
}
