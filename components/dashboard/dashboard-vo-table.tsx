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
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-rsg-gold/20">
        <h2 className="text-2xl font-serif text-rsg-navy font-bold tracking-tight">
          {filterStatus ? `${STATUS_LABELS[filterStatus]}` : 'Variation Orders Log'}
          <span className="ml-3 text-sm font-sans font-normal text-slate-400">
            {vos.length} Records
          </span>
        </h2>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
        {/* Table Header (Desktop) */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-3 py-2 bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-6">Subject</div>
          <div className="col-span-2 text-right">Value</div>
          <div className="col-span-3 text-right">Status</div>
        </div>

        <div className="divide-y divide-slate-100">
          {vos.map((vo, index) => {
            const isExpanded = expandedRows.has(vo.id);
            const statusColors = STATUS_COLORS[vo.status] || STATUS_COLORS.PendingWithFFC;

            return (
              <div key={vo.id} className="group transition-colors duration-200 hover:bg-slate-50/40 bg-white">
                {/* Main Row */}
                <div
                  onClick={() => toggleRow(vo.id)}
                  className="cursor-pointer px-3 py-2 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center min-h-[40px]"
                >
                  {/* Mobile Top Row: ID & Status */}
                  <div className="sm:hidden flex justify-between items-center w-full mb-1">
                    <span className="text-[10px] font-mono text-slate-400">#{index + 1}</span>
                    <Badge variant="outline" className={`${statusColors.bg} ${statusColors.text} border-none rounded-none px-1.5 py-0 text-[9px] h-5`}>
                      {STATUS_LABELS[vo.status]?.replace('Pending with ', 'Pending ')}
                    </Badge>
                  </div>

                  {/* ID (Desktop) */}
                  <div className="hidden sm:block col-span-1 text-xs font-mono text-slate-400">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  {/* Subject */}
                  <div className="col-span-1 sm:col-span-6">
                    <h3 className={`text-xs sm:text-sm font-medium text-rsg-navy group-hover:text-rsg-gold transition-colors ${isExpanded ? 'whitespace-normal leading-relaxed' : 'truncate'}`}>
                      {vo.subject}
                    </h3>
                    <div className="sm:hidden mt-1 flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-mono">{formatDate(vo.submissionDate)}</span>
                      <div className="font-mono text-xs font-bold text-rsg-navy">
                        {formatCurrency(vo.approvedAmount || vo.proposalValue)}
                      </div>
                    </div>
                  </div>

                  {/* Value (Desktop) */}
                  <div className="hidden sm:block col-span-2 text-right">
                    <div className={`font-mono text-xs font-semibold ${vo.approvedAmount ? 'text-emerald-700' : 'text-slate-600'}`}>
                      {formatCurrency(vo.approvedAmount || vo.proposalValue)}
                    </div>
                  </div>

                  {/* Status (Desktop) */}
                  <div className="hidden sm:flex col-span-3 justify-end items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-mono">{formatDate(vo.submissionDate)}</span>
                    <Badge variant="secondary" className={`${statusColors.bg} ${statusColors.text} rounded-sm px-1.5 py-0 font-medium uppercase text-[9px] tracking-wide border-0 h-5`}>
                      {STATUS_LABELS[vo.status]?.replace('Pending with ', 'Pending ')}
                    </Badge>
                    {isExpanded ? <ChevronDown className="h-3 w-3 text-rsg-gold" /> : <ChevronRight className="h-3 w-3 text-slate-300" />}
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden bg-slate-50/30 border-t border-slate-100/50 shadow-inner"
                    >
                      <div className="p-3 sm:px-12 sm:py-4 grid gap-4 grid-cols-1 lg:grid-cols-12 text-xs">
                        {/* Details Column */}
                        <div className="lg:col-span-8 space-y-3">
                          {/* References Grid */}
                          <div className="flex flex-wrap gap-4 sm:gap-8 p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                            {vo.submissionReference && (
                              <div>
                                <p className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">Ref No</p>
                                <p className="font-mono text-rsg-navy">{vo.submissionReference}</p>
                              </div>
                            )}
                            {vo.vorReference && (
                              <div>
                                <p className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">VOR Ref</p>
                                <p className="font-mono text-rsg-navy">{vo.vorReference}</p>
                              </div>
                            )}
                            {vo.dvoReference && (
                              <div>
                                <p className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">DVO Ref</p>
                                <p className="font-mono text-rsg-navy">{vo.dvoReference}</p>
                              </div>
                            )}
                          </div>

                          {/* Notes */}
                          {(vo.remarks) && (
                            <div className="pl-1 border-l-2 border-rsg-gold/20">
                              <p className="text-[9px] uppercase tracking-wider text-slate-400 mb-1">Remarks</p>
                              <p className="text-slate-600 leading-relaxed font-light">{vo.remarks}</p>
                            </div>
                          )}
                        </div>

                        {/* Actions Column */}
                        <div className="lg:col-span-4 flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/vos/${vo.id}/edit`;
                            }}
                            className="bg-white border border-rsg-gold/50 text-rsg-gold hover:bg-rsg-gold hover:text-white transition-colors h-8 px-4 text-[10px] uppercase tracking-widest font-semibold shadow-sm"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/vos/${vo.id}`;
                            }}
                            className="bg-rsg-navy text-white hover:bg-slate-800 transition-colors h-8 px-4 text-[10px] uppercase tracking-widest font-semibold shadow-sm"
                          >
                            View Full
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
