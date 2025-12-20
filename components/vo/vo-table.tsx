'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  DollarSign,
  FileText,
  Tag,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './status-badge';
import { DeleteVODialog } from './delete-vo-dialog';
import { VO, useDeleteVO } from '@/lib/hooks/use-vos';
import { formatCurrency, formatDate } from '@/lib/utils';
import { submissionTypeConfig } from '@/lib/validations/vo';
import { useToast } from '@/components/ui/use-toast';

interface VOTableProps {
  vos: VO[];
  isLoading?: boolean;
  isAdmin?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export function VOTable({ vos, isLoading, isAdmin, sortBy, sortOrder, onSort }: VOTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const deleteMutation = useDeleteVO();

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutateAsync(deleteId);
      toast({
        title: '✓ VO deleted',
        description: 'The Variation Order has been deleted successfully.',
      });
      setDeleteId(null);
    } catch (error) {
      toast({
        title: '✗ Error',
        description: error instanceof Error ? error.message : 'Failed to delete VO',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (vos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950 border-2 border-blue-100 dark:border-blue-900/30">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center mb-6 shadow-2xl">
          <FileText className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent">
          No Variation Orders Found
        </h3>
        <p className="text-slate-600 dark:text-slate-400">Start by creating your first VO</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {vos.map((vo, index) => {
        const isExpanded = expandedRows.has(vo.id);

        return (
          <motion.div
            key={vo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
          >
            {/* Main Row - Neomorphism Card */}
            <div
              onClick={() => toggleRow(vo.id)}
              className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-6 ${isExpanded
                  ? 'bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-blue-950 dark:via-slate-900 dark:to-amber-950 shadow-2xl scale-[1.02]'
                  : 'bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-xl hover:scale-[1.01]'
                }`}
              style={{
                boxShadow: isExpanded
                  ? '12px 12px 24px rgba(0, 0, 0, 0.1), -12px -12px 24px rgba(255, 255, 255, 0.9), inset 2px 2px 4px rgba(255, 255, 255, 0.3)'
                  : '8px 8px 16px rgba(0, 0, 0, 0.08), -8px -8px 16px rgba(255, 255, 255, 0.8)',
              }}
            >
              <div className="flex items-center justify-between">
                {/* Left Side - VO Info */}
                <div className="flex items-center gap-6 flex-1">
                  {/* Expand Icon */}
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${isExpanded
                        ? 'bg-gradient-to-br from-blue-500 to-amber-500 shadow-lg'
                        : 'bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 group-hover:from-blue-400 group-hover:to-amber-400'
                      }`}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-6 w-6 text-white" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-slate-600 dark:text-slate-300 group-hover:text-white transition-colors" />
                    )}
                  </div>

                  {/* VO Subject */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        #{vo.id}
                      </span>
                      <StatusBadge status={vo.status} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {vo.subject}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        {submissionTypeConfig[vo.submissionType]?.label || vo.submissionType}
                      </span>
                      {vo.submissionDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(vo.submissionDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Value Badge */}
                  {vo.proposalValue && (
                    <div className="hidden lg:flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-2 border-emerald-200 dark:border-emerald-800">
                      <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          Proposal Value
                        </div>
                        <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                          {formatCurrency(vo.proposalValue)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side - Actions */}
                {isAdmin && (
                  <div
                    className="flex items-center gap-2 ml-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/vos/${vo.id}`)}
                      className="h-10 w-10 p-0 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/vos/${vo.id}/edit`)}
                      className="h-10 w-10 p-0 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400"
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(vo.id)}
                      className="h-10 w-10 p-0 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 pt-6 border-t-2 border-gradient-to-r from-blue-200 via-slate-200 to-amber-200 dark:from-blue-800 dark:via-slate-700 dark:to-amber-800"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Financial Information */}
                      <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/50 dark:to-slate-800/50 border border-emerald-200 dark:border-emerald-800/50">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 rounded-lg bg-emerald-500">
                            <DollarSign className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="font-bold text-emerald-900 dark:text-emerald-100">
                            Financial Details
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {vo.assessmentValue !== null && (
                            <div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                Assessment Value
                              </div>
                              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                                {formatCurrency(vo.assessmentValue)}
                              </div>
                            </div>
                          )}
                          {vo.proposalValue !== null && (
                            <div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                Proposal Value
                              </div>
                              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                                {formatCurrency(vo.proposalValue)}
                              </div>
                            </div>
                          )}
                          {vo.approvedAmount !== null && (
                            <div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                Approved Amount
                              </div>
                              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                                {formatCurrency(vo.approvedAmount)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reference Information */}
                      <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/50 dark:to-slate-800/50 border border-blue-200 dark:border-blue-800/50">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 rounded-lg bg-blue-500">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="font-bold text-blue-900 dark:text-blue-100">
                            References
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {vo.submissionReference && (
                            <div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                Submission Ref
                              </div>
                              <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                {vo.submissionReference}
                              </div>
                            </div>
                          )}
                          {vo.responseReference && (
                            <div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                Response Ref
                              </div>
                              <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                {vo.responseReference}
                              </div>
                            </div>
                          )}
                          {vo.vorReference && (
                            <div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                VOR Ref
                              </div>
                              <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                {vo.vorReference}
                              </div>
                            </div>
                          )}
                          {vo.dvoReference && (
                            <div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                DVO Ref
                              </div>
                              <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                {vo.dvoReference}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dates & Status */}
                      <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/50 dark:to-slate-800/50 border border-amber-200 dark:border-amber-800/50">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 rounded-lg bg-amber-500">
                            <Clock className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="font-bold text-amber-900 dark:text-amber-100">
                            Timeline
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {vo.submissionDate && (
                            <div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                Submission Date
                              </div>
                              <div className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                                {formatDate(vo.submissionDate)}
                              </div>
                            </div>
                          )}
                          {vo.dvoIssuedDate && (
                            <div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                DVO Issued Date
                              </div>
                              <div className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                                {formatDate(vo.dvoIssuedDate)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Remarks */}
                      {(vo.remarks || vo.actionNotes) && (
                        <div className="md:col-span-2 lg:col-span-3 p-5 rounded-xl bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/50 dark:to-slate-800/50 border border-purple-200 dark:border-purple-800/50">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-lg bg-purple-500">
                              <MessageSquare className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-bold text-purple-900 dark:text-purple-100">
                              Notes & Remarks
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vo.remarks && (
                              <div>
                                <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                  Remarks
                                </div>
                                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                  {vo.remarks}
                                </div>
                              </div>
                            )}
                            {vo.actionNotes && (
                              <div>
                                <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                  Action Notes
                                </div>
                                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                  {vo.actionNotes}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}

      <DeleteVODialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
