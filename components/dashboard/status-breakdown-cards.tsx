'use client';

import { formatCurrency } from '@/lib/utils';
import { TrendingUp, DollarSign } from 'lucide-react';
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
}

export function StatusBreakdownCards({ statusBreakdown }: StatusBreakdownCardsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-6 text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Status Overview
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {statusBreakdown.map((status, index) => (
            <motion.div
              key={status.status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="neo-card group relative overflow-hidden rounded-2xl p-6"
            >
              {/* Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${status.gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-300`}
              />

              {/* Accent Border */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${status.gradient} opacity-80`}
              />

              <div className="relative">
                {/* Status Label */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                    {status.label}
                  </h3>
                </div>

                {/* Count */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold bg-gradient-to-r ${status.gradient} bg-clip-text text-transparent`}>
                      {status.count}
                    </span>
                    <TrendingUp className={`h-5 w-5 text-${status.color}-500 opacity-80`} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active VOs
                  </p>
                </div>

                {/* Amount */}
                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <DollarSign className={`h-4 w-4 text-${status.color}-500 opacity-80`} />
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(status.amount)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total Value
                  </p>
                </div>

                {/* Hover Effect Circle */}
                <div
                  className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${status.gradient} rounded-full opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
