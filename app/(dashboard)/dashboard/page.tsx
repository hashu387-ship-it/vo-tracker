'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useVOStats } from '@/lib/hooks/use-vo-stats';
import { useUser } from '@clerk/nextjs';

// New Dashboard Components
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { AnimatedStatsHero } from '@/components/dashboard/animated-stats-hero';
import { ContractValueDisplay } from '@/components/dashboard/contract-value-display';
import { StatusRingCards } from '@/components/dashboard/status-ring-cards';
import { InteractiveVOTable } from '@/components/dashboard/interactive-vo-table';
import { FloatingActions } from '@/components/dashboard/floating-actions';
import { AmbientBackground } from '@/components/dashboard/ambient-background';
import { DemoDisclaimer } from '@/components/ui/demo-disclaimer';

const ORIGINAL_CONTRACT_VALUE = 217501556.12;

// Demo stats for guest mode
const demoStats = {
  counts: {
    total: 12,
    pendingWithFFC: 2,
    pendingWithRSG: 3,
    pendingWithRSGFFC: 1,
    approvedAwaitingDVO: 4,
    dvoRRIssued: 2,
  },
  financials: {
    totalSubmittedValue: 4580000,
    totalApprovedValue: 2855000,
  },
  statusBreakdown: [
    { status: 'PendingWithFFC', label: 'Pending with FFC', count: 2, amount: 630000, color: '#f59e0b', gradient: 'from-amber-500 to-orange-500' },
    { status: 'PendingWithRSG', label: 'Pending with RSG', count: 3, amount: 1270000, color: '#3b82f6', gradient: 'from-blue-500 to-indigo-500' },
    { status: 'PendingWithRSGFFC', label: 'Pending RSG/FFC', count: 1, amount: 350000, color: '#8b5cf6', gradient: 'from-violet-500 to-purple-500' },
    { status: 'ApprovedAwaitingDVO', label: 'Approved Awaiting DVO', count: 4, amount: 1750000, color: '#10b981', gradient: 'from-emerald-500 to-teal-500' },
    { status: 'DVORRIssued', label: 'DVO/RR Issued', count: 2, amount: 1105000, color: '#06b6d4', gradient: 'from-cyan-500 to-sky-500' },
  ],
};

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useUser();
  const { data: stats, isLoading } = useVOStats();
  const [isExporting, setIsExporting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Demo mode check
  const isDemo = isLoaded && !isSignedIn;
  const activeStats = isDemo ? demoStats : stats;
  const activeLoading = isDemo ? false : isLoading;

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
  const heroStats = activeStats ? {
    totalVOs: activeStats.counts.total,
    pendingCount: activeStats.counts.pendingWithFFC + activeStats.counts.pendingWithRSG + activeStats.counts.pendingWithRSGFFC,
    approvedCount: activeStats.counts.approvedAwaitingDVO + activeStats.counts.dvoRRIssued,
    totalSubmitted: activeStats.financials.totalSubmittedValue,
    totalApproved: activeStats.financials.totalApprovedValue,
  } : null;

  // Calculate revised contract value
  const revisedContractValue = activeStats
    ? ORIGINAL_CONTRACT_VALUE +
      (activeStats.statusBreakdown.find(s => s.status === 'ApprovedAwaitingDVO')?.amount || 0) +
      (activeStats.statusBreakdown.find(s => s.status === 'DVORRIssued')?.amount || 0)
    : ORIGINAL_CONTRACT_VALUE;

  return (
    <>
      {/* Ambient Background */}
      <AmbientBackground />

      {/* Main Content */}
      <div className="relative space-y-8">
        {/* Demo Mode Disclaimer */}
        {isDemo && <DemoDisclaimer type="card" />}

        {/* Header Section */}
        <DashboardHeader
          onExport={handleExport}
          onPrint={handlePrint}
          isExporting={isExporting}
        />

        {/* Stats Hero Section */}
        {activeLoading ? (
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
        {!activeLoading && activeStats && (
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
        {activeLoading ? (
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
        ) : activeStats?.statusBreakdown ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <StatusRingCards
              statusBreakdown={activeStats.statusBreakdown}
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
