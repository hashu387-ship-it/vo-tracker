'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, DollarSign, FileText, Calendar, Tag, MessageSquare, User } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useVOs } from '@/lib/hooks/use-vos';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string; lightBg: string }> = {
  PendingWithFFC: {
    bg: 'bg-orange-50 dark:bg-orange-950',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
    gradient: 'from-orange-500 to-orange-600',
    lightBg: 'from-orange-50/50 to-orange-100/30 dark:from-orange-950/30 dark:to-orange-900/20',
  },
  PendingWithRSG: {
    bg: 'bg-amber-50 dark:bg-amber-950',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    gradient: 'from-amber-500 to-amber-600',
    lightBg: 'from-amber-50/50 to-amber-100/30 dark:from-amber-950/30 dark:to-amber-900/20',
  },
  PendingWithRSGFFC: {
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800',
    gradient: 'from-yellow-400 to-yellow-500',
    lightBg: 'from-yellow-50/50 to-yellow-100/30 dark:from-yellow-950/30 dark:to-yellow-900/20',
  },
  ApprovedAwaitingDVO: {
    bg: 'bg-cyan-50 dark:bg-cyan-950',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-800',
    gradient: 'from-cyan-500 to-cyan-600',
    lightBg: 'from-cyan-50/50 to-cyan-100/30 dark:from-cyan-950/30 dark:to-cyan-900/20',
  },
  DVORRIssued: {
    bg: 'bg-green-50 dark:bg-green-950',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
    gradient: 'from-green-500 to-green-600',
    lightBg: 'from-green-50/50 to-green-100/30 dark:from-green-950/30 dark:to-green-900/20',
  },
};

const STATUS_LABELS: Record<string, string> = {
  PendingWithFFC: 'Pending with FFC',
  PendingWithRSG: 'Pending with RSG',
  PendingWithRSGFFC: 'Pending with RSG/FFC',
  ApprovedAwaitingDVO: 'Approved & Awaiting DVO',
  DVORRIssued: 'DVO RR Issued',
};

export function DashboardVOTable() {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const { data, isLoading } = useVOs({ limit: 50 });

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

  const vos = data?.data || [];

  if (vos.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-blue-950 dark:via-slate-900 dark:to-amber-950 p-12 text-center shadow-lg">
        <FileText className="mx-auto h-16 w-16 text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
          No Variation Orders Found
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          Create your first VO to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
        Recent Variation Orders
      </h2>

      <div className="space-y-3">
        {vos.map((vo, index) => {
          const isExpanded = expandedRows.has(vo.id);
          const statusColors = STATUS_COLORS[vo.status] || STATUS_COLORS.PendingWithFFC;

          return (
            <motion.div
              key={vo.id}
              layout
              className={`relative overflow-hidden rounded-lg transition-all duration-300 bg-white dark:bg-slate-800 ${isExpanded
                  ? 'shadow-lg border-2 border-blue-200 dark:border-blue-800'
                  : 'shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md'
                }`}
            >
              {/* Collapsed View - Name, Amount, Status */}
              <div
                onClick={() => toggleRow(vo.id)}
                className="cursor-pointer p-3 flex items-center justify-between gap-4"
              >
                {/* Left Section: VO Name with Serial */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-white" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-semibold text-slate-700 dark:text-slate-300">
                        {index + 1}.
                      </span>
                      <h3 className="text-base font-medium text-slate-900 dark:text-slate-100 truncate">
                        {vo.subject}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Serial #{vo.id}
                    </p>
                    {/* Comments/Details Section */}
                    {(vo.remarks || vo.actionNotes) && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 truncate">
                        {vo.remarks || vo.actionNotes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Middle Section: Amount */}
                <div className="flex flex-col items-end">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Proposal</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(vo.proposalValue)}
                  </p>
                </div>

                {/* Right Section: Status */}
                <div className="flex-shrink-0">
                  <Badge
                    className={`${statusColors.bg} ${statusColors.text} border px-4 py-1.5 text-sm font-medium rounded-full`}
                  >
                    {STATUS_LABELS[vo.status] || vo.status}
                  </Badge>
                </div>
              </div>

              {/* Expanded View - Full Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 space-y-6 border-t border-slate-200 dark:border-slate-700">
                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Financial Details */}
                        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-4 shadow-inner">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                              <DollarSign className="h-4 w-4 text-white" />
                            </div>
                            <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">Financial</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Assessment:</span>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {formatCurrency(vo.assessmentValue)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Proposal:</span>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {formatCurrency(vo.proposalValue)}
                              </span>
                            </div>
                            {(vo.approvedAmount || 0) > 0 && (
                              <div className="flex justify-between pt-2 border-t border-emerald-200 dark:border-emerald-800">
                                <span className="text-slate-600 dark:text-slate-400">Approved:</span>
                                <span className="font-bold text-emerald-700 dark:text-emerald-300">
                                  {formatCurrency(vo.approvedAmount)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* References */}
                        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 p-4 shadow-inner">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-white" />
                            </div>
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100">References</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-slate-600 dark:text-slate-400 block text-xs">Submission:</span>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {vo.submissionReference}
                              </span>
                            </div>
                            {vo.responseReference && (
                              <div>
                                <span className="text-slate-600 dark:text-slate-400 block text-xs">Response:</span>
                                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                  {vo.responseReference}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Timeline & Type */}
                        <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 p-4 shadow-inner">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-white" />
                            </div>
                            <h4 className="font-semibold text-amber-900 dark:text-amber-100">Details</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-slate-600 dark:text-slate-400 block text-xs">Submitted:</span>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {formatDate(vo.submissionDate)}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-600 dark:text-slate-400 block text-xs">Type:</span>
                              <Badge variant="outline" className="mt-1">
                                {vo.submissionType}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes Section */}
                      {vo.remarks && (
                        <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-4 shadow-inner">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <MessageSquare className="h-4 w-4 text-white" />
                            </div>
                            <h4 className="font-semibold text-purple-900 dark:text-purple-100">Remarks</h4>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 pl-10">
                            {vo.remarks}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 dark:hover:bg-blue-950"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/vos/${vo.id}`;
                          }}
                        >
                          View Full Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 dark:hover:bg-amber-950"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/vos/${vo.id}/edit`;
                          }}
                        >
                          Edit VO
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
