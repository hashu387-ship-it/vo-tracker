'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error boundary:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white/70 p-8 text-center shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
          <AlertTriangle className="h-7 w-7 text-amber-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Something went sideways</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
          We hit an unexpected error rendering this view. Your data is safe — try again or head back to the command center.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-rsg-navy px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 dark:bg-rsg-gold dark:text-zinc-900"
          >
            <RotateCw className="h-4 w-4" /> Try again
          </button>
          <Link
            href="/intelligence"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            <Home className="h-4 w-4" /> Command Center
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
