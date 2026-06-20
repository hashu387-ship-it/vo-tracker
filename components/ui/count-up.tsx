'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { formatSAR, formatCompact } from '@/lib/data/commercial';

type Mode = 'plain' | 'currency' | 'compact' | 'percent';

/**
 * Animated number counter. Eases from 0 → value with an ease-out curve when it
 * scrolls into view. Supports currency / compact / percent formatting.
 */
export function CountUp({
  value,
  mode = 'plain',
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1600,
  className,
}: {
  value: number;
  mode?: Mode;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  const format = (n: number): string => {
    if (mode === 'currency') return formatSAR(n, decimals);
    if (mode === 'compact') return formatCompact(n);
    if (mode === 'percent') return `${n.toFixed(decimals)}%`;
    return n.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <span ref={ref} className={className}>
      {prefix}
      {format(display)}
      {suffix}
    </span>
  );
}
