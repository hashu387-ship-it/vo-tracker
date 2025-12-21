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
      <div className="relative overflow-hidden p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">

        {/* Subtle Glass Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg border border-white/5 shadow-inner',
              bgColor ? bgColor.replace('bg-', 'bg-opacity-10 bg-') : 'bg-slate-800',
              bgColor ? bgColor.replace('bg-', 'text-') : 'text-slate-400',
              'group-hover:scale-110 transition-transform duration-300'
            )}
          >
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
        {/* Subtle Bottom Accent */}
        <div className={cn(
          "absolute bottom-0 left-0 h-1 w-full opacity-50 group-hover:opacity-100 transition-all duration-300",
          bgColor ? bgColor : "bg-slate-700"
        )} />
      </div>
    </motion.div>
  );
}
