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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="neo-card relative overflow-hidden p-6 group">
        <div className="flex items-start justify-between">
          <div className="space-y-2 relative z-10">
            <p className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary/80">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-foreground transition-all group-hover:scale-105 origin-left">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 shadow-md',
              bgColor ? bgColor : 'bg-secondary',
              bgColor ? 'text-white' : iconColor,
              'group-hover:scale-110 group-hover:shadow-lg'
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className={cn(
          "absolute bottom-0 left-0 h-1 w-full rounded-b-lg transition-all duration-500",
          bgColor ? bgColor : "bg-gradient-to-r from-primary to-primary/50",
          "opacity-50 group-hover:opacity-100 group-hover:h-1.5"
        )} />
      </div>
    </motion.div>
  );
}
