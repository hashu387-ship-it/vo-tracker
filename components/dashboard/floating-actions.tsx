'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Download,
  Printer,
  X,
  FileText,
  Sparkles,
  Zap,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';

interface FloatingActionsProps {
  onExport: () => void;
  onPrint: () => void;
  isExporting?: boolean;
}

export function FloatingActions({ onExport, onPrint, isExporting }: FloatingActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: <FileText className="h-5 w-5" />,
      label: 'New VO',
      href: '/vos/new',
      color: 'bg-primary hover:bg-primary/90 text-primary-foreground',
      delay: 0,
    },
    {
      icon: <Download className="h-5 w-5" />,
      label: isExporting ? 'Exporting...' : 'Export',
      onClick: onExport,
      color: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      disabled: isExporting,
      delay: 0.05,
    },
    {
      icon: <Printer className="h-5 w-5" />,
      label: 'Print',
      onClick: onPrint,
      color: 'bg-slate-600 hover:bg-slate-700 text-white dark:bg-slate-500 dark:hover:bg-slate-600',
      delay: 0.1,
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 print:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 right-0 flex flex-col-reverse gap-3 items-end"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ delay: action.delay, duration: 0.2 }}
                className="flex items-center gap-3"
              >
                {/* Label tooltip */}
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: action.delay + 0.1 }}
                  className="px-3 py-1.5 bg-foreground text-background text-sm font-medium rounded-lg shadow-lg whitespace-nowrap"
                >
                  {action.label}
                </motion.span>

                {/* Action button */}
                {action.href ? (
                  <Link href={action.href}>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`h-12 w-12 rounded-full ${action.color} shadow-lg flex items-center justify-center transition-all`}
                    >
                      {action.icon}
                    </motion.button>
                  </Link>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={`h-12 w-12 rounded-full ${action.color} shadow-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {action.icon}
                  </motion.button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative h-14 w-14 rounded-full shadow-2xl flex items-center justify-center
          transition-all duration-300
          ${isOpen
            ? 'bg-slate-800 dark:bg-slate-200 rotate-0'
            : 'bg-gradient-to-br from-primary to-primary/80'
          }
        `}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary blur-xl"
          animate={{
            opacity: isOpen ? 0 : [0.3, 0.5, 0.3],
            scale: isOpen ? 0.8 : [1, 1.2, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Icon */}
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="relative z-10"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white dark:text-slate-800" />
          ) : (
            <Plus className="h-6 w-6 text-white" />
          )}
        </motion.div>

        {/* Sparkle decoration */}
        {!isOpen && (
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
          </motion.div>
        )}
      </motion.button>
    </div>
  );
}

// Quick action bar for desktop (horizontal layout)
interface QuickActionsBarProps {
  onExport: () => void;
  onPrint: () => void;
  isExporting?: boolean;
}

export function QuickActionsBar({ onExport, onPrint, isExporting }: QuickActionsBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-2 print:hidden"
    >
      <motion.button
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={onPrint}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/50 hover:bg-muted text-foreground text-sm font-medium border border-border/50 hover:border-border transition-all shadow-sm hover:shadow-md"
      >
        <Printer className="h-4 w-4" />
        <span>Print</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={onExport}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="h-4 w-4" />
        <span>{isExporting ? 'Exporting...' : 'Export'}</span>
      </motion.button>

      <Link href="/vos/new">
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="h-4 w-4" />
          <span>New VO</span>
          <Zap className="h-3.5 w-3.5 text-amber-300" />
        </motion.button>
      </Link>
    </motion.div>
  );
}
