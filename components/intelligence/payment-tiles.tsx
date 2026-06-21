'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Download, Loader2, CheckCircle2 } from 'lucide-react';
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
import { cn } from '@/lib/utils';

/**
 * Full payment register surfaced on the Command Center: every interim
 * application as a detailed tile (all headings + all values) with Excel export.
 * Self-contained / data-driven.
 */
export function PaymentTiles() {
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  const rows = useMemo(() => payments, []);
  const s = commercialSummary;
  const totals = useMemo(
    () =>
      rows.reduce(
        (a, p) => ({
          gross: a.gross + (p.gross ?? 0),
          net: a.net + (p.net ?? 0),
          received: a.received + (p.received ?? 0),
        }),
        { gross: 0, net: 0, received: 0 },
      ),
    [rows],
  );

  // Headline info cards (big numbers, in millions).
  const infoCards = [
    { label: 'Work Done', value: s.totalClaimedGross, caption: `${formatPct(s.workDonePct)} complete` },
    { label: 'Cash Received', value: s.received, caption: `${formatPct(s.receivedPct)} of contract` },
    { label: 'Revised Contract', value: s.revisedContract, caption: `${formatPct(s.variancePct)} vs original` },
    { label: 'Retention Held', value: s.totalRetention, caption: `${formatPct(s.retentionPct)} retention` },
    { label: 'Advance Recovered', value: s.advanceDeducted, caption: `of ${formatCompact(s.totalAdvance)}` },
    { label: 'Balance to Complete', value: s.balanceToComplete, caption: 'remaining to bill' },
  ];

  const handleExport = async () => {
    setExporting(true);
    setDone(false);
    try {
      const mapped = rows.map((p) => ({
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
      await exportPaymentsToExcel(mapped as any, {
        filename: `Payment_Register_${commercialSummary.project}`,
      });
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
            <Wallet className="h-4.5 w-4.5" />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Payment Applications</h2>
            <p className="text-xs text-slate-400">
              All {rows.length} interim applications · {formatCompact(totals.gross)} certified · {formatCompact(totals.received)} received
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
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : done ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {exporting ? 'Exporting…' : done ? 'Downloaded' : 'Export Excel'}
        </button>
      </div>

      {/* Headline info cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {infoCards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <SpotlightCard className="h-full p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-400">{c.label}</p>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                <CountUp value={c.value} mode="compact" />
              </p>
              <p className="mt-1 text-[11px] text-slate-400">{c.caption}</p>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((p, i) => (
          <PaymentTile key={p.no} p={p} index={i} />
        ))}
      </div>
    </section>
  );
}

function PaymentTile({ p, index }: { p: PaymentRecord; index: number }) {
  const cfg = PAYMENT_STATE_CONFIG[paymentState(p)];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: Math.min(index * 0.015, 0.4) }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm backdrop-blur-xl transition-shadow hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]"
    >
      <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: cfg.hex }} />

      {/* Tile header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">{p.no}</p>
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-400" title={p.description}>
            {p.description}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ backgroundColor: `${cfg.hex}1a`, color: cfg.hex }}
        >
          {cfg.label}
        </span>
      </div>

      {/* Net headline */}
      <div className="mb-3 rounded-xl bg-emerald-50/60 px-3 py-2 dark:bg-emerald-500/10">
        <p className="text-[10px] uppercase tracking-wide text-emerald-700/70 dark:text-emerald-300/70">Net Payment</p>
        <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{formatSAR(p.net)}</p>
      </div>

      {/* All headings / details */}
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
