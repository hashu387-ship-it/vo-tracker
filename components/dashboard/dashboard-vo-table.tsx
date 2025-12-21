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

      <div className="relative group rounded-3xl p-[1px] bg-gradient-to-br from-white/80 via-white/50 to-white/20 shadow-2xl shadow-rsg-navy/5">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-3xl" />

        <div className="relative bg-white/60 backdrop-blur-md rounded-3xl overflow-hidden">
          {/* Table Header (Desktop) - Glassy Header */}
          <div className="hidden sm:grid grid-cols-12 gap-6 px-8 py-5 border-b border-white/50 text-xs font-bold text-rsg-navy/60 uppercase tracking-widest bg-white/20">
            <div className="col-span-1">#</div>
            <div className="col-span-6">Subject</div>
            <div className="col-span-2 text-right">Value</div>
            <div className="col-span-3 text-right">Status</div>
          </div>

          <div className="divide-y divide-white/40">
            {vos.map((vo, index) => {
              const isExpanded = expandedRows.has(vo.id);
              const statusColors = STATUS_COLORS[vo.status] || STATUS_COLORS.PendingWithFFC;

              return (
                <div key={vo.id} className="group/row transition-all duration-300 hover:bg-white/60 hover:shadow-lg hover:shadow-rsg-navy/5 hover:-translate-y-[1px] relative z-0 hover:z-10">
                  {/* Main Row */}
                  <div
                    onClick={() => toggleRow(vo.id)}
                    className="cursor-pointer px-8 py-5 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center min-h-[70px]"
                  >
                    {/* Mobile Top Row: ID & Status */}
                    <div className="sm:hidden flex justify-between items-center w-full mb-3">
                      <span className="text-xs font-mono text-rsg-navy/40 font-bold bg-rsg-navy/5 px-2 py-1 rounded-md">#{String(index + 1).padStart(2, '0')}</span>
                      <Badge variant="outline" className={`${statusColors.bg} ${statusColors.text} border-0 ring-1 ring-inset ring-black/5 rounded-full px-3 py-1 text-[10px] font-bold shadow-sm backdrop-blur-md`}>
                        {STATUS_LABELS[vo.status]?.replace('Pending with ', 'Pending ')}
                      </Badge>
                    </div>

                    {/* ID (Desktop) */}
                    <div className="hidden sm:block col-span-1 text-sm font-mono text-rsg-navy/30 font-bold">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    {/* Subject */}
                    <div className="col-span-1 sm:col-span-6">
                      <h3 className={`text-sm sm:text-[15px] font-medium text-rsg-navy group-hover/row:text-rsg-gold transition-colors ${isExpanded ? 'whitespace-normal leading-relaxed' : 'truncate'}`}>
                        {vo.subject}
                      </h3>
                      <div className="sm:hidden mt-3 flex justify-between items-center bg-white/40 p-3 rounded-xl border border-white/50 shadow-sm">
                        <span className="text-xs text-rsg-navy/50 font-medium">{formatDate(vo.submissionDate)}</span>
                        <div className="font-mono text-sm font-bold text-rsg-navy">
                          {formatCurrency(vo.approvedAmount || vo.proposalValue)}
                        </div>
                      </div>
                    </div>

                    {/* Value (Desktop) */}
                    <div className="hidden sm:block col-span-2 text-right">
                      <div className={`font-mono text-sm font-bold tracking-tight ${vo.approvedAmount ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {formatCurrency(vo.approvedAmount || vo.proposalValue)}
                      </div>
                      {vo.approvedAmount && <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest bg-emerald-50/50 px-2 py-0.5 rounded-full">Approved</span>}
                    </div>

                    {/* Status (Desktop) */}
                    <div className="hidden sm:flex col-span-3 justify-end items-center gap-6">
                      <span className="text-xs text-rsg-navy/40 font-medium">{formatDate(vo.submissionDate)}</span>
                      <Badge variant="secondary" className={`${statusColors.bg} ${statusColors.text} rounded-full px-3 py-1 font-bold uppercase text-[10px] tracking-wide border border-white/20 shadow-sm backdrop-blur-md min-w-[110px] justify-center`}>
                        {STATUS_LABELS[vo.status]?.replace('Pending with ', 'Pending ')}
                      </Badge>
                      <div className={`p-2 rounded-full transition-all duration-300 ${isExpanded ? 'bg-rsg-gold/10 text-rsg-gold rotate-180' : 'text-slate-300 group-hover/row:text-slate-400 group-hover/row:translate-x-1'}`}>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details - Glassy Reveal */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'circOut' }}
                        className="overflow-hidden bg-white/30 border-t border-white/50 backdrop-blur-sm"
                      >
                        <div className="p-8 sm:px-12 grid gap-8 grid-cols-1 lg:grid-cols-12 text-sm">
                          {/* Details Column */}
                          <div className="lg:col-span-8 space-y-6">
                            {/* References Grid - Glass Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {['submissionReference', 'vorReference', 'dvoReference'].map((refKey) => {
                                // @ts-ignore
                                const val = vo[refKey];
                                if (!val) return null;
                                return (
                                  <div key={refKey} className="bg-white/60 p-4 rounded-xl border border-white/60 shadow-sm backdrop-blur-md">
                                    <p className="text-[10px] uppercase tracking-widest text-rsg-navy/40 font-bold mb-2">
                                      {refKey.replace('Reference', ' Ref').replace('submission', 'Sub')}
                                    </p>
                                    <p className="font-mono text-rsg-navy font-bold text-sm tracking-tight">{val}</p>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Notes */}
                            {(vo.remarks) && (
                              <div className="bg-amber-50/30 p-5 rounded-2xl border border-amber-100/50">
                                <p className="text-[10px] uppercase tracking-widest text-amber-900/40 font-bold mb-2 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                  Remarks
                                </p>
                                <p className="text-rsg-navy/80 leading-relaxed font-normal text-base">{vo.remarks}</p>
                              </div>
                            )}
                          </div>

                          {/* Actions Column */}
                          <div className="lg:col-span-4 flex items-center justify-end gap-3 self-end">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/vos/${vo.id}/edit`;
                              }}
                              className="bg-white/80 border border-white text-rsg-navy hover:bg-white hover:shadow-lg transition-all h-11 px-6 text-xs uppercase tracking-widest font-bold shadow-sm rounded-xl backdrop-blur-md"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/vos/${vo.id}`;
                              }}
                              className="bg-rsg-gold text-white hover:bg-[#B08D55] hover:shadow-lg hover:shadow-rsg-gold/20 transition-all h-11 px-8 text-xs uppercase tracking-widest font-bold shadow-md rounded-xl"
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
    </div>
  );
}
