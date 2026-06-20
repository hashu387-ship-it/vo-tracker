'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Magnetic button — the element eases toward the cursor on hover, then springs
 * back on leave. Pure pointer math + framer-motion springs.
 */
export function MagneticButton({
  children,
  className,
  onClick,
  strength = 0.4,
  as = 'button',
  type = 'button',
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
  as?: 'button' | 'div';
  type?: 'button' | 'submit';
}) {
  const ref = useRef<HTMLButtonElement & HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 250, damping: 18, mass: 0.4 });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - (rect.left + rect.width / 2);
    const my = e.clientY - (rect.top + rect.height / 2);
    x.set(mx * strength);
    y.set(my * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const Comp = as === 'div' ? motion.div : motion.button;

  return (
    <Comp
      ref={ref}
      type={as === 'button' ? type : undefined}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.96 }}
      className={cn('relative inline-flex select-none items-center justify-center', className)}
    >
      {children}
    </Comp>
  );
}
