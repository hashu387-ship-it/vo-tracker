'use client';

import { formatCurrency } from '@/lib/utils';
import { TrendingUp, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatusBreakdownCardsProps {
  statusBreakdown: Array<{
    status: string;
    label: string;
    count: number;
    amount: number;
    color: string;
    gradient: string;
  }>;
  selectedStatus: string | null;
  onStatusSelect: (status: string | null) => void;
}

export function StatusBreakdownCards({ statusBreakdown, selectedStatus, onStatusSelect }: StatusBreakdownCardsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-semibold text-slate-800">
          Status Overview
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 md:overflow-visible">
          {statusBreakdown.map((status, index) => {
            const isSelected = selectedStatus === status.status;

            return (
              <motion.div
                key={status.status}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onStatusSelect(isSelected ? null : status.status)}
                className={`relative overflow-hidden rounded-xl p-5 cursor-pointer transition-all duration-300 border min-w-[240px] md:min-w-0 snap-center
                  ${isSelected
                    ? 'bg-white dark:bg-slate-900 ring-2 ring-rsg-gold/50 shadow-lg scale-[1.02] border-rsg-gold/20 dark:border-rsg-gold/20'
                    : 'bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-white/5 hover:border-white dark:hover:border-white/10 hover:bg-white/80 dark:hover:bg-slate-900/60 hover:shadow-md'
                  }
                `}
              >
                {/* For unselected state, keep it light for contrast or go full dark? 
                    User asked for "dash board table attached style" which is dark. 
                    Mixing light cards and dark table is okay (Linear does it), but full dark might be safer.
                    Let's keep cards light by default to avoid overwhelming darkness, but make the *Selected* state match the Dark Table.
                    Wait, if the table is dark, maybe the cards should be dark glass too?
                    Let's try a hybrid: Light cards by default, but "Dark Glass" when selected (matching table).
                */}

                {/* Status Label */}
                <div className="mb-4">
                  <h3 className={`text-sm font-medium ${isSelected ? 'text-rsg-navy dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                    {status.label}
                  </h3>
                </div>

                {/* Count */}
                <div className="flex items-end justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-3xl font-bold tracking-tight ${isSelected ? 'text-rsg-navy dark:text-white' : 'text-slate-900 dark:text-slate-200'}`}>
                      {status.count}
                    </span>
                    <TrendingUp className={`h-4 w-4 ${isSelected ? 'text-emerald-500' : 'text-emerald-600'}`} />
                  </div>
                </div>

                {/* Amount */}
                <div className={`pt-3 border-t ${isSelected ? 'border-rsg-gold/10 dark:border-white/10' : 'border-slate-100 dark:border-white/5'} mt-3`}>
                  <div className="flex items-center gap-2">
                    <Coins className={`h-3.5 w-3.5 ${isSelected ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className={`text-sm font-semibold font-mono ${isSelected ? 'text-slate-700 dark:text-slate-300' : 'text-slate-600 dark:text-slate-500'}`}>
                      {formatCurrency(status.amount)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
