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
      <div className="relative overflow-hidden p-6 bg-white/60 backdrop-blur-xl border border-white/60 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group">

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          </div>
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100',
              bgColor ? bgColor.replace('bg-', 'text-') : 'text-slate-400',
              'group-hover:scale-110 transition-transform duration-300 group-hover:shadow-md'
            )}
          >
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
        {/* Subtle Bottom Accent */}
        <div className={cn(
          "absolute bottom-0 left-0 h-1 w-full opacity-60 group-hover:opacity-100 transition-all duration-300",
          bgColor ? bgColor : "bg-slate-200"
        )} />
      </div>
    </motion.div>
  );
}
