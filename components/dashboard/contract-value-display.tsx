'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight, TrendingUp, Sparkles, DollarSign, ArrowRight } from 'lucide-react';

interface ContractValueDisplayProps {
  originalValue: number;
  revisedValue: number;
}

function AnimatedCurrency({ value, delay = 0 }: { value: number; delay?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 2000;
      const steps = 80;
      const stepValue = value / steps;
      let current = 0;

      const interval = setInterval(() => {
        current += stepValue;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(current);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <span className="tabular-nums">
      {displayValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
    </span>
  );
}

export function ContractValueDisplay({ originalValue, revisedValue }: ContractValueDisplayProps) {
  const difference = revisedValue - originalValue;
  const percentageChange = ((difference / originalValue) * 100).toFixed(2);
  const [isHovered, setIsHovered] = useState<'original' | 'revised' | null>(null);

  return (
    <div className="relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-emerald-500/5 rounded-3xl blur-xl" />

      <div className="relative grid gap-4 md:grid-cols-2">
        {/* Original Contract Value */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onHoverStart={() => setIsHovered('original')}
          onHoverEnd={() => setIsHovered(null)}
          className="group relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-border"
        >
          {/* Decorative orb */}
          <motion.div
            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-2xl"
            animate={{
              scale: isHovered === 'original' ? 1.5 : 1,
              opacity: isHovered === 'original' ? 0.5 : 0.3,
            }}
          />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Original Contract Value
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  Base contract amount
                </p>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-muted-foreground">SAR</span>
              <motion.p
                className="text-2xl md:text-3xl font-bold text-foreground tracking-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AnimatedCurrency value={originalValue} />
              </motion.p>
            </div>
          </div>

          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className="h-10 w-10 rounded-full bg-card border-2 border-border flex items-center justify-center shadow-md"
            >
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </div>
        </motion.div>

        {/* Revised Contract Value */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onHoverStart={() => setIsHovered('revised')}
          onHoverEnd={() => setIsHovered(null)}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/5 via-card/80 to-card/80 backdrop-blur-xl border border-emerald-500/20 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-emerald-500/30"
        >
          {/* Decorative orb */}
          <motion.div
            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 blur-2xl"
            animate={{
              scale: isHovered === 'revised' ? 1.5 : 1,
              opacity: isHovered === 'revised' ? 0.5 : 0.3,
            }}
          />

          {/* Sparkle indicator */}
          <motion.div
            className="absolute right-4 top-4"
            animate={{
              rotate: [0, 15, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-5 w-5 text-emerald-500/50" />
          </motion.div>

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600/80 dark:text-emerald-400/80">
                  Revised Contract Value
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  Including approved VOs
                </p>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-emerald-600/70 dark:text-emerald-400/70">SAR</span>
              <motion.p
                className="text-2xl md:text-3xl font-bold text-emerald-700 dark:text-emerald-400 tracking-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AnimatedCurrency value={revisedValue} delay={200} />
              </motion.p>
            </div>

            {/* Change indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-4 flex items-center gap-2"
            >
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <ArrowUpRight className="h-3 w-3" />
                +{percentageChange}%
              </span>
              <span className="text-xs text-muted-foreground">
                +{formatCurrency(difference)}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
