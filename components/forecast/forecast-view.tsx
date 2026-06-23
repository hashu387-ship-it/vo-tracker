'use client';

import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { TrendingUp, Gauge, CalendarClock, Target } from 'lucide-react';
import { finalAccountForecast, cashflowForecast } from '@/lib/data/forecast';
import { commercialSummary, formatCompact } from '@/lib/data/commercial';

const BRONZE = '#9E875D';
const CHARCOAL = '#2D3436';
const TAN = '#CBB78C';

const fM = (n: number | null | undefined) =>
  n == null ? '—' : `SAR ${(n / 1_000_000).toFixed(1)}M`;

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="liquid-glass-strong rounded-xl px-3 py-2 text-[12px]">
      <div className="mb-1 font-semibold text-foreground">{label}</div>
      {payload
        .filter((p: any) => p.value != null)
        .map((p: any) => (
          <div key={p.name} className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            {p.name}: <span className="font-medium text-foreground">{fM(p.value)}</span>
          </div>
        ))}
    </div>
  );
}

export function ForecastView() {
  const fa = finalAccountForecast();
  const { points, monthlyRate } = cashflowForecast(6);

  const outturnBars = [
    { name: 'Current', value: fa.current, color: CHARCOAL },
    { name: 'Conservative', value: fa.low, color: TAN },
    { name: 'Expected', value: fa.expected, color: BRONZE },
    { name: 'Optimistic', value: fa.high, color: '#B89B6A' },
  ];

  const kpis = [
    { icon: Target, label: 'Projected Outturn', value: fM(fa.expected), sub: `range ${fM(fa.low)}–${fM(fa.high)}` },
    { icon: TrendingUp, label: 'Pipeline Uplift', value: fM(fa.pipelineExpected), sub: 'expected from pending VOs' },
    { icon: Gauge, label: 'Approval Velocity', value: `${fM(fa.approvalVelocity)}/mo`, sub: 'recent VO approval rate' },
    { icon: CalendarClock, label: 'Est. Pipeline Clearance', value: `${fa.monthsToClose} mo`, sub: 'to clear pending VOs' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-bronze">
          Predictive Analytics
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Final Account Forecast
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Outturn cost and a 6-month cash-flow trajectory projected from VO approval velocity and
          the recent certification rate — {commercialSummary.projectName}.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 26 }}
            className="liquid-glass rounded-3xl p-5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-bronze/12 text-bronze">
              <k.icon className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <div className="mt-3 text-2xl font-semibold text-foreground">{k.value}</div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {k.label}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground/80">{k.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Cash-flow projection */}
      <div className="liquid-glass rounded-3xl p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Cash-flow trajectory · next 6 months</h2>
          <span className="text-[12px] text-muted-foreground">~{fM(monthlyRate)}/mo certified</span>
        </div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={points} margin={{ top: 10, right: 12, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRONZE} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={BRONZE} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TAN} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={TAN} stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHARCOAL} strokeOpacity={0.08} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: CHARCOAL }} tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                tick={{ fontSize: 11, fill: CHARCOAL }}
                tickLine={false}
                axisLine={false}
                width={38}
              />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine
                y={commercialSummary.revisedContract}
                stroke={CHARCOAL}
                strokeDasharray="4 4"
                strokeOpacity={0.5}
                label={{ value: 'Contract', fontSize: 10, fill: CHARCOAL, position: 'insideTopRight' }}
              />
              <Area type="monotone" dataKey="high" name="Optimistic" stroke="none" fill="url(#bandFill)" />
              <Area type="monotone" dataKey="actual" name="Actual (work done)" stroke={BRONZE} strokeWidth={2.5} fill="url(#actualFill)" />
              <Line type="monotone" dataKey="forecast" name="Forecast" stroke={CHARCOAL} strokeWidth={2.5} strokeDasharray="5 4" dot={false} />
              <Line type="monotone" dataKey="low" name="Conservative" stroke={TAN} strokeWidth={1.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Outturn scenarios */}
      <div className="liquid-glass rounded-3xl p-5 md:p-6">
        <h2 className="mb-1 text-lg font-semibold text-foreground">Final account outturn scenarios</h2>
        <p className="mb-4 text-[13px] text-muted-foreground">
          Current revised contract vs. projected outturn once pending VOs resolve (probability-weighted by status).
        </p>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={outturnBars} margin={{ top: 10, right: 12, bottom: 0, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHARCOAL} strokeOpacity={0.08} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: CHARCOAL }} tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                tick={{ fontSize: 11, fill: CHARCOAL }}
                tickLine={false}
                axisLine={false}
                width={38}
                domain={[commercialSummary.originalContract * 0.98, 'auto']}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: BRONZE, fillOpacity: 0.06 }} />
              <Bar dataKey="value" name="Outturn" radius={[8, 8, 0, 0]}>
                {outturnBars.map((b) => (
                  <Cell key={b.name} fill={b.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
