'use client';

import * as React from 'react';

/**
 * Chart colours live as CSS variables so light and dark are two *selected* sets
 * of steps (see globals.css) rather than an automatic inversion. Recharts needs
 * literal colours, so read the computed values once per theme change.
 *
 * Both sets were run through the six-check palette validator:
 *   light (surface #FFFFFF) — lightness ✓ chroma ✓ CVD ΔE 15.2 ✓ normal ΔE 18.5 ✓ contrast ✓
 *   dark  (surface #101E26) — lightness ✓ chroma ✓ CVD ΔE 15.6 ✓ normal ΔE 19.0 ✓ contrast ✓
 */
const FALLBACK = {
  series: ['#00949e', '#b07a22', '#2f6bb0', '#b24a3f', '#6a4c93', '#3f7d34'],
  grid: '#e7e2d9',
  axis: '#6b7780',
  good: '#3f7d34',
  warning: '#b07a22',
  serious: '#b2662f',
  critical: '#b24a3f',
  neutral: '#6b7780',
};

export type ChartTheme = typeof FALLBACK;

function read(): ChartTheme {
  if (typeof window === 'undefined') return FALLBACK;
  const styles = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
  const hsl = (name: string, fallback: string) => {
    const raw = styles.getPropertyValue(name).trim();
    return raw ? `hsl(${raw})` : fallback;
  };
  return {
    series: [
      get('--series-1', FALLBACK.series[0]),
      get('--series-2', FALLBACK.series[1]),
      get('--series-3', FALLBACK.series[2]),
      get('--series-4', FALLBACK.series[3]),
      get('--series-5', FALLBACK.series[4]),
      get('--series-6', FALLBACK.series[5]),
    ],
    grid: get('--grid', FALLBACK.grid),
    axis: get('--axis', FALLBACK.axis),
    good: hsl('--status-good', FALLBACK.good),
    warning: hsl('--status-warning', FALLBACK.warning),
    serious: hsl('--status-serious', FALLBACK.serious),
    critical: hsl('--status-critical', FALLBACK.critical),
    neutral: hsl('--status-neutral', FALLBACK.neutral),
  };
}

export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = React.useState<ChartTheme>(FALLBACK);

  React.useEffect(() => {
    const sync = () => setTheme(read());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

/** Status → colour, kept out of the categorical rotation on purpose. */
export function statusColour(theme: ChartTheme, tone: string): string {
  switch (tone) {
    case 'good':
      return theme.good;
    case 'warning':
      return theme.warning;
    case 'serious':
      return theme.serious;
    case 'critical':
      return theme.critical;
    default:
      return theme.neutral;
  }
}
