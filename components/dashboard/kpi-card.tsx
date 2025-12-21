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
      <div className="relative overflow-hidden p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between">
          <div className="space-y-1 relative z-10">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          </div>
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              bgColor ? bgColor.replace('bg-', 'bg-opacity-10 bg-') : 'bg-slate-100',
              bgColor ? bgColor.replace('bg-', 'text-') : 'text-slate-600',
            )}
          >
            {/* Note: Logic above is a bit brittle if bgColor is complicated. 
                Let's simplify: if iconColor is passed, use that for text, and a light bg. 
                The passed props are: iconColor="text-blue-600", bgColor="bg-blue-500"
                I want: bg-blue-50 text-blue-600.
                Actually, let's just trust the passed iconColor and use a standard light gray bg if we want minimal.
                Or better, use the passed color for the icon, and a very light tint for the Background.
            */}
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
        {/* Subtle Bottom Accent */}
        <div className={cn(
          "absolute bottom-0 left-0 h-1 w-full opacity-60",
          bgColor ? bgColor : "bg-slate-200"
        )} />
      </div>
    </motion.div>
  );
}
