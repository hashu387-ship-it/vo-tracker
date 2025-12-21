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
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
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
                className={`relative overflow-hidden rounded-xl p-5 cursor-pointer transition-all duration-200 border min-w-[240px] md:min-w-0 snap-center
                  ${isSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md transform scale-[1.02]'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm text-slate-900'
                  }
                `}
              >
                {/* Status Label */}
                <div className="mb-4">
                  <h3 className={`text-sm font-medium ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                    {status.label}
                  </h3>
                </div>

                {/* Count */}
                <div className="flex items-end justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-3xl font-bold tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {status.count}
                    </span>
                    <TrendingUp className={`h-4 w-4 ${isSelected ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  </div>
                </div>

                {/* Amount */}
                <div className={`pt-3 border-t ${isSelected ? 'border-slate-700' : 'border-slate-100'} mt-3`}>
                  <div className="flex items-center gap-2">
                    <Coins className={`h-3.5 w-3.5 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`} />
                    <span className={`text-sm font-semibold font-mono ${isSelected ? 'text-slate-200' : 'text-slate-700'}`}>
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
