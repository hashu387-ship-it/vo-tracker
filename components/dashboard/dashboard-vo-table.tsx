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

      <div className="bg-white rounded-none border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header (Desktop) */}
        <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-rsg-navy uppercase tracking-wider">
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
              <div key={vo.id} className="group transition-colors duration-200 hover:bg-slate-50/50">
                {/* Main Row */}
                <div
                  onClick={() => toggleRow(vo.id)}
                  className="cursor-pointer p-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center"
                >
                  {/* Mobile Top Row: ID & Status */}
                  <div className="sm:hidden flex justify-between items-center w-full mb-2">
                    <span className="text-xs font-mono text-slate-400">#{index + 1}</span>
                    <Badge variant="outline" className={`${statusColors.bg} ${statusColors.text} border-none rounded-none px-2`}>
                      {STATUS_LABELS[vo.status]?.replace('Pending with ', 'Pending ')}
                    </Badge>
                  </div>

                  {/* ID (Desktop) */}
                  <div className="hidden sm:block col-span-1 text-sm font-mono text-slate-400">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  {/* Subject */}
                  <div className="col-span-1 sm:col-span-6">
                    <h3 className={`text-sm sm:text-base font-medium text-rsg-navy group-hover:text-rsg-gold transition-colors ${isExpanded ? 'whitespace-normal' : 'truncate'}`}>
                      {vo.subject}
                    </h3>
                    <div className="sm:hidden mt-2 flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-mono">{formatDate(vo.submissionDate)}</span>
                      <div className="font-mono text-sm font-bold text-rsg-navy">
                        {formatCurrency(vo.approvedAmount || vo.proposalValue)}
                      </div>
                    </div>
                  </div>

                  {/* Value (Desktop) */}
                  <div className="hidden sm:block col-span-2 text-right">
                    <div className={`font-mono text-sm font-semibold ${vo.approvedAmount ? 'text-emerald-700' : 'text-slate-600'}`}>
                      {formatCurrency(vo.approvedAmount || vo.proposalValue)}
                    </div>
                    {vo.approvedAmount && <span className="text-[10px] text-emerald-600/70 uppercase">Approved</span>}
                  </div>

                  {/* Status (Desktop) */}
                  <div className="hidden sm:flex col-span-3 justify-end items-center gap-4">
                    <span className="text-xs text-slate-400 font-mono">{formatDate(vo.submissionDate)}</span>
                    <Badge variant="secondary" className={`${statusColors.bg} ${statusColors.text} rounded-sm px-2 py-0.5 font-normal uppercase text-[10px] tracking-wider border-0`}>
                      {STATUS_LABELS[vo.status]?.replace('Pending with ', 'Pending ')}
                    </Badge>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-rsg-gold" /> : <ChevronRight className="h-4 w-4 text-slate-300" />}
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
                      className="overflow-hidden bg-slate-50/50 border-t border-slate-100"
                    >
                      <div className="p-4 sm:p-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-12">
                        {/* Details Column */}
                        <div className="sm:col-span-1 lg:col-span-8 space-y-6">
                          {/* References Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {vo.submissionReference && (
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Ref No</p>
                                <p className="text-xs font-mono text-rsg-navy">{vo.submissionReference}</p>
                              </div>
                            )}
                            {vo.vorReference && (
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">VOR Ref</p>
                                <p className="text-xs font-mono text-rsg-navy">{vo.vorReference}</p>
                              </div>
                            )}
                            {vo.dvoReference && (
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">DVO Ref</p>
                                <p className="text-xs font-mono text-rsg-navy">{vo.dvoReference}</p>
                              </div>
                            )}
                          </div>

                          {/* Notes */}
                          {(vo.remarks) && (
                            <div className="pt-4 border-t border-slate-200/50">
                              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Remarks</p>
                              <p className="text-sm text-slate-600 leading-relaxed font-light">{vo.remarks}</p>
                            </div>
                          )}
                        </div>

                        {/* Actions Column */}
                        <div className="sm:col-span-1 lg:col-span-4 flex flex-col justify-end gap-3">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/vos/${vo.id}/edit`;
                            }}
                            className="w-full bg-white border border-rsg-gold text-rsg-gold hover:bg-rsg-gold hover:text-white transition-colors rounded-none h-10 uppercase tracking-widest text-xs font-semibold"
                          >
                            Edit Record
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/vos/${vo.id}`;
                            }}
                            className="w-full bg-rsg-navy text-white hover:bg-slate-800 transition-colors rounded-none h-10 uppercase tracking-widest text-xs font-semibold"
                          >
                            View Details
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
