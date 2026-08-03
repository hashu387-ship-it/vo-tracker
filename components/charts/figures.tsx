'use client';

import * as React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartFrame, ChartTooltip, type SeriesKey } from '@/components/charts/chart-frame';
import { statusColour, useChartTheme } from '@/components/charts/theme';
import type { AgeingBucket, CashflowPoint, ForecastResult } from '@/lib/domain/calc';
import { compactMoney, money, percent } from '@/lib/domain/money';
import {
  PAYMENT_STATUS_META,
  VARIATION_STATUS_META,
  type PaymentStatus,
  type VariationStatus,
} from '@/lib/domain/types';

const AXIS_TICK = { fontSize: 11 };

/** Chart categories carry a "#sequence" suffix to stay unique; never show it. */
const displayRef = (value: string | number) => String(value).split('#')[0];
const MARGIN = { top: 8, right: 12, bottom: 4, left: 4 };

/* ------------------------------------------------------------------ */
/* S-curve — certified vs collected                                    */
/* ------------------------------------------------------------------ */

export function CertifiedVsCollected({
  data,
  className,
}: {
  data: CashflowPoint[];
  className?: string;
}) {
  const theme = useChartTheme();
  const series: SeriesKey[] = [
    { key: 'cumulativeGross', label: 'Cumulative certified (gross)', colour: theme.series[0] },
    { key: 'cumulativeReceived', label: 'Cumulative cash received (net)', colour: theme.series[1] },
  ];

  return (
    <ChartFrame
      title="Certified vs collected"
      subtitle="Gross work certified against cash actually received, certificate by certificate"
      series={series}
      height={300}
      className={className}
      tableColumns={['Certificate', 'Cumulative certified', 'Cumulative received']}
      tableRows={data.map((point) => [
        point.certificate,
        money(point.cumulativeGross),
        money(point.cumulativeReceived),
      ])}
      footnote="Advance payments are financing, not measured work, so they are excluded from both curves."
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={MARGIN}>
          <defs>
            <linearGradient id="certifiedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.series[0]} stopOpacity={0.22} />
              <stop offset="100%" stopColor={theme.series[0]} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="key"
            tickFormatter={displayRef}
            tick={AXIS_TICK}
            stroke={theme.axis}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tick={AXIS_TICK}
            stroke={theme.axis}
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={(value: number) => compactMoney(value, 0)}
          />
          <Tooltip
            cursor={{ stroke: theme.axis, strokeWidth: 1, strokeDasharray: '3 3' }}
            content={
              <ChartTooltip formatter={(value) => money(value)} labelFormatter={displayRef} />
            }
          />
          <Area
            type="monotone"
            dataKey="cumulativeGross"
            name="Cumulative certified"
            stroke={theme.series[0]}
            strokeWidth={2}
            fill="url(#certifiedFill)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="cumulativeReceived"
            name="Cumulative received"
            stroke={theme.series[1]}
            strokeWidth={2}
            fill="none"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Gross certified per certificate                                     */
/* ------------------------------------------------------------------ */

export function CertifiedPerPeriod({ data }: { data: CashflowPoint[] }) {
  const theme = useChartTheme();

  return (
    <ChartFrame
      title="Certified value per certificate"
      subtitle="Monthly gross measured work — the run rate the forecast is built on"
      height={260}
      tableColumns={['Certificate', 'Gross certified', 'Status']}
      tableRows={data.map((point) => [
        point.certificate,
        money(point.gross),
        PAYMENT_STATUS_META[point.status].label,
      ])}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={MARGIN} barCategoryGap="18%">
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="key"
            tickFormatter={displayRef}
            tick={AXIS_TICK}
            stroke={theme.axis}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={20}
          />
          <YAxis
            tick={AXIS_TICK}
            stroke={theme.axis}
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={(value: number) => compactMoney(value, 0)}
          />
          <Tooltip
            cursor={{ fill: theme.grid, fillOpacity: 0.35 }}
            content={
              <ChartTooltip formatter={(value) => money(value)} labelFormatter={displayRef} />
            }
          />
          <Bar dataKey="gross" name="Gross certified" radius={[4, 4, 0, 0]}>
            {data.map((point) => (
              <Cell
                key={point.key}
                fill={
                  point.status === 'received'
                    ? theme.series[0]
                    : statusColour(theme, PAYMENT_STATUS_META[point.status].tone)
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Variation status                                                    */
/* ------------------------------------------------------------------ */

export function VariationStatusChart({
  data,
  className,
}: {
  data: Array<{ status: VariationStatus; label: string; count: number; value: number }>;
  className?: string;
}) {
  const theme = useChartTheme();
  const rows = [...data].sort((a, b) => b.count - a.count);

  return (
    <ChartFrame
      className={className}
      title="Variations by status"
      subtitle="Where every submitted change currently sits"
      height={Math.max(200, rows.length * 38)}
      tableColumns={['Status', 'Count', 'Agreed value (SAR)']}
      tableRows={rows.map((row) => [row.label, row.count, money(row.value)])}
      footnote="Bars are counts. Values are shown in the table view — a status with two large VOs is not the same risk as one with twelve small ones."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ ...MARGIN, left: 8 }} barCategoryGap="24%">
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={AXIS_TICK} stroke={theme.axis} tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 11 }}
            stroke={theme.axis}
            tickLine={false}
            axisLine={false}
            width={150}
          />
          <Tooltip
            cursor={{ fill: theme.grid, fillOpacity: 0.35 }}
            content={
              <ChartTooltip
                formatter={(value, name) => (name === 'Count' ? String(value) : money(value))}
              />
            }
          />
          <Bar dataKey="count" name="Count" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 11, fill: theme.axis }}>
            {rows.map((row) => (
              <Cell key={row.status} fill={statusColour(theme, VARIATION_STATUS_META[row.status].tone)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Ageing of outstanding receivables                                   */
/* ------------------------------------------------------------------ */

export function AgeingChart({ data, className }: { data: AgeingBucket[]; className?: string }) {
  const theme = useChartTheme();
  const tones = ['good', 'warning', 'serious', 'critical'];
  const populated = data.some((bucket) => bucket.count > 0);

  return (
    <ChartFrame
      className={className}
      title="Ageing of uncollected certificates"
      subtitle="Certified value still outstanding, aged from the tax invoice date"
      height={230}
      tableColumns={['Bucket', 'Certificates', 'Outstanding (SAR)']}
      tableRows={data.map((bucket) => [bucket.label, bucket.count, money(bucket.value)])}
    >
      {populated ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={MARGIN} barCategoryGap="28%">
            <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={AXIS_TICK} stroke={theme.axis} tickLine={false} axisLine={false} />
            <YAxis
              tick={AXIS_TICK}
              stroke={theme.axis}
              tickLine={false}
              axisLine={false}
              width={52}
              tickFormatter={(value: number) => compactMoney(value, 0)}
            />
            <Tooltip
              cursor={{ fill: theme.grid, fillOpacity: 0.35 }}
              content={<ChartTooltip formatter={(value) => money(value)} />}
            />
            <Bar dataKey="value" name="Outstanding" radius={[4, 4, 0, 0]}>
              {data.map((bucket, index) => (
                <Cell key={bucket.label} fill={statusColour(theme, tones[index])} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Nothing outstanding — every certificate has been collected in full.
        </div>
      )}
    </ChartFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Forecast                                                            */
/* ------------------------------------------------------------------ */

export function ForecastChart({
  forecast,
  contractValue,
}: {
  forecast: ForecastResult;
  contractValue: number;
}) {
  const theme = useChartTheme();
  const data = forecast.projection.map((point) => ({
    label: point.label,
    actual: point.projected ? null : point.cumulative,
    projected: point.projected || point.label === forecast.projection.find((p) => p.projected)?.label
      ? point.cumulative
      : null,
    // Keep the two lines joined at the hand-over point.
    bridge: point.cumulative,
  }));

  // Join actual → projected without a gap.
  const lastActualIndex = forecast.projection.findIndex((point) => point.projected) - 1;
  if (lastActualIndex >= 0 && data[lastActualIndex]) {
    data[lastActualIndex].projected = data[lastActualIndex].bridge;
  }

  const series: SeriesKey[] = [
    { key: 'actual', label: 'Certified to date', colour: theme.series[0] },
    { key: 'projected', label: 'Projected at current run rate', colour: theme.series[2], dashed: true },
  ];

  return (
    <ChartFrame
      title="Completion projection"
      subtitle={`Run rate ${money(forecast.runRate)} per certificate, averaged over the last ${forecast.basisCount}`}
      series={series}
      height={300}
      tableColumns={['Point', 'Cumulative certified', 'Basis']}
      tableRows={forecast.projection.map((point) => [
        point.label,
        money(point.cumulative),
        point.projected ? 'Projected' : 'Actual',
      ])}
      footnote="A straight-line projection of the recent run rate. It assumes no further scope change and no suspension."
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={MARGIN}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tickFormatter={displayRef}
            tick={AXIS_TICK}
            stroke={theme.axis}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={22}
          />
          <YAxis
            tick={AXIS_TICK}
            stroke={theme.axis}
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={(value: number) => compactMoney(value, 0)}
          />
          <Tooltip
            cursor={{ stroke: theme.axis, strokeWidth: 1, strokeDasharray: '3 3' }}
            content={
              <ChartTooltip formatter={(value) => money(value)} labelFormatter={displayRef} />
            }
          />
          <ReferenceLine
            y={contractValue}
            stroke={theme.series[1]}
            strokeDasharray="5 4"
            strokeWidth={1.5}
            label={{
              value: `Revised contract ${compactMoney(contractValue)}`,
              position: 'insideTopRight',
              fontSize: 10,
              fill: theme.axis,
            }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Certified to date"
            stroke={theme.series[0]}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="projected"
            name="Projected"
            stroke={theme.series[2]}
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Deductions waterfall — gross → net                                  */
/* ------------------------------------------------------------------ */

/** The stacked "base" bar is invisible spacing, so show the signed delta only. */
function WaterfallTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: { label?: string; delta?: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[payload.length - 1]?.payload;
  if (!row) return null;
  return (
    <div className="pointer-events-none rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-pop">
      <p className="mb-0.5 font-medium text-foreground">{row.label}</p>
      <p className="tnum text-muted-foreground">{money(row.delta ?? 0)}</p>
    </div>
  );
}

export function DeductionsWaterfall({
  gross,
  advanceRecovery,
  retention,
  backCharge,
  vat,
  vatOnAdvance,
  net,
}: {
  gross: number;
  advanceRecovery: number;
  retention: number;
  backCharge: number;
  vat: number;
  vatOnAdvance: number;
  net: number;
}) {
  const theme = useChartTheme();

  const steps = [
    { label: 'Gross certified', delta: gross },
    { label: 'Advance recovery', delta: advanceRecovery },
    { label: 'Retention', delta: retention },
    { label: 'Back charge', delta: backCharge },
    { label: 'VAT on advance', delta: vatOnAdvance },
    { label: 'VAT 15%', delta: vat },
  ];

  let running = 0;
  const data = steps.map((step, index) => {
    const base = index === 0 ? 0 : running;
    running = Math.round((running + step.delta) * 100) / 100;
    return {
      label: step.label,
      base: step.delta >= 0 ? base : running,
      value: Math.abs(step.delta),
      delta: step.delta,
    };
  });
  data.push({ label: 'Net certified', base: 0, value: net, delta: net });

  return (
    <ChartFrame
      title="Gross to net bridge"
      subtitle="How measured work becomes payable value across the whole register"
      height={280}
      tableColumns={['Line', 'Amount (SAR)']}
      tableRows={[...steps.map((step) => [step.label, money(step.delta)]), ['Net certified', money(net)]]}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ ...MARGIN, bottom: 20 }} barCategoryGap="26%">
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10 }}
            stroke={theme.axis}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-16}
            textAnchor="end"
            height={52}
          />
          <YAxis
            tick={AXIS_TICK}
            stroke={theme.axis}
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={(value: number) => compactMoney(value, 0)}
          />
          <Tooltip cursor={{ fill: theme.grid, fillOpacity: 0.35 }} content={<WaterfallTooltip />} />
          <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} />
          <Bar dataKey="value" stackId="w" name="Amount" radius={[4, 4, 4, 4]}>
            {data.map((row, index) => (
              <Cell
                key={row.label}
                fill={
                  index === 0 || index === data.length - 1
                    ? theme.series[0]
                    : row.delta >= 0
                      ? theme.series[5]
                      : theme.series[3]
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Progress meter (not a chart — a stat)                               */
/* ------------------------------------------------------------------ */

export function ProgressRing({
  value,
  label,
  caption,
}: {
  value: number;
  label: string;
  caption?: string;
}) {
  const theme = useChartTheme();
  const clamped = Math.max(0, Math.min(1, value));
  const size = 132;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} role="img" aria-label={`${label}: ${percent(value)}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={theme.grid}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={theme.series[0]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.16,1,0.3,1)' }}
        />
        <text
          x="50%"
          y="47%"
          textAnchor="middle"
          className="tnum fill-foreground text-xl font-semibold"
          style={{ fontSize: 24 }}
        >
          {percent(value)}
        </text>
        <text
          x="50%"
          y="65%"
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          {label}
        </text>
      </svg>
      {caption ? <p className="text-center text-xs text-muted-foreground">{caption}</p> : null}
    </div>
  );
}

export function StatusStackedBar({
  segments,
}: {
  segments: Array<{ label: string; value: number; status: PaymentStatus | 'balance' }>;
}) {
  const theme = useChartTheme();
  const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0);
  if (total <= 0) return null;

  const colourFor = (status: PaymentStatus | 'balance') =>
    status === 'balance'
      ? theme.grid
      : statusColour(theme, PAYMENT_STATUS_META[status].tone);

  return (
    <div className="space-y-2">
      {/* 2px surface gaps between adjacent fills so segments never merge. */}
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full">
        {segments
          .filter((segment) => segment.value > 0)
          .map((segment) => (
            <div
              key={segment.label}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${(segment.value / total) * 100}%`,
                backgroundColor: colourFor(segment.status),
              }}
              title={`${segment.label}: ${money(segment.value)}`}
            />
          ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {segments
          .filter((segment) => segment.value > 0)
          .map((segment) => (
            <li key={segment.label} className="flex items-center gap-1.5 text-2xs">
              <span
                aria-hidden
                className="inline-block size-2 rounded-full"
                style={{ backgroundColor: colourFor(segment.status) }}
              />
              <span className="text-muted-foreground">{segment.label}</span>
              <span className="tnum font-medium">{compactMoney(segment.value)}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}
