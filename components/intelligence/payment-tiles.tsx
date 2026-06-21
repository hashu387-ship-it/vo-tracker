'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Download,
  Loader2,
  CheckCircle2,
  Search,
  ArrowUpDown,
  LineChart as LineIcon,
  BarChart3,
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
import { exportPaymentsToExcel } from '@/lib/excel-export';
import { CountUp } from '@/components/ui/count-up';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { SCurveChart, PaymentNetBars } from '@/components/intelligence/charts';
import { IpaSummary } from '@/components/intelligence/summaries';
import { cn } from '@/lib/utils';

const STATE_ORDER = ['received', 'approved', 'submitted', 'review', 'draft'] as const;
type SortKey = 'order' | 'net' | 'gross';

/**
 * Payment Applications mini-dashboard on the Command Center: headline info
 * cards + clear graphs above the table, with search / status filter / sort and
 * a one-click Excel export. Self-contained / data-driven.
 */
export function PaymentTiles() {
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sort, setSort] = useState<SortKey>('order');

  const s = commercialSummary;
  const totals = useMemo(
    () =>
      payments.reduce(
        (a, p) => ({
          gross: a.gross + (p.gross ?? 0),
          net: a.net + (p.net ?? 0),
          received: a.received + (p.received ?? 0),
        }),
        { gross: 0, net: 0, received: 0 },
      ),
    [],
  );

  const stateCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of payments) {
      const k = paymentState(p);
      m[k] = (m[k] ?? 0) + 1;
    }
    return m;
  }, []);

  const rows = useMemo(() => {
    const q = query.toLowerCase().trim();
    let list = payments.filter((p) => {
      const matchesStatus = statusFilter === 'all' || paymentState(p) === statusFilter;
      const matchesSearch =
        !q || `${p.no} ${p.description} ${p.approvalStatus}`.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
    if (sort === 'net') list = [...list].sort((a, b) => (b.net ?? 0) - (a.net ?? 0));
    else if (sort === 'gross') list = [...list].sort((a, b) => (b.gross ?? 0) - (a.gross ?? 0));
    return list;
  }, [query, statusFilter, sort]);

  const infoCards = [
    { label: 'Original Contract', value: s.originalContract, caption: 'baseline' },
    { label: 'Revised Contract', value: s.revisedContract, caption: `${formatPct(s.variancePct)} vs original` },
    { label: 'Work Done', value: s.totalClaimedGross, caption: `${formatPct(s.workDonePct)} complete` },
    { label: 'Cash Received', value: s.received, caption: `${formatPct(s.receivedPct)} of contract` },
    { label: 'Net Paid', value: totals.net, caption: `${payments.length} applications` },
    { label: 'Retention Held', value: s.totalRetention, caption: `${formatPct(s.retentionPct)} retention` },
    { label: 'Advance Recovered', value: s.advanceDeducted, caption: `of ${formatCompact(s.totalAdvance)}` },
    { label: 'Balance to Complete', value: s.balanceToComplete, caption: 'remaining to bill' },
  ];

  const handleExport = async () => {
    setExporting(true);
    setDone(false);
    try {
      const mapped = payments.map((p) => ({
        paymentNo: p.no,
        description: p.description,
        grossAmount: p.gross ?? 0,
        advancePaymentRecovery: p.advanceRecovery ?? 0,
        retention: p.retention ?? 0,
        vatRecovery: p.vatRecovery ?? 0,
        vat: p.vat ?? 0,
        netPayment: p.net ?? 0,
        paymentStatus: p.status,
        approvalStatus: p.approvalStatus,
        submittedDate: p.submittedDate,
        invoiceDate: p.invoiceDate,
      }));
      await exportPaymentsToExcel(mapped as any, { filename: `Payment_Register_${commercialSummary.project}` });
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } catch (e) {
      console.error('Excel export failed', e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="lg:col-span-3 space-y-4">
      {/* Section header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rsg-navy/5 text-rsg-navy dark:bg-rsg-gold/10 dark:text-rsg-gold">
            <Wallet className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Payment Applications</h2>
            <p className="text-xs text-slate-400">
              All {payments.length} interim applications · {formatCompact(totals.gross)} certified · {formatCompact(totals.received)} received
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-all',
            done
              ? 'bg-emerald-600 text-white'
              : 'bg-rsg-navy text-white hover:-translate-y-0.5 hover:shadow-md dark:bg-rsg-gold dark:text-zinc-900',
            exporting && 'opacity-70',
          )}
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : done ? <CheckCircle2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
          {exporting ? 'Exporting…' : done ? 'Downloaded' : 'Export Excel'}
        </button>
      </div>

      {/* Live IPA summary (status + advance recovery + retention) */}
      <IpaSummary />

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {infoCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
            <SpotlightCard className="h-full p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-400">{c.label}</p>
              <p className="mt-1.5 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                <CountUp value={c.value} mode="compact" />
              </p>
              <p className="mt-1 text-[11px] text-slate-400">{c.caption}</p>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>

      {/* Graphs above the table */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <GraphCard icon={LineIcon} title="Cumulative Cashflow" subtitle="Gross certified vs cash received">
          <div className="h-56 text-slate-400">
            <SCurveChart />
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
            <Legend color="#0ea5e9" label="Certified" />
            <Legend color="#10b981" label="Received" />
          </div>
        </GraphCard>
        <GraphCard icon={BarChart3} title="Net Payment per Application" subtitle="Each interim application, coloured by status">
          <div className="h-56 text-slate-400">
            <PaymentNetBars />
          </div>
        </GraphCard>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterChip label="All" count={payments.length} active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
          {STATE_ORDER.filter((k) => stateCounts[k]).map((k) => (
            <FilterChip
              key={k}
              label={PAYMENT_STATE_CONFIG[k].label}
              count={stateCounts[k]}
              hex={PAYMENT_STATE_CONFIG[k].hex}
              active={statusFilter === k}
              onClick={() => setStatusFilter(statusFilter === k ? 'all' : k)}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search applications…"
              className="w-full rounded-xl border border-slate-200 bg-white/70 py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-rsg-navy/40 dark:border-white/10 dark:bg-white/5 dark:focus:border-rsg-gold/40 lg:w-52"
            />
          </div>
          <button
            onClick={() => setSort((p) => (p === 'order' ? 'net' : p === 'net' ? 'gross' : 'order'))}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-rsg-navy/40 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
            title="Toggle sort"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sort === 'order' ? 'Order' : sort === 'net' ? 'Net ↓' : 'Gross ↓'}
          </button>
        </div>
      </div>

      {/* Tiles */}
      <p className="px-1 text-xs text-slate-400">{rows.length} applications</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {rows.map((p, i) => (
            <PaymentTile key={p.no} p={p} index={i} />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

function GraphCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: any;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rsg-navy/5 text-rsg-navy dark:bg-rsg-gold/10 dark:text-rsg-gold">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-[11px] text-slate-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
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
      <span className={cn('rounded-full px-1.5 text-[10px]', active ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/10')}>{count}</span>
    </button>
  );
}

function PaymentTile({ p, index }: { p: PaymentRecord; index: number }) {
  const cfg = PAYMENT_STATE_CONFIG[paymentState(p)];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: Math.min(index * 0.015, 0.3) }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm backdrop-blur-xl transition-shadow hover:shadow-lg dark:border-white/10 dark:bg-white/[0.05]"
    >
      <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: cfg.hex }} />

      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">{p.no}</p>
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-400" title={p.description}>
            {p.description}
          </p>
        </div>
        <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: `${cfg.hex}1a`, color: cfg.hex }}>
          {cfg.label}
        </span>
      </div>

      <div className="mb-3 rounded-xl bg-emerald-50/60 px-3 py-2 dark:bg-emerald-500/10">
        <p className="text-[10px] uppercase tracking-wide text-emerald-700/70 dark:text-emerald-300/70">Net Payment</p>
        <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{formatSAR(p.net)}</p>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
        <Field k="Gross Certified" v={formatSAR(p.gross)} tone="blue" />
        <Field k="Cumulative" v={formatSAR(p.cumulative)} />
        <Field k="Advance Recovery" v={formatSAR(p.advanceRecovery)} tone="neg" />
        <Field k="Retention" v={formatSAR(p.retention)} tone="neg" />
        <Field k="VAT Recovery" v={formatSAR(p.vatRecovery)} tone="neg" />
        <Field k="VAT (15%)" v={formatSAR(p.vat)} />
        <Field k="Received" v={formatSAR(p.received)} tone="pos" />
        <Field k="Approval" v={p.approvalStatus || '—'} />
        <Field k="Submitted" v={formatDateShort(p.submittedDate)} />
        <Field k="Tax Invoice" v={formatDateShort(p.invoiceDate)} />
        <Field k="Due" v={formatDateShort(p.dueDate)} />
        <Field k="Status" v={p.status} />
      </div>
    </motion.div>
  );
}

function Field({ k, v, tone }: { k: string; v: string; tone?: 'neg' | 'pos' | 'blue' }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] uppercase tracking-wide text-slate-400">{k}</span>
      <span
        className={cn(
          'truncate font-medium',
          tone === 'neg'
            ? 'text-rose-500'
            : tone === 'pos'
              ? 'text-emerald-600 dark:text-emerald-400'
              : tone === 'blue'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-700 dark:text-zinc-200',
        )}
        title={v}
      >
        {v}
      </span>
    </div>
  );
}
