'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Glass card with a cursor-following spotlight border glow. The mask reveals a
 * gradient ring only around the pointer for a premium "liquid glass" feel.
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = 'rgba(120, 145, 255, 0.18)',
}: {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const bg = useMotionTemplate`radial-gradient(320px circle at ${mx}px ${my}px, ${spotlightColor}, transparent 70%)`;

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/40 bg-white/50 backdrop-blur-2xl transition-all duration-300 hover:border-white/60 hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.05] dark:hover:border-white/20',
        className,
      )}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: bg }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
