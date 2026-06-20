'use client';

import {
  Area,
  AreaChart,
  ComposedChart,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  cashflowSeries,
  forecastNet,
  voStatusBreakdown,
  formatCompact,
  formatSAR,
  type VOStatusAgg,
} from '@/lib/data/commercial';

/* ------------------------------------------------------------------ */
/*  Shared tooltip                                                    */
/* ------------------------------------------------------------------ */

function GlassTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-white/15 bg-white/90 px-3 py-2 text-xs shadow-xl backdrop-blur-xl dark:bg-zinc-900/90">
      {label != null && <p className="mb-1 font-semibold text-slate-700 dark:text-zinc-200">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
          {p.name}: <span className="font-medium text-slate-700 dark:text-zinc-200">{formatSAR(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

const axisProps = {
  tick: { fontSize: 10, fill: 'currentColor' },
  tickLine: false,
  axisLine: false,
} as const;

/* ------------------------------------------------------------------ */
/*  Cashflow + forecast                                               */
/* ------------------------------------------------------------------ */

export function CashflowForecastChart() {
  const forecast = forecastNet(4);
  // split into actual vs projected, bridging the last actual point
  const lastActualIdx = forecast.map((f) => f.forecast).lastIndexOf(false);
  const data = forecast.map((f, i) => ({
    label: f.label,
    actual: f.forecast ? null : f.net,
    projected: f.forecast || i === lastActualIdx ? f.net : null,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} className="text-slate-400">
        <defs>
          <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} vertical={false} />
        <XAxis dataKey="label" {...axisProps} interval={1} />
        <YAxis {...axisProps} tickFormatter={(v) => formatCompact(v).replace('SAR ', '')} width={48} />
        <Tooltip content={<GlassTooltip />} cursor={{ fill: 'currentColor', fillOpacity: 0.04 }} />
        <Area type="monotone" dataKey="actual" name="Net certified" stroke="#3b82f6" strokeWidth={2.5} fill="url(#netFill)" connectNulls />
        <Line
          type="monotone"
          dataKey="projected"
          name="Forecast"
          stroke="#C5A065"
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={{ r: 3, fill: '#C5A065' }}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  Cumulative S-curve                                                */
/* ------------------------------------------------------------------ */

export function SCurveChart() {
  const data = cashflowSeries().map((p) => ({
    label: p.label,
    Certified: Math.round(p.cumulativeGross),
    Received: Math.round(p.cumulativeReceived),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} className="text-slate-400">
        <defs>
          <linearGradient id="certFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#002D56" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#002D56" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="recvFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} vertical={false} />
        <XAxis dataKey="label" {...axisProps} interval={2} />
        <YAxis {...axisProps} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} width={40} />
        <Tooltip content={<GlassTooltip />} />
        <Area type="monotone" dataKey="Certified" stroke="#0ea5e9" strokeWidth={2} fill="url(#certFill)" />
        <Area type="monotone" dataKey="Received" stroke="#10b981" strokeWidth={2} fill="url(#recvFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  VO status donut                                                   */
/* ------------------------------------------------------------------ */

export function VoStatusDonut({
  mode = 'count',
  onSelect,
  active,
}: {
  mode?: 'count' | 'value';
  onSelect?: (key: string | null) => void;
  active?: string | null;
}) {
  const breakdown = voStatusBreakdown();
  const data = breakdown.map((b: VOStatusAgg) => ({
    name: b.config.label,
    key: b.key,
    value: mode === 'count' ? b.count : Math.abs(b.value),
    hex: b.config.hex,
    raw: b,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius="62%"
          outerRadius="92%"
          paddingAngle={2}
          stroke="none"
          onClick={(d: any) => onSelect?.(active === d?.key ? null : d?.key)}
        >
          {data.map((d) => (
            <Cell
              key={d.key}
              fill={d.hex}
              opacity={active && active !== d.key ? 0.3 : 1}
              style={{ cursor: onSelect ? 'pointer' : 'default', outline: 'none' }}
            />
          ))}
        </Pie>
        <Tooltip
          content={({ active: a, payload }: any) => {
            if (!a || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="rounded-xl border border-white/15 bg-white/90 px-3 py-2 text-xs shadow-xl backdrop-blur-xl dark:bg-zinc-900/90">
                <p className="font-semibold text-slate-700 dark:text-zinc-200">{d.name}</p>
                <p className="text-slate-500 dark:text-zinc-400">
                  {d.raw.count} VOs · {formatCompact(d.raw.value)}
                </p>
              </div>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
