'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { ChevronDown, ChevronRight, DollarSign, FileText, Calendar, Tag, MessageSquare, User, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useVOs } from '@/lib/hooks/use-vos';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedNumber } from '@/components/ui/animated-number';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string; lightBg: string }> = {
  PendingWithFFC: {
    bg: 'bg-orange-50/50 dark:bg-orange-950/30',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200/50 dark:border-orange-800/50',
    gradient: 'from-orange-500 to-orange-600',
    lightBg: 'from-orange-50/50 to-orange-100/30 dark:from-orange-950/30 dark:to-orange-900/20',
  },
  PendingWithRSG: {
    bg: 'bg-amber-50/50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200/50 dark:border-amber-800/50',
    gradient: 'from-amber-500 to-amber-600',
    lightBg: 'from-amber-50/50 to-amber-100/30 dark:from-amber-950/30 dark:to-amber-900/20',
  },
  PendingWithRSGFFC: {
    bg: 'bg-yellow-50/50 dark:bg-yellow-950/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200/50 dark:border-yellow-800/50',
    gradient: 'from-yellow-400 to-yellow-500',
    lightBg: 'from-yellow-50/50 to-yellow-100/30 dark:from-yellow-950/30 dark:to-yellow-900/20',
  },
  ApprovedAwaitingDVO: {
    bg: 'bg-cyan-50/50 dark:bg-cyan-950/30',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200/50 dark:border-cyan-800/50',
    gradient: 'from-cyan-500 to-cyan-600',
    lightBg: 'from-cyan-50/50 to-cyan-100/30 dark:from-cyan-950/30 dark:to-cyan-900/20',
  },
  DVORRIssued: {
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200/50 dark:border-emerald-800/50',
    gradient: 'from-emerald-500 to-emerald-600',
    lightBg: 'from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/20',
  },
};

const STATUS_LABELS: Record<string, string> = {
  PendingWithFFC: 'Pending with FFC',
  PendingWithRSG: 'Pending with RSG',
  PendingWithRSGFFC: 'Pending with RSG/FFC',
  ApprovedAwaitingDVO: 'Approved & Awaiting DVO',
  DVORRIssued: 'DVO RR Issued',
};

export function DashboardVOTable({ filterStatus }: { filterStatus: string | null }) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const { data, isLoading } = useVOs({});

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const allDOs = data?.data || [];
  const vos = filterStatus
    ? allDOs.filter(vo => vo.status === filterStatus)
    : allDOs;

  if (vos.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-card to-secondary/10 p-12 text-center border border-border/50">
        <div className="mx-auto h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 animate-pulse-subtle">
          <FileText className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          {filterStatus ? `No ${STATUS_LABELS[filterStatus]} VOs Found` : 'No Variation Orders Found'}
        </h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          {filterStatus ? 'Try selecting a different status or clear the filter.' : 'Start by creating your first variation order to track its progress.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {filterStatus ? `${STATUS_LABELS[filterStatus]} (${vos.length})` : `All Variation Orders (${vos.length})`}
        </h2>
      </div>

      <div className="space-y-2">
        {vos.map((vo, index) => {
          const isExpanded = expandedRows.has(vo.id);
          const statusColors = STATUS_COLORS[vo.status] || STATUS_COLORS.PendingWithFFC;

          return (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={vo.id}
              className={`relative overflow-hidden rounded-lg transition-all duration-300 
                ${isExpanded
                  ? 'bg-card shadow-lg ring-1 ring-primary/20'
                  : 'bg-card/50 hover:bg-card border border-border/40 hover:border-border hover:shadow-sm'
                }`}
            >
              <div
                onClick={() => toggleRow(vo.id)}
                className="cursor-pointer py-1.5 px-2 flex items-center justify-between gap-2 group"
              >
                {/* Left Section */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all duration-300
                    ${isExpanded ? 'bg-primary text-primary-foreground shadow-sm scale-105' : 'bg-secondary/80 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}
                  `}>
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {/* Use S.No from data if possible, but we don't store it explicitly as S.No. Using index is fine as user asked "like this #23" */}
                      <span className="text-[10px] font-medium text-muted-foreground bg-secondary/30 px-1 rounded border border-border/30 whitespace-nowrap">
                        #{index + 1}
                      </span>
                      <h3 className="text-[11px] sm:text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors leading-tight">
                        {vo.subject}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Middle Section: Amount */}
                <div className="hidden sm:flex flex-col items-end">
                  {['ApprovedAwaitingDVO', 'DVORRIssued'].includes(vo.status) ? (
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shadow-sm">
                        <CheckCircle2 className="h-3 w-3" />
                        <span className="text-xs font-bold">{formatCurrency(vo.approvedAmount).replace('$', '')}</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground/70 uppercase tracking-wider scale-90">Approved</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground/90 bg-secondary/50 px-1.5 py-0.5 rounded">
                      <span className="text-xs font-semibold">{formatCurrency(vo.proposalValue).replace('$', '')}</span>
                    </div>
                  )}
                </div>

                {/* Right Section: Status & Date */}
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                  <Badge
                    variant="outline"
                    className={`
                      ${statusColors.bg} ${statusColors.text} ${statusColors.border}
                      border px-1.5 py-0 rounded text-[9px] font-medium uppercase tracking-wider whitespace-nowrap h-4 flex items-center
                    `}
                  >
                    {/* Shorten status text on mobile if needed, though labels are generally short enough */}
                    {STATUS_LABELS[vo.status]?.replace('Pending with ', 'Pending ')?.replace('Approved & Awaiting', 'Approved')}
                  </Badge>
                  <div className="flex items-center gap-1 text-muted-foreground/60">
                    <span className="text-[9px] font-mono">
                      {formatDate(vo.submissionDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded View */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0 space-y-4">
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent mb-4" />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Financial Card - Dynamic Display */}
                        <div className="neo-card-inset rounded-xl p-4 space-y-3 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <DollarSign className="h-24 w-24 -rotate-12 transform" />
                          </div>

                          <div className="flex items-center gap-2 mb-4 relative z-10">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 shadow-sm">
                              <DollarSign className="h-5 w-5" />
                            </div>
                            <h4 className="text-base font-bold text-foreground">Financial Overview</h4>
                          </div>

                          <div className="space-y-3 relative z-10">
                            {/* Logic: Show Proposal Value for ALL statuses (as baseline) */}
                            <div className="flex justify-between items-center p-3 rounded-xl bg-background/40 border border-border/30 hover:bg-background/60 transition-colors">
                              <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                                  {vo.status === 'PendingWithFFC' ? 'Estimated Value' : 'Proposal Value'}
                                </span>
                              </div>
                              <span className="font-mono text-lg font-bold text-foreground">
                                <AnimatedNumber value={vo.proposalValue || 0} />
                              </span>
                            </div>

                            {/* Logic: Show Assessment if PendingWithRSG or later */}
                            {['PendingWithRSG', 'PendingWithRSGFFC', 'ApprovedAwaitingDVO', 'DVORRIssued'].includes(vo.status) && (
                              <div className="flex justify-between items-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-colors">
                                <div className="flex flex-col">
                                  <span className="text-amber-700 dark:text-amber-400 text-xs uppercase tracking-wider font-semibold">Assessment Value</span>
                                </div>
                                <span className="font-mono text-lg font-bold text-amber-700 dark:text-amber-400">
                                  <AnimatedNumber value={vo.assessmentValue || 0} />
                                </span>
                              </div>
                            )}

                            {/* Logic: Show Approved Amount ONLY if Approved/DVO status */}
                            {['ApprovedAwaitingDVO', 'DVORRIssued'].includes(vo.status) && (
                              <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 shadow-sm"
                              >
                                <div className="flex flex-col">
                                  <span className="text-emerald-700 dark:text-emerald-400 text-xs uppercase tracking-wider font-bold flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Approved Amount
                                  </span>
                                </div>
                                <span className="font-mono text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                                  <AnimatedNumber value={vo.approvedAmount || 0} />
                                </span>
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {/* Details Card */}
                        <div className="neo-card-inset rounded-xl p-4 space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-600">
                              <FileText className="h-4 w-4" />
                            </div>
                            <h4 className="text-sm font-semibold text-foreground">References</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="p-2 rounded-lg bg-background/50 space-y-1">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Submission Ref</span>
                              <p className="font-medium text-foreground truncate">{vo.submissionReference}</p>
                            </div>
                            {vo.responseReference && (
                              <div className="p-2 rounded-lg bg-background/50 space-y-1">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Response Ref</span>
                                <p className="font-medium text-foreground truncate">{vo.responseReference}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Metadata Card */}
                        <div className="neo-card-inset rounded-xl p-4 space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <h4 className="text-sm font-semibold text-foreground">Metadata</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-background/50">
                              <span className="text-muted-foreground text-xs">Date</span>
                              <span className="font-medium">{formatDate(vo.submissionDate)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-background/50">
                              <span className="text-muted-foreground text-xs">Type</span>
                              <Badge variant="outline" className="h-5 text-[10px] font-normal">{vo.submissionType}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes / Actions Footer */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        {vo.remarks && (
                          <div className="flex-1 p-3 rounded-xl bg-secondary/30 border border-border/50 text-sm">
                            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                              <MessageSquare className="h-3 w-3" />
                              <span className="text-xs font-medium uppercase tracking-wide">Remarks</span>
                            </div>
                            <p className="text-foreground/90 pl-5">{vo.remarks}</p>
                          </div>
                        )}

                        <div className="flex sm:flex-col gap-2 justify-end min-w-[140px]">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/vos/${vo.id}`;
                            }}
                          >
                            <FileText className="h-3.5 w-3.5" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start gap-2 hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/vos/${vo.id}/edit`;
                            }}
                          >
                            <Tag className="h-3.5 w-3.5" />
                            Edit VO
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div >
  );
}
