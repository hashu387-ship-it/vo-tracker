'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  items?: Array<{ id: number; subject: string; proposalValue?: number | null; approvedAmount?: number | null }>;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary',
  bgColor,
  delay = 0,
  items,
}: KPICardProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className="relative overflow-hidden p-6 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-xl shadow-sm hover:shadow-lg dark:shadow-black/20 transition-all duration-300 group cursor-default">

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

  if (!items || items.length === 0) return content;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-80 p-0 bg-slate-900 border-slate-800 text-slate-50 shadow-xl">
          <div className="p-3 border-b border-white/10 font-semibold text-sm">
            {title} ({items.length} recent)
          </div>
          <div className="max-h-[300px] overflow-y-auto py-1">
            {items.map((item) => (
              <div key={item.id} className="px-3 py-2 hover:bg-white/5 border-b border-white/5 last:border-0 text-sm">
                <div className="font-medium truncate">{item.subject}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR' }).format(item.approvedAmount || item.proposalValue || 0)}
                </div>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
