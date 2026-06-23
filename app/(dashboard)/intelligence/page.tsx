'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Sparkles, Bot, FileBarChart, TrendingUp, Activity, PieChart as PieIcon, LineChart } from 'lucide-react';
import { useWorkspace } from '@/components/providers/workspace-provider';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { TiltCard } from '@/components/ui/tilt-card';
import { KpiCard, ProgressRing, InsightsPanel, VoTimeline } from '@/components/intelligence/widgets';
import { CashflowForecastChart, SCurveChart, VoStatusDonut } from '@/components/intelligence/charts';
import { PaymentTiles } from '@/components/intelligence/payment-tiles';
import {
  commercialSummary,
  headlineKpis,
  voStatusBreakdown,
  formatCompact,
  formatSAR,
} from '@/lib/data/commercial';
import { cn } from '@/lib/utils';

const Hero3D = dynamic(() => import('@/components/intelligence/hero-3d').then((m) => m.Hero3D), {
  ssr: false,
});

export default function IntelligencePage() {
  const { askAssistant } = useWorkspace();
  const kpis = headlineKpis();
  const breakdown = voStatusBreakdown();
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const s = commercialSummary;

  return (
    <div className="space-y-6 pb-10">
      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/15 p-6 text-white shadow-liquid sm:p-8"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero/redsea-1.jpg" alt="Red Sea project" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-rsg-navy/92 via-rsg-blue/82 to-stone-900/94 dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-black/96" />
        <Hero3D />
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-rsg-gold/22 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-tan/25 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-rsg-gold" />
              Commercial Intelligence · Command Center
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{s.projectName}</h1>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              {s.project} · {s.contractor} · {s.client}. Live commercial position across{' '}
              {breakdown.reduce((n, b) => n + b.count, 0)} variation orders and the full payment register.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <MagneticButton
              onClick={() => askAssistant('Give me a commercial status report')}
              className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-rsg-navy shadow-lg"
            >
              <FileBarChart className="mr-2 h-4 w-4" /> Generate report
            </MagneticButton>
            <MagneticButton
              onClick={() => askAssistant('')}
              className="rounded-2xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm"
            >
              <Bot className="mr-2 h-4 w-4" /> Ask AI
            </MagneticButton>
          </div>
        </div>
      </motion.header>

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, i) => (
          <KpiCard key={kpi.id} kpi={kpi} index={i} />
        ))}
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Cashflow + forecast — wide */}
        <Panel
          className="lg:col-span-2"
          icon={TrendingUp}
          title="Cashflow & Forecast"
          subtitle="Net certified per interim application with a 4-period projection"
          delay={0.1}
        >
          <div className="h-72 text-slate-400">
            <CashflowForecastChart />
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
            <Legend color="#3b82f6" label="Net certified" />
            <Legend color="#C5A065" label="Forecast (trend)" dashed />
          </div>
        </Panel>

        {/* VO donut */}
        <Panel icon={PieIcon} title="Variation Orders" subtitle="By status · click to focus" delay={0.16}>
          <div className="relative h-48">
            <VoStatusDonut mode="count" onSelect={setActiveStatus} active={activeStatus} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {breakdown.reduce((n, b) => n + b.count, 0)}
              </span>
              <span className="text-[11px] uppercase tracking-wide text-slate-400">Total VOs</span>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            {breakdown.map((b) => (
              <button
                key={b.key}
                onClick={() => setActiveStatus(activeStatus === b.key ? null : b.key)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-xs transition-colors',
                  activeStatus === b.key ? 'bg-slate-100 dark:bg-white/5' : 'hover:bg-slate-50 dark:hover:bg-white/[0.03]',
                )}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: b.config.hex }} />
                <span className="flex-1 truncate text-slate-600 dark:text-zinc-300">{b.config.label}</span>
                <span className="font-medium text-slate-400">{b.count}</span>
                <span className="w-16 text-right font-semibold text-slate-700 dark:text-zinc-200">
                  {formatCompact(b.value)}
                </span>
              </button>
            ))}
          </div>
        </Panel>

        {/* S-curve — wide */}
        <Panel
          className="lg:col-span-2"
          icon={LineChart}
          title="Cumulative S-Curve"
          subtitle="Gross certified vs cash received over the project timeline"
          delay={0.2}
        >
          <div className="h-64 text-slate-400">
            <SCurveChart />
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
            <Legend color="#0ea5e9" label="Cumulative certified" />
            <Legend color="#10b981" label="Cumulative received" />
          </div>
        </Panel>

        {/* Progress rings */}
        <Panel icon={Activity} title="Completion & Recovery" subtitle="Headline contract ratios" delay={0.24}>
          <div className="grid grid-cols-1 gap-5 py-2 sm:grid-cols-1">
            <ProgressRing
              label="Work Completed"
              pct={s.workDonePct}
              color="#0ea5e9"
              caption={`${formatCompact(s.totalClaimedGross)} of ${formatCompact(s.revisedContract)}`}
            />
            <div className="grid grid-cols-2 gap-2">
              <ProgressRing label="Advance Recovered" pct={s.advanceDeducted / s.totalAdvance} color="#8b5cf6" size={92} />
              <ProgressRing label="Retention Held" pct={s.retentionDeducted / s.totalRetention} color="#C5A065" size={92} />
            </div>
          </div>
        </Panel>

        {/* AI insights */}
        <Panel className="lg:col-span-2" icon={Sparkles} title="" subtitle="" delay={0.28} bare>
          <InsightsPanel />
        </Panel>

        {/* Timeline */}
        <Panel icon={Activity} title="Recent Activity" subtitle="Latest variation orders logged" delay={0.32}>
          <VoTimeline />
        </Panel>

        {/* Full payment register — cards, graphs, all tiles, Excel export */}
        <PaymentTiles />
      </div>

      {/* Footnote */}
      <p className="text-center text-xs text-slate-400">
        Figures computed live from the HW2 MEP Payment Register &amp; VO Log · Revised contract{' '}
        {formatSAR(s.revisedContract)} · {formatSAR(s.received)} received to date.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel wrapper                                                     */
/* ------------------------------------------------------------------ */

function Panel({
  children,
  title,
  subtitle,
  icon: Icon,
  className,
  delay = 0,
  bare = false,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  delay?: number;
  bare?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 110, damping: 18 }}
      className={cn('group', className)}
    >
      <TiltCard max={4} className="h-full" glare={false}>
        <div className="h-full rounded-2xl border border-white/40 bg-white/50 p-5 shadow-lg backdrop-blur-2xl transition-all duration-300 hover:bg-white/60 hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.05]">
          {!bare && (
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rsg-navy/5 text-rsg-navy dark:bg-rsg-gold/10 dark:text-rsg-gold">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
                {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
              </div>
            </div>
          )}
          {children}
        </div>
      </TiltCard>
    </motion.div>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={cn('inline-block h-0.5 w-4 rounded-full', dashed && 'opacity-80')}
        style={{ backgroundColor: color, backgroundImage: dashed ? `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 7px)` : undefined }}
      />
      {label}
    </span>
  );
}
