'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  FileText,
  Building2,
  ClipboardList,
  TrendingUp,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Link2,
  User2,
  CalendarDays,
} from 'lucide-react';
import {
  variationOrders,
  voStatusBreakdown,
  statusConfigOf,
  statusKeyOf,
  VO_STATUS,
  VO_STATUS_ORDER,
  formatSAR,
  formatCompact,
  formatDateShort,
  commercialSummary,
  type VORecord,
  type VOStatusKey,
} from '@/lib/data/commercial';
import { CountUp } from '@/components/ui/count-up';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { VoStatusSummary } from '@/components/intelligence/summaries';
import { useWorkspace } from '@/components/providers/workspace-provider';
import { cn } from '@/lib/utils';

type SortKey = 'recent' | 'value-desc' | 'value-asc';

const voValue = (v: VORecord) => v.value ?? v.rsgAssessment ?? v.costProposal ?? 0;

// Aconex is the system of record for submissions/correspondence. We surface the
// document references and deep-link out to the Aconex portal (docs live there).
const ACONEX_URL = 'https://login.aconex.com';

const expandContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const expandItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};

/**
 * Next-generation VO Log — fully self-contained and data-driven (no auth or
 * database dependency). Premium glass cards, animated KPIs, live filtering.
 */
export function VOLogPremium() {
  const { askAssistant } = useWorkspace();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<VOStatusKey | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('recent');
  const [expanded, setExpanded] = useState<number | null>(null);

  const breakdown = useMemo(() => voStatusBreakdown(), []);
  const totalValue = useMemo(() => variationOrders.reduce((n, v) => n + voValue(v), 0), []);
  const approvedValue = useMemo(
    () =>
      variationOrders
        .filter((v) => ['DVORRIssued', 'DVOIssued', 'ApprovedPendingDVO'].includes(statusKeyOf(v)))
        .reduce((n, v) => n + voValue(v), 0),
    [],
  );
  const pendingCount = useMemo(
    () => variationOrders.filter((v) => statusConfigOf(v).bucket === 'pending').length,
    [],
  );

  const rows = useMemo(() => {
    let list = [...variationOrders];
    if (active !== 'all') list = list.filter((v) => statusKeyOf(v) === active);
    const q = query.toLowerCase().trim();
    if (q) {
      list = list.filter((v) =>
        `${v.voNumber ?? ''} ${v.subject} ${v.assignedTo ?? ''} ${v.submissionRef ?? ''}`
          .toLowerCase()
          .includes(q),
      );
    }
    list.sort((a, b) => {
      if (sort === 'value-desc') return voValue(b) - voValue(a);
      if (sort === 'value-asc') return voValue(a) - voValue(b);
      const da = new Date(a.dateIn ?? a.submissionDate ?? 0).getTime();
      const db = new Date(b.dateIn ?? b.submissionDate ?? 0).getTime();
      return db - da;
    });
    return list;
  }, [query, active, sort]);

  const kpis = [
    { label: 'Total Variations', value: variationOrders.length, mode: 'plain' as const, hint: `${breakdown.length} statuses` },
    { label: 'Approved Value', value: approvedValue, mode: 'compact' as const, hint: 'DVO + approved' },
    { label: 'Pending Action', value: pendingCount, mode: 'plain' as const, hint: 'awaiting RSG / FFC' },
    { label: 'Submitted Exposure', value: commercialSummary.totalSubmittedVOValue, mode: 'compact' as const, hint: 'total VO value' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-rsg-navy via-rsg-blue to-emerald-950 p-6 text-white shadow-2xl sm:p-7 dark:from-zinc-900 dark:via-zinc-900 dark:to-black"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-rsg-gold/20 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <ClipboardList className="h-3.5 w-3.5 text-rsg-gold" /> Variation Order Log
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">HW2 MEP Variations</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-white/70">
              <Building2 className="h-3.5 w-3.5" /> {commercialSummary.project} · {commercialSummary.contractor}
            </p>
          </div>
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

      {/* Live status summary */}
      <VoStatusSummary />

      {/* Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip label="All" count={variationOrders.length} active={active === 'all'} onClick={() => setActive('all')} />
          {VO_STATUS_ORDER.map((key) => {
            const agg = breakdown.find((b) => b.key === key);
            if (!agg) return null;
            return (
              <Chip
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
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search variations…"
              className="w-full rounded-xl border border-slate-200 bg-white/70 py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-rsg-navy/40 dark:border-white/10 dark:bg-white/5 dark:focus:border-rsg-gold/40 lg:w-56"
            />
          </div>
          <button
            onClick={() => setSort((s) => (s === 'value-desc' ? 'value-asc' : s === 'value-asc' ? 'recent' : 'value-desc'))}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-rsg-navy/40 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
            title="Toggle sort"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sort === 'recent' ? 'Recent' : sort === 'value-desc' ? 'Value ↓' : 'Value ↑'}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        <p className="px-1 text-xs text-slate-400">{rows.length} variations</p>
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/60 bg-white/40 py-16 text-slate-400 dark:border-white/10 dark:bg-white/[0.02]">
            <Filter className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm">No variations match your filters.</p>
          </div>
        ) : (
          rows.map((vo, i) => {
            const cfg = statusConfigOf(vo);
            const val = voValue(vo);
            const isOpen = expanded === vo.sno;
            return (
              <motion.div
                key={vo.sno}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.4) }}
                layout
              >
                <div
                  className={cn(
                    'group relative overflow-hidden rounded-2xl border bg-white/70 backdrop-blur-xl transition-all duration-300 dark:bg-white/[0.03]',
                    isOpen ? 'border-rsg-navy/30 shadow-lg dark:border-rsg-gold/30' : 'border-slate-200/70 hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:hover:border-white/20',
                  )}
                >
                  <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: cfg.hex }} />
                  <button
                    onClick={() => setExpanded(isOpen ? null : vo.sno)}
                    className="flex w-full items-center gap-3 px-4 py-3 pl-5 text-left"
                  >
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="shrink-0 text-slate-400">
                      <ChevronDown className="h-4 w-4" />
                    </motion.span>
                    <div className="grid flex-1 grid-cols-12 items-center gap-3">
                      <div className="col-span-12 sm:col-span-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-400">{vo.voNumber ?? `#${vo.sno}`}</span>
                          <span className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: `${cfg.hex}1a`, color: cfg.hex }}>
                            {vo.type}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-sm font-medium text-slate-800 dark:text-zinc-100">{vo.subject}</p>
                      </div>
                      <div className="col-span-6 hidden text-xs text-slate-400 sm:col-span-3 sm:flex sm:items-center sm:gap-1.5">
                        <CalendarDays className="h-3 w-3" /> {formatDateShort(vo.dateIn)}
                      </div>
                      <div className="col-span-6 text-right sm:col-span-2">
                        <span className={cn('text-sm font-semibold', val < 0 ? 'text-rose-500' : 'text-slate-800 dark:text-zinc-100')}>
                          {formatCompact(val)}
                        </span>
                      </div>
                      <div className="col-span-6 flex justify-end sm:col-span-1">
                        <span className="hidden h-2.5 w-2.5 rounded-full sm:block" style={{ backgroundColor: cfg.hex }} title={cfg.label} />
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
                        <motion.div
                          variants={expandContainer}
                          initial="hidden"
                          animate="show"
                          className="grid grid-cols-1 gap-3 p-4 pl-5 md:grid-cols-3"
                        >
                          <motion.div variants={expandItem}>
                            <Detail title="Financials" tint="#10b981">
                              <Row k="Cost Proposal" v={formatSAR(vo.costProposal)} />
                              <Row k="RSG Assessment" v={formatSAR(vo.rsgAssessment)} />
                              <Row k="Final Value" v={formatSAR(vo.value)} strong />
                            </Detail>
                          </motion.div>
                          <motion.div variants={expandItem}>
                            <Detail title="References" tint="#3b82f6">
                              <Row k="Submission" v={vo.submissionRef ?? '—'} mono />
                              <Row k="Response" v={vo.responseRef ?? '—'} mono />
                              <Row k="VOR" v={vo.vor ?? '—'} mono />
                              <Row k="DVO" v={vo.dvoRef ?? '—'} mono />
                            </Detail>
                          </motion.div>
                          <motion.div variants={expandItem}>
                            <Detail title="Status & Owner" tint={cfg.hex}>
                              <Row k="Status" v={cfg.label} />
                              <Row k="Type" v={vo.type} />
                              <Row k="Assigned" v={vo.assignedTo ?? '—'} />
                              <Row k="Logged" v={formatDateShort(vo.dateIn)} />
                              <Row k="Submitted" v={formatDateShort(vo.submissionDate)} />
                            </Detail>
                          </motion.div>

                          {/* Documents & Aconex links */}
                          <motion.div
                            variants={expandItem}
                            className="md:col-span-3 rounded-xl border border-blue-200/50 bg-blue-50/40 p-3 dark:border-blue-500/15 dark:bg-blue-500/[0.04]"
                          >
                            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                              <Link2 className="h-3.5 w-3.5" /> Documents &amp; Aconex
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {vo.submissionRef && <AconexLink label="View Submission" reference={vo.submissionRef} />}
                              {vo.responseRef && <AconexLink label="View Response" reference={vo.responseRef} />}
                              {vo.vor && <AconexLink label="View VOR" reference={vo.vor} />}
                              {vo.dvoRef && <AconexLink label="View DVO" reference={vo.dvoRef} />}
                              <a
                                href={ACONEX_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-1.5 rounded-lg bg-rsg-navy px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-rsg-gold dark:text-zinc-900"
                              >
                                <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
                                Open in Aconex
                              </a>
                            </div>
                          </motion.div>

                          {(vo.ffcRemarks || vo.rsgRemarks) && (
                            <motion.div variants={expandItem} className="md:col-span-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                              {vo.ffcRemarks && <Remark label="FFC Remarks" text={vo.ffcRemarks} />}
                              {vo.rsgRemarks && <Remark label="RSG Remarks" text={vo.rsgRemarks} />}
                            </motion.div>
                          )}
                          <motion.div variants={expandItem} className="md:col-span-3 flex flex-wrap gap-2 pt-1">
                            <button
                              onClick={() => askAssistant(`${vo.voNumber ?? vo.subject}`)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-rsg-navy/10 px-3 py-1.5 text-xs font-medium text-rsg-navy transition-colors hover:bg-rsg-navy/15 dark:bg-rsg-gold/10 dark:text-rsg-gold"
                            >
                              <TrendingUp className="h-3.5 w-3.5" /> Ask AI about this VO
                            </button>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Chip({ label, count, active, onClick, hex }: { label: string; count: number; active: boolean; onClick: () => void; hex?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
        active
          ? 'border-transparent bg-rsg-navy text-white shadow-sm dark:bg-rsg-gold dark:text-zinc-900'
          : 'border-slate-200 bg-white/60 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300',
      )}
    >
      {hex && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: hex }} />}
      {label}
      <span className={cn('rounded-full px-1.5 text-[10px]', active ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/10')}>{count}</span>
    </button>
  );
}

function Detail({ title, tint, children }: { title: string; tint: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-white/50 p-3 dark:border-white/5 dark:bg-white/[0.02]">
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: tint }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tint }} /> {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ k, v, strong, mono }: { k: string; v: string; strong?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-slate-400">{k}</span>
      <span className={cn('truncate text-right', mono && 'font-mono text-[10px]', strong ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-zinc-300')}>
        {v}
      </span>
    </div>
  );
}

function Remark({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-white/50 p-3 dark:border-white/5 dark:bg-white/[0.02]">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-300">{text}</p>
    </div>
  );
}

function AconexLink({ label, reference }: { label: string; reference: string }) {
  return (
    <a
      href={ACONEX_URL}
      target="_blank"
      rel="noopener noreferrer"
      title={`Open in Aconex — ${reference}`}
      className="group inline-flex items-center gap-1.5 rounded-lg border border-blue-200/70 bg-blue-50/70 px-3 py-1.5 text-xs font-medium text-blue-700 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 hover:shadow-sm dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
    >
      <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
      {label}
      <span className="font-mono text-[10px] opacity-60">{reference}</span>
    </a>
  );
}
