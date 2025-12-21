'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { ChevronRight, TrendingUp, Sparkles } from 'lucide-react';

interface StatusRingProps {
  status: string;
  label: string;
  count: number;
  amount: number;
  totalCount: number;
  color: string;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

const STATUS_COLORS: Record<string, {
  ring: string;
  bg: string;
  text: string;
  glow: string;
  gradient: string;
  lightBg: string;
}> = {
  PendingWithFFC: {
    ring: '#f97316',
    bg: 'from-orange-500/10 to-orange-600/5 dark:from-orange-500/20 dark:to-orange-600/10',
    text: 'text-orange-600 dark:text-orange-400',
    glow: 'shadow-orange-500/20 dark:shadow-orange-500/30',
    gradient: 'from-orange-500 to-orange-600',
    lightBg: 'bg-orange-50 dark:bg-orange-950/30',
  },
  PendingWithRSG: {
    ring: '#f59e0b',
    bg: 'from-amber-500/10 to-amber-600/5 dark:from-amber-500/20 dark:to-amber-600/10',
    text: 'text-amber-600 dark:text-amber-400',
    glow: 'shadow-amber-500/20 dark:shadow-amber-500/30',
    gradient: 'from-amber-500 to-amber-600',
    lightBg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  PendingWithRSGFFC: {
    ring: '#eab308',
    bg: 'from-yellow-500/10 to-yellow-600/5 dark:from-yellow-500/20 dark:to-yellow-600/10',
    text: 'text-yellow-600 dark:text-yellow-500',
    glow: 'shadow-yellow-500/20 dark:shadow-yellow-500/30',
    gradient: 'from-yellow-400 to-yellow-500',
    lightBg: 'bg-yellow-50 dark:bg-yellow-950/30',
  },
  ApprovedAwaitingDVO: {
    ring: '#06b6d4',
    bg: 'from-cyan-500/10 to-cyan-600/5 dark:from-cyan-500/20 dark:to-cyan-600/10',
    text: 'text-cyan-600 dark:text-cyan-400',
    glow: 'shadow-cyan-500/20 dark:shadow-cyan-500/30',
    gradient: 'from-cyan-500 to-cyan-600',
    lightBg: 'bg-cyan-50 dark:bg-cyan-950/30',
  },
  DVORRIssued: {
    ring: '#10b981',
    bg: 'from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/20 dark:to-emerald-600/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    glow: 'shadow-emerald-500/20 dark:shadow-emerald-500/30',
    gradient: 'from-emerald-500 to-emerald-600',
    lightBg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
};

function CircularProgress({
  percentage,
  color,
  size = 80,
  strokeWidth = 6,
  delay = 0
}: {
  percentage: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  delay?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const springConfig = { damping: 30, stiffness: 100 };
  const progress = useSpring(0, springConfig);
  const strokeDashoffset = useTransform(progress, (p) => circumference - (p / 100) * circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      progress.set(percentage);
    }, delay);
    return () => clearTimeout(timer);
  }, [percentage, progress, delay]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30 dark:text-muted/20"
        />
      </svg>

      {/* Progress circle */}
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gradient-${color.replace('#', '')})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ strokeDasharray: circumference, strokeDashoffset }}
        />
      </svg>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-md opacity-40"
        style={{ backgroundColor: color }}
        animate={{
          scale: mounted ? [1, 1.1, 1] : 1,
          opacity: mounted ? [0.2, 0.4, 0.2] : 0,
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

function StatusRingCard({ status, label, count, amount, totalCount, isSelected, onSelect, index }: StatusRingProps) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = STATUS_COLORS[status] || STATUS_COLORS.PendingWithFFC;
  const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      onClick={onSelect}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`
        group relative cursor-pointer overflow-hidden rounded-2xl p-5
        transition-all duration-500 ease-out
        ${isSelected
          ? `bg-gradient-to-br ${colors.bg} ring-2 ring-offset-2 ring-offset-background shadow-xl ${colors.glow}`
          : 'bg-card/50 hover:bg-card/80 ring-1 ring-border/50 hover:ring-border hover:shadow-lg'
        }
        backdrop-blur-xl
      `}
      style={isSelected ? {
        '--tw-ring-color': colors.ring,
      } as React.CSSProperties : undefined}
    >
      {/* Background decoration */}
      <motion.div
        className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${colors.gradient} opacity-5 blur-3xl`}
        animate={{
          scale: isHovered ? 1.5 : 1,
          opacity: isHovered ? 0.15 : 0.05,
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Sparkle indicator for selected */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute right-3 top-3"
        >
          <Sparkles className={`h-4 w-4 ${colors.text}`} />
        </motion.div>
      )}

      <div className="relative flex items-start gap-4">
        {/* Circular Progress */}
        <div className="flex-shrink-0">
          <CircularProgress
            percentage={percentage}
            color={colors.ring}
            size={72}
            strokeWidth={5}
            delay={index * 100 + 200}
          />
          <div className="absolute inset-0 flex items-center justify-center" style={{ width: 72, height: 72, marginTop: -72 }}>
            <motion.span
              className={`text-lg font-bold ${colors.text}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.5, type: 'spring' }}
            >
              {count}
            </motion.span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold truncate ${isSelected ? colors.text : 'text-foreground'} transition-colors`}>
            {label}
          </h3>

          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs ${isSelected ? colors.text : 'text-muted-foreground'}`}>
                {percentage.toFixed(0)}% of total
              </span>
            </div>

            <p className={`text-sm font-mono font-semibold ${isSelected ? 'text-foreground' : 'text-muted-foreground'} truncate`}>
              {formatCurrency(amount)}
            </p>
          </div>
        </div>

        {/* Chevron indicator */}
        <motion.div
          className={`self-center ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`}
          animate={{ x: isHovered ? 4 : 0 }}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.div>
      </div>

      {/* Bottom accent line */}
      <motion.div
        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isSelected ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ originX: 0 }}
      />

      {/* Hover ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ backgroundColor: colors.ring }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered && !isSelected ? 0.03 : 0 }}
      />
    </motion.div>
  );
}

interface StatusRingCardsProps {
  statusBreakdown: Array<{
    status: string;
    label: string;
    count: number;
    amount: number;
    color: string;
    gradient: string;
  }>;
  selectedStatus: string | null;
  onStatusSelect: (status: string | null) => void;
}

export function StatusRingCards({ statusBreakdown, selectedStatus, onStatusSelect }: StatusRingCardsProps) {
  const totalCount = statusBreakdown.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Status Distribution</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Click to filter by status</p>
        </div>
        {selectedStatus && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => onStatusSelect(null)}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20"
          >
            Clear filter
          </motion.button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statusBreakdown.map((status, index) => (
          <StatusRingCard
            key={status.status}
            {...status}
            totalCount={totalCount}
            isSelected={selectedStatus === status.status}
            onSelect={() => onStatusSelect(selectedStatus === status.status ? null : status.status)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
