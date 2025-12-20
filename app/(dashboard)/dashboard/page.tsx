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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />

        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-8 w-8 text-amber-300" />
              <h1 className="text-4xl font-bold text-white">R06-HW2 SW Hotel 02-First Fix-VO Log</h1>
            </div>
            <p className="text-blue-100 text-lg">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-3 print:hidden">
            <Button
              size="lg"
              onClick={handlePrint}
              className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Printer className="h-5 w-5" />
              Print PDF
            </Button>
            <Button
              size="lg"
              onClick={handleExport}
              disabled={isExporting}
              className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Download className="h-5 w-5" />
              {isExporting ? 'Exporting...' : 'Export Excel'}
            </Button>
            <Link href="/vos/new">
              <Button
                size="lg"
                className="gap-2 bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-5 w-5" />
                New VO
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Contract Amount Display */}
      {!isLoading && stats && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Original Contract Amount */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-6 shadow-xl">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative">
              <h3 className="text-lg font-semibold text-white mb-2">Original Contract Value</h3>
              <p className="text-4xl font-bold text-white">
                {formatCurrency(217501556.12)}
              </p>
            </div>
          </div>

          {/* Revised Contract Amount */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-6 shadow-xl">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative">
              <h3 className="text-lg font-semibold text-white mb-2">Revised Contract Value</h3>
              <p className="text-4xl font-bold text-white">
                {formatCurrency(
                  217501556.12 +
                  (stats.statusBreakdown.find(s => s.status === 'ApprovedAwaitingDVO')?.amount || 0) +
                  (stats.statusBreakdown.find(s => s.status === 'DVORRIssued')?.amount || 0)
                )}
              </p>
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
        <StatusBreakdownCards statusBreakdown={stats.statusBreakdown} />
      ) : null}

      {/* VO Table */}
      <div>
        <DashboardVOTable />
      </div>
    </div>
  );
}
