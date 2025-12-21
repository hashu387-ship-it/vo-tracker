'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary',
  bgColor,
  delay = 0,
}: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className="relative overflow-hidden p-6 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-xl shadow-sm hover:shadow-lg dark:shadow-black/20 transition-all duration-300 group">

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
            {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-white/5 shadow-sm border border-slate-100 dark:border-white/5',
              bgColor ? bgColor.replace('bg-', 'text-') : 'text-slate-400 dark:text-slate-500',
              'group-hover:scale-110 transition-transform duration-300 group-hover:shadow-md'
            )}
          >
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
        {/* Subtle Bottom Accent */}
        <div className={cn(
          "absolute bottom-0 left-0 h-1 w-full opacity-60 group-hover:opacity-100 transition-all duration-300",
          bgColor ? bgColor : "bg-slate-200 dark:bg-slate-700"
        )} />
      </div>
    </motion.div>
  );
}
