'use client';

import { motion } from 'framer-motion';
import { Calendar, Sparkles, Building2 } from 'lucide-react';
import { QuickActionsBar } from './floating-actions';
import { NotificationBell } from '@/components/notifications/notification-bell';

interface DashboardHeaderProps {
  onExport: () => void;
  onPrint: () => void;
  isExporting?: boolean;
}

export function DashboardHeader({ onExport, onPrint, isExporting }: DashboardHeaderProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rsg-navy via-rsg-navy to-rsg-blue p-6 md:p-8 shadow-2xl"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Gradient orbs */}
        <motion.div
          className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-gradient-to-br from-rsg-gold/30 via-rsg-gold/20 to-transparent blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-gradient-to-tr from-white/10 via-white/5 to-transparent blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* Sparkle decorations */}
        <motion.div
          className="absolute top-8 right-12 text-rsg-gold/30"
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <Sparkles className="h-6 w-6" />
        </motion.div>
      </div>

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Left side - Branding & Info */}
        <div className="space-y-4">
          {/* Logo section */}
          <div className="flex items-center gap-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="relative h-12 w-32 flex items-center justify-center"
            >
              <img
                src="/rsg-logo.png"
                alt="RSG"
                className="h-full w-auto object-contain brightness-0 invert opacity-90"
              />
            </motion.div>

            <div className="h-8 w-px bg-white/20" />

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative h-12 w-32 flex items-center justify-center"
            >
              <img
                src="/firstfix-v2.png"
                alt="FirstFix"
                className="h-full w-auto object-contain brightness-0 invert opacity-90"
              />
            </motion.div>
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">
              R06-HW2 SW Hotel 02
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Building2 className="h-4 w-4 text-rsg-gold/70" />
              <span className="text-rsg-gold/90 font-semibold text-sm md:text-base">
                First Fix - VO Log
              </span>
            </div>
          </motion.div>

          {/* Date */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 text-white/70 text-sm"
          >
            <Calendar className="h-4 w-4" />
            <span>{today}</span>
          </motion.div>
        </div>

        {/* Right side - Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="md:self-start"
        >
          <div className="flex items-center gap-4">
            <NotificationBell />
            <QuickActionsBar onExport={onExport} onPrint={onPrint} isExporting={isExporting} />
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </motion.div>
  );
}
