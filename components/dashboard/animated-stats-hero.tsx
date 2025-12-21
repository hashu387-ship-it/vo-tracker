'use client';

import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  DollarSign,
  FileText,
  CheckCircle2,
  Clock,
  Activity,
  Sparkles,
  Zap
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AnimatedStatProps {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan';
  delay?: number;
}

function AnimatedStat({ value, prefix = '', suffix = '', label, sublabel, icon, trend, color, delay = 0 }: AnimatedStatProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const colorClasses = {
    indigo: {
      bg: 'from-indigo-500/10 via-indigo-500/5 to-transparent dark:from-indigo-500/20 dark:via-indigo-500/10',
      ring: 'ring-indigo-500/20 dark:ring-indigo-400/30',
      icon: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/20',
      glow: 'group-hover:shadow-indigo-500/25',
      accent: 'text-indigo-600 dark:text-indigo-400',
    },
    emerald: {
      bg: 'from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/20 dark:via-emerald-500/10',
      ring: 'ring-emerald-500/20 dark:ring-emerald-400/30',
      icon: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20',
      glow: 'group-hover:shadow-emerald-500/25',
      accent: 'text-emerald-600 dark:text-emerald-400',
    },
    amber: {
      bg: 'from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/20 dark:via-amber-500/10',
      ring: 'ring-amber-500/20 dark:ring-amber-400/30',
      icon: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20',
      glow: 'group-hover:shadow-amber-500/25',
      accent: 'text-amber-600 dark:text-amber-400',
    },
    rose: {
      bg: 'from-rose-500/10 via-rose-500/5 to-transparent dark:from-rose-500/20 dark:via-rose-500/10',
      ring: 'ring-rose-500/20 dark:ring-rose-400/30',
      icon: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/20',
      glow: 'group-hover:shadow-rose-500/25',
      accent: 'text-rose-600 dark:text-rose-400',
    },
    cyan: {
      bg: 'from-cyan-500/10 via-cyan-500/5 to-transparent dark:from-cyan-500/20 dark:via-cyan-500/10',
      ring: 'ring-cyan-500/20 dark:ring-cyan-400/30',
      icon: 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-500/20',
      glow: 'group-hover:shadow-cyan-500/25',
      accent: 'text-cyan-600 dark:text-cyan-400',
    },
  };

  const classes = colorClasses[color];

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1500;
      const steps = 60;
      const stepValue = value / steps;
      let current = 0;

      const interval = setInterval(() => {
        current += stepValue;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  const formatDisplay = (val: number) => {
    if (prefix === 'SAR' || prefix === '$') {
      return val.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
    return val.toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: delay / 1000, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${classes.bg} p-6 ring-1 ${classes.ring} backdrop-blur-xl transition-all duration-500 hover:shadow-2xl ${classes.glow} hover:-translate-y-1`}
    >
      {/* Animated background orb */}
      <motion.div
        className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${color === 'indigo' ? 'from-indigo-400/20 to-purple-500/10' : color === 'emerald' ? 'from-emerald-400/20 to-teal-500/10' : color === 'amber' ? 'from-amber-400/20 to-orange-500/10' : color === 'rose' ? 'from-rose-400/20 to-pink-500/10' : 'from-cyan-400/20 to-blue-500/10'} blur-2xl transition-transform duration-700`}
        animate={{
          scale: isHovered ? 1.5 : 1,
          opacity: isHovered ? 0.8 : 0.5,
        }}
      />

      {/* Sparkle effect on hover */}
      <motion.div
        className="absolute right-4 top-4"
        animate={{
          rotate: isHovered ? 180 : 0,
          scale: isHovered ? 1.2 : 1,
        }}
        transition={{ duration: 0.5 }}
      >
        <Sparkles className={`h-4 w-4 ${classes.accent} opacity-40`} />
      </motion.div>

      <div className="relative">
        {/* Icon */}
        <div className={`mb-4 inline-flex rounded-xl p-3 ${classes.icon} ring-1 ring-inset ring-black/5 dark:ring-white/10`}>
          {icon}
        </div>

        {/* Label */}
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {sublabel && (
          <p className="text-xs text-muted-foreground/70 mt-0.5">{sublabel}</p>
        )}

        {/* Value */}
        <div className="mt-2 flex items-baseline gap-2">
          {prefix && (
            <span className="text-sm font-medium text-muted-foreground">{prefix}</span>
          )}
          <motion.span
            className="text-3xl font-bold tracking-tight text-foreground"
            key={displayValue}
          >
            {formatDisplay(displayValue)}
          </motion.span>
          {suffix && (
            <span className="text-sm font-medium text-muted-foreground">{suffix}</span>
          )}
        </div>

        {/* Trend indicator */}
        {trend && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (delay / 1000) + 0.3 }}
            className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              trend.isPositive
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
          </motion.div>
        )}
      </div>

      {/* Interactive pulse ring */}
      <motion.div
        className={`absolute inset-0 rounded-2xl ring-2 ${classes.ring} pointer-events-none`}
        animate={{
          opacity: isHovered ? [0.5, 0.2, 0.5] : 0,
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.div>
  );
}

interface AnimatedStatsHeroProps {
  stats: {
    totalVOs: number;
    pendingCount: number;
    approvedCount: number;
    totalSubmitted: number;
    totalApproved: number;
  };
}

export function AnimatedStatsHero({ stats }: AnimatedStatsHeroProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <AnimatedStat
        value={stats.totalVOs}
        label="Total Variation Orders"
        sublabel="All time records"
        icon={<FileText className="h-5 w-5" />}
        color="indigo"
        trend={{ value: 12, isPositive: true }}
        delay={0}
      />
      <AnimatedStat
        value={stats.pendingCount}
        label="Pending Review"
        sublabel="Awaiting action"
        icon={<Clock className="h-5 w-5" />}
        color="amber"
        delay={100}
      />
      <AnimatedStat
        value={stats.approvedCount}
        label="Approved Orders"
        sublabel="Successfully processed"
        icon={<CheckCircle2 className="h-5 w-5" />}
        color="emerald"
        trend={{ value: 8, isPositive: true }}
        delay={200}
      />
      <AnimatedStat
        value={stats.totalApproved}
        prefix="SAR"
        label="Total Approved Value"
        sublabel="Contract additions"
        icon={<DollarSign className="h-5 w-5" />}
        color="cyan"
        trend={{ value: 15, isPositive: true }}
        delay={300}
      />
    </div>
  );
}
