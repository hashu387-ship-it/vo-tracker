'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useVOStats } from '@/lib/hooks/use-vo-stats';

// New Dashboard Components
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { AnimatedStatsHero } from '@/components/dashboard/animated-stats-hero';
import { ContractValueDisplay } from '@/components/dashboard/contract-value-display';
import { StatusRingCards } from '@/components/dashboard/status-ring-cards';
import { InteractiveVOTable } from '@/components/dashboard/interactive-vo-table';
import { FloatingActions } from '@/components/dashboard/floating-actions';
import { AmbientBackground } from '@/components/dashboard/ambient-background';

const ORIGINAL_CONTRACT_VALUE = 217501556.12;

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

  // Calculate stats for hero section
  const heroStats = stats ? {
    totalVOs: stats.counts.total,
    pendingCount: stats.counts.pendingWithFFC + stats.counts.pendingWithRSG + stats.counts.pendingWithRSGFFC,
    approvedCount: stats.counts.approvedAwaitingDVO + stats.counts.dvoRRIssued,
    totalSubmitted: stats.financials.totalSubmittedValue,
    totalApproved: stats.financials.totalApprovedValue,
  } : null;

  // Calculate revised contract value
  const revisedContractValue = stats
    ? ORIGINAL_CONTRACT_VALUE +
      (stats.statusBreakdown.find(s => s.status === 'ApprovedAwaitingDVO')?.amount || 0) +
      (stats.statusBreakdown.find(s => s.status === 'DVORRIssued')?.amount || 0)
    : ORIGINAL_CONTRACT_VALUE;

  return (
    <>
      {/* Ambient Background */}
      <AmbientBackground />

      {/* Main Content */}
      <div className="relative space-y-8">
        {/* Header Section */}
        <DashboardHeader
          onExport={handleExport}
          onPrint={handlePrint}
          isExporting={isExporting}
        />

        {/* Stats Hero Section */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Skeleton className="h-40 rounded-2xl" />
              </motion.div>
            ))}
          </div>
        ) : heroStats ? (
          <AnimatedStatsHero stats={heroStats} />
        ) : null}

        {/* Contract Value Display */}
        {!isLoading && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ContractValueDisplay
              originalValue={ORIGINAL_CONTRACT_VALUE}
              revisedValue={revisedContractValue}
            />
          </motion.div>
        )}

        {/* Status Breakdown Cards */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Skeleton className="h-36 rounded-2xl" />
                </motion.div>
              ))}
            </div>
          </div>
        ) : stats?.statusBreakdown ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <StatusRingCards
              statusBreakdown={stats.statusBreakdown}
              selectedStatus={filterStatus}
              onStatusSelect={setFilterStatus}
            />
          </motion.div>
        ) : null}

        {/* VO Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <InteractiveVOTable filterStatus={filterStatus} />
        </motion.div>

        {/* Floating Action Button (Mobile) */}
        <div className="md:hidden">
          <FloatingActions
            onExport={handleExport}
            onPrint={handlePrint}
            isExporting={isExporting}
          />
        </div>
      </div>
    </>
  );
}
