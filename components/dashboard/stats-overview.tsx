'use client';

import {
  FileText,
  Clock,
  CheckCircle,
  FileCheck,
  Coins,
} from 'lucide-react';
import { KPICard } from './kpi-card';
import { useVOStats } from '@/lib/hooks/use-vo-stats';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

export function StatsOverview() {
  const { data: stats, isLoading } = useVOStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[140px]" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">VO Status Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KPICard
            title="Total Submitted VO"
            value={stats.counts.total}
            icon={FileText}
            iconColor="text-blue-600"
            bgColor="bg-blue-500"
            delay={0}
          />
          {stats.statusBreakdown && (
            <>
              {stats.statusBreakdown.map((status: any, index: number) => (
                <KPICard
                  key={status.status}
                  title={status.label}
                  value={status.count}
                  icon={
                    status.status.includes('Approved') || status.status.includes('Issued')
                      ? (status.status.includes('RR') ? FileCheck : CheckCircle)
                      : Clock
                  }
                  iconColor={`text-${status.color}-500`}
                  bgColor={`bg-${status.color}-${status.color === 'yellow' ? '400' : '500'}`}
                  delay={0.1 + (index * 0.1)}
                  items={status.items}
                />
              ))}
            </>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Financial Summary</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <KPICard
            title="Total Submitted Value"
            value={formatCurrency(stats.financials.totalSubmittedValue)}
            subtitle="Sum of all proposal values"
            icon={Coins}
            iconColor="text-emerald-600"
            delay={0.6}
          />
          <KPICard
            title="Total Approved Value"
            value={formatCurrency(stats.financials.totalApprovedValue)}
            subtitle="Sum of all approved amounts"
            icon={Coins}
            iconColor="text-green-600"
            delay={0.7}
          />
        </div>
      </div>
    </div>
  );
}
