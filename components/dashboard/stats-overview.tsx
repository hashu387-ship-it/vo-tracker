'use client';

import {
  FileText,
  Clock,
  CheckCircle,
  FileCheck,
  DollarSign,
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
        <h2 className="mb-4 text-lg font-semibold">VO Status Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KPICard
            title="Total Submitted VO"
            value={stats.counts.total}
            icon={FileText}
            iconColor="text-blue-600"
            bgColor="bg-blue-500"
            delay={0}
          />
          <KPICard
            title="Pending with FFC"
            value={stats.counts.pendingWithFFC}
            icon={Clock}
            iconColor="text-orange-500"
            bgColor="bg-orange-500"
            delay={0.1}
          />
          <KPICard
            title="Pending with RSG"
            value={stats.counts.pendingWithRSG}
            icon={Clock}
            iconColor="text-amber-600"
            bgColor="bg-amber-600"
            delay={0.2}
          />
          <KPICard
            title="Pending with RSG/FFC"
            value={stats.counts.pendingWithRSGFFC}
            icon={Clock}
            iconColor="text-yellow-500"
            bgColor="bg-yellow-400"
            delay={0.3}
          />
          <KPICard
            title="Approved & Awaiting DVO"
            value={stats.counts.approvedAwaitingDVO}
            icon={CheckCircle}
            iconColor="text-cyan-500"
            bgColor="bg-cyan-500"
            delay={0.4}
          />
          <KPICard
            title="DVO RR Issued"
            value={stats.counts.dvoRRIssued}
            icon={FileCheck}
            iconColor="text-green-500"
            bgColor="bg-green-500"
            delay={0.5}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Financial Summary</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <KPICard
            title="Total Submitted Value"
            value={formatCurrency(stats.financials.totalSubmittedValue)}
            subtitle="Sum of all proposal values"
            icon={DollarSign}
            iconColor="text-emerald-600"
            delay={0.6}
          />
          <KPICard
            title="Total Approved Value"
            value={formatCurrency(stats.financials.totalApprovedValue)}
            subtitle="Sum of all approved amounts"
            icon={DollarSign}
            iconColor="text-green-600"
            delay={0.7}
          />
        </div>
      </div>
    </div>
  );
}
