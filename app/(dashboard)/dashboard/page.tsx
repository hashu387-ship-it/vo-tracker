'use client';

import { Button } from '@/components/ui/button';
import { Plus, Sparkles, Download, Printer } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { StatusBreakdownCards } from '@/components/dashboard/status-breakdown-cards';
import { DashboardVOTable } from '@/components/dashboard/dashboard-vo-table';
import { useVOStats } from '@/lib/hooks/use-vo-stats';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const { data: stats, isLoading } = useVOStats();
  const [isExporting, setIsExporting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('/api/dashboard-export');
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VO_Dashboard_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-rsg-navy p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-rsg-gold/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-6 mb-2">
              {/* Logos */}
              <img src="/rsg-logo.png" alt="RSG" className="h-12 w-auto brightness-0 invert opacity-90" />
              <div className="h-8 w-px bg-white/20" />
              <img src="/firstfix-v2.png" alt="FirstFix" className="h-8 w-auto brightness-0 invert opacity-90" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mt-2">
                R06-HW2 SW Hotel 02<br className="md:hidden" /> First Fix-VO Log
              </h1>
            </div>
            <p className="text-gray-300 text-sm md:text-lg">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3 print:hidden w-full md:w-auto">
            <Button
              size="sm"
              onClick={handlePrint}
              className="flex-1 md:flex-none gap-2 bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all duration-300 md:h-11 md:text-base backdrop-blur-md"
            >
              <Printer className="h-4 w-4" />
              <span className="whitespace-nowrap">Print</span>
            </Button>
            <Button
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 md:flex-none gap-2 bg-rsg-gold text-white hover:bg-[#B08D55] shadow-lg hover:shadow-xl transition-all duration-300 md:h-11 md:text-base"
            >
              <Download className="h-4 w-4" />
              <span className="whitespace-nowrap">{isExporting ? '...' : 'Export'}</span>
            </Button>
            <Link href="/vos/new" className="flex-1 md:flex-none">
              <Button
                size="sm"
                className="w-full gap-2 bg-white text-rsg-navy hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 md:h-11 md:text-base font-semibold"
              >
                <Plus className="h-4 w-4" />
                <span className="whitespace-nowrap">New VO</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Contract Amount Display */}
      {!isLoading && stats && (
        <div className="grid gap-3 md:grid-cols-2">
          {/* Original Contract Amount */}
          <div className="group relative overflow-hidden rounded-xl border border-rsg-navy/10 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-slate-900 dark:border-white/10">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <div className="h-8 w-8 rounded-full bg-rsg-navy" />
            </div>
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Original Contract Value</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-slate-400 font-medium">SAR</span>
                <p className="text-xl md:text-2xl font-bold text-rsg-navy dark:text-white">
                  {formatCurrency(217501556.12).replace('SAR', '').trim()}
                </p>
              </div>
            </div>
          </div>

          {/* Revised Contract Amount */}
          <div className="group relative overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-50/50 p-4 shadow-sm transition-all hover:shadow-md dark:bg-emerald-900/10 dark:border-emerald-500/30">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <div className="h-8 w-8 rounded-full bg-emerald-600" />
            </div>
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600/80 mb-1">Revised Contract Value</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-emerald-600/70 font-medium">SAR</span>
                <p className="text-xl md:text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(
                    217501556.12 +
                    (stats.statusBreakdown.find(s => s.status === 'ApprovedAwaitingDVO')?.amount || 0) +
                    (stats.statusBreakdown.find(s => s.status === 'DVORRIssued')?.amount || 0)
                  ).replace('SAR', '').trim()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Breakdown Cards */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : stats?.statusBreakdown ? (
        <StatusBreakdownCards
          statusBreakdown={stats.statusBreakdown}
          selectedStatus={filterStatus}
          onStatusSelect={setFilterStatus}
        />
      ) : null}

      {/* VO Table */}
      <div>
        <DashboardVOTable filterStatus={filterStatus} />
      </div>
    </div>
  );
}
