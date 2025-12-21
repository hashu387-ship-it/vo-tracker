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
      {/* Header */}
      <div className="flex items-center justify-between pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            {filterStatus ? `${STATUS_LABELS[filterStatus]}` : 'Variation Orders'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal">
            Active Project Registry
          </p>
        </div>
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/60 dark:border-white/10 shadow-sm">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
            {vos.length} Records
          </span>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-900/60 backdrop-blur-3xl ring-1 ring-black/5 dark:ring-white/5">

        <div className="relative">
          {/* Table Header (Desktop) - Sticky Frosty Header */}
          <div className="hidden sm:grid grid-cols-12 gap-6 px-6 py-4 bg-white/60 dark:bg-slate-900/80 border-b border-white/50 dark:border-white/10 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest backdrop-blur-md sticky top-0 z-20">
            <div className="col-span-1">#</div>
            <div className="col-span-6">Subject</div>
            <div className="col-span-2 text-right">Value</div>
            <div className="col-span-3 text-right">Status</div>
          </div>

          <div className="divide-y divide-slate-200/50 dark:divide-white/5">
            {vos.map((vo, index) => {
              const isExpanded = expandedRows.has(vo.id);
              const statusColors = STATUS_COLORS[vo.status] || STATUS_COLORS.PendingWithFFC;

              return (
                <div key={vo.id} className="group hover:bg-white/60 dark:hover:bg-white/5 transition-colors duration-200">
                  {/* Main Row */}
                  <div
                    onClick={() => toggleRow(vo.id)}
                    className="cursor-pointer px-6 py-5 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center min-h-[70px]"
                  >
                    {/* Mobile Top Row: ID & Status */}
                    <div className="sm:hidden flex justify-between items-center w-full mb-3">
                      <span className="text-xs font-mono text-slate-400 dark:text-slate-500 font-bold">#{String(index + 1).padStart(2, '0')}</span>
                      <Badge variant="outline" className={`${statusColors.bg} ${statusColors.text} border-transparent ring-1 ring-inset ring-black/5 dark:ring-white/10 rounded-full px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-sm`}>
                        {STATUS_LABELS[vo.status]?.replace('Pending with ', 'Pending ')}
                      </Badge>
                    </div>

                    {/* ID (Desktop) */}
                    <div className="hidden sm:block col-span-1 text-sm font-mono text-slate-400 dark:text-slate-500 font-bold group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    {/* Subject */}
                    <div className="col-span-1 sm:col-span-6">
                      <h3 className={`text-sm sm:text-[15px] font-semibold text-slate-800 dark:text-slate-200 group-hover:text-rsg-navy dark:group-hover:text-white transition-colors ${isExpanded ? 'whitespace-normal leading-relaxed' : 'truncate'}`}>
                        {vo.subject}
                      </h3>
                      {/* Mobile Secondary Info */}
                      <div className="sm:hidden mt-3 flex justify-between items-center bg-slate-50/50 dark:bg-white/5 p-3 rounded-lg border border-slate-100 dark:border-white/5">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(vo.submissionDate)}</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatCurrency(vo.approvedAmount || vo.proposalValue)}</span>
                      </div>
                    </div>

                    {/* Value (Desktop) */}
                    <div className="hidden sm:block col-span-2 text-right">
                      <div className={`font-mono text-sm font-bold tracking-tight ${vo.approvedAmount ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {formatCurrency(vo.approvedAmount || vo.proposalValue)}
                      </div>
                      {vo.approvedAmount && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-1.5 py-0.5 rounded ml-2 uppercase tracking-wide">Approved</span>}
                    </div>

                    {/* Status (Desktop) */}
                    <div className="hidden sm:flex col-span-3 justify-end items-center gap-4">
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{formatDate(vo.submissionDate)}</span>
                      <Badge variant="secondary" className={`${statusColors.bg} ${statusColors.text} rounded-full px-3 py-1 font-bold text-[10px] border-0 backdrop-blur-md bg-opacity-30 uppercase tracking-wider min-w-[110px] justify-center shadow-sm`}>
                        {STATUS_LABELS[vo.status]?.replace('Pending with ', 'Pending ')}
                      </Badge>
                      <div className={`text-slate-400 dark:text-slate-500 transition-all duration-300 ${isExpanded ? 'rotate-180 text-rsg-gold' : 'group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details - Clean Light Slide / Dark Obsidian */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'circOut' }}
                        className="overflow-hidden border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 shadow-inner"
                      >
                        <div className="px-6 py-6 sm:px-12 sm:py-8 grid gap-8 grid-cols-1 lg:grid-cols-12 text-sm">
                          {/* Details Column */}
                          <div className="lg:col-span-8 space-y-6">
                            {/* References Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {['submissionReference', 'vorReference', 'dvoReference'].map((refKey) => {
                                // @ts-ignore
                                const val = vo[refKey];
                                if (!val) return null;
                                return (
                                  <div key={refKey} className="bg-white dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold mb-1.5">
                                      {refKey.replace('Reference', ' Ref')}
                                    </p>
                                    <p className="font-mono text-slate-700 dark:text-slate-200 font-bold tracking-tight">{val}</p>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Remarks */}
                            {vo.remarks && (
                              <div className="p-5 rounded-xl bg-orange-50 dark:bg-amber-900/10 border border-orange-100 dark:border-amber-500/10">
                                <p className="text-[10px] uppercase tracking-widest text-orange-600/60 dark:text-amber-500/80 font-bold mb-2 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 dark:bg-amber-500" />
                                  Remarks
                                </p>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl font-medium">{vo.remarks}</p>
                              </div>
                            )}
                          </div>

                          {/* Actions Column */}
                          <div className="lg:col-span-4 flex items-center justify-end gap-3 self-center lg:self-start">
                            <Button
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/vos/${vo.id}/edit`;
                              }}
                              className="bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 h-10 px-6 text-xs font-bold uppercase tracking-widest shadow-sm hover:shadow-md transition-all rounded-lg"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/vos/${vo.id}`;
                              }}
                              className="bg-slate-900 dark:bg-rsg-gold hover:bg-slate-800 dark:hover:bg-[#B08D55] text-white h-10 px-6 text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-xl transition-all rounded-lg dark:text-white"
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
