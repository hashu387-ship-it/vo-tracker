'use client';

import { motion } from 'framer-motion';
import { Bot, Command as CommandIcon, Sparkles } from 'lucide-react';
import { useWorkspace } from '@/components/providers/workspace-provider';
import { MagneticButton } from '@/components/ui/magnetic-button';

/**
 * Floating dock (bottom-right) — primary entry to the AI assistant and the
 * command palette. The AI button is magnetic with an animated aurora halo.
 */
export function FloatingDock() {
  const { toggleAssistant, togglePalette, assistantOpen } = useWorkspace();

  if (assistantOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-3 print:hidden">
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring' }}
        onClick={togglePalette}
        className="group flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-2 text-xs font-medium text-slate-500 shadow-lg backdrop-blur-xl transition-colors hover:text-slate-800 dark:border-white/10 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:text-white"
      >
        <CommandIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="rounded border border-slate-300 px-1 text-[10px] dark:border-white/15">⌘K</kbd>
      </motion.button>

      <MagneticButton onClick={toggleAssistant} className="group">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 260 }}
          className="relative"
        >
          <div className="absolute -inset-1 animate-pulse-glow rounded-full bg-gradient-to-br from-rsg-navy via-sky-500 to-violet-500 opacity-70 blur-md dark:from-rsg-gold dark:via-amber-500 dark:to-orange-500" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rsg-navy via-sky-600 to-violet-600 shadow-xl shadow-rsg-navy/30 dark:from-rsg-gold dark:via-amber-500 dark:to-orange-500">
            <Bot className="h-6 w-6 text-white dark:text-zinc-900" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-zinc-900">
              <Sparkles className="h-2.5 w-2.5 text-rsg-navy dark:text-rsg-gold" />
            </span>
          </div>
        </motion.div>
      </MagneticButton>
    </div>
  );
}
