'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
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
        title: 'VO deleted',
        description: 'The Variation Order has been deleted successfully.',
      });
      setDeleteId(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete VO',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl bg-muted/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (vos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-muted/30 border border-border/50">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No Variation Orders Found</h3>
        <p className="text-muted-foreground text-sm">Start by creating your first VO</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {vos.map((vo, index) => {
        const isExpanded = expandedRows.has(vo.id);

        return (
          <motion.div
            key={vo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="group"
          >
            <div
              className={`
                relative rounded-xl border transition-all duration-300 overflow-hidden
                ${isExpanded
                  ? 'bg-card border-primary/20 shadow-lg'
                  : 'bg-card/50 border-border/50 hover:border-border hover:bg-card hover:shadow-md'
                }
              `}
            >
              {/* Color accent bar based on status */}
              <div
                className={`
                  absolute left-0 top-0 bottom-0 w-1 transition-all
                  ${vo.status === 'PendingWithFFC' ? 'bg-orange-500' : ''}
                  ${vo.status === 'PendingWithRSG' ? 'bg-amber-500' : ''}
                  ${vo.status === 'PendingWithRSGFFC' ? 'bg-yellow-500' : ''}
                  ${vo.status === 'ApprovedAwaitingDVO' ? 'bg-cyan-500' : ''}
                  ${vo.status === 'DVORRIssued' ? 'bg-emerald-500' : ''}
                `}
              />

              {/* Main Row */}
              <div
                onClick={() => toggleRow(vo.id)}
                className="cursor-pointer p-4 pl-5"
              >
                {/* Mobile Layout */}
                <div className="sm:hidden space-y-3">
                  {/* Top: ID + Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">#{vo.id}</span>
                    <StatusBadge status={vo.status} size="sm" />
                  </div>

                  {/* Subject - Normal weight, not bold */}
                  <h3 className="text-sm font-medium text-foreground leading-snug pr-8">
                    {vo.subject}
                  </h3>

                  {/* Meta info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {submissionTypeConfig[vo.submissionType]?.label || vo.submissionType}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(vo.submissionDate)}
                      </span>
                    </div>
                    {vo.proposalValue && (
                      <span className="font-medium text-foreground">
                        {formatCurrency(vo.proposalValue)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  {isAdmin && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/vos/${vo.id}`);
                        }}
                        className="flex-1 h-8 text-xs gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/vos/${vo.id}/edit`);
                        }}
                        className="flex-1 h-8 text-xs gap-1.5"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(vo.id);
                        }}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex items-center gap-4">
                  {/* Expand Icon */}
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    className="text-muted-foreground group-hover:text-foreground transition-colors"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                    {/* ID */}
                    <div className="col-span-1">
                      <span className="text-sm font-mono text-muted-foreground">#{vo.id}</span>
                    </div>

                    {/* Subject + Type - Normal weight */}
                    <div className="col-span-5">
                      <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {vo.subject}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Tag className="h-3 w-3" />
                        <span>{submissionTypeConfig[vo.submissionType]?.label || vo.submissionType}</span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="col-span-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(vo.submissionDate)}
                      </div>
                    </div>

                    {/* Value */}
                    <div className="col-span-2 text-right">
                      {vo.proposalValue && (
                        <span className="text-sm font-medium text-foreground">
                          {formatCurrency(vo.proposalValue)}
                        </span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex justify-end">
                      <StatusBadge status={vo.status} size="sm" />
                    </div>
                  </div>

                  {/* Actions */}
                  {isAdmin && (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/vos/${vo.id}`)}
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/vos/${vo.id}/edit`)}
                        className="h-8 w-8 p-0 hover:bg-amber-500/10 hover:text-amber-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(vo.id)}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-border/50"
                  >
                    <div className="p-4 pl-5 bg-muted/30">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Financial Information */}
                        <div className="p-4 rounded-lg bg-background border border-border/50">
                          <div className="flex items-center gap-2 mb-3">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                            <h4 className="text-sm font-medium">Financial Details</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            {vo.proposalValue !== null && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Proposal</span>
                                <span className="font-medium">{formatCurrency(vo.proposalValue)}</span>
                              </div>
                            )}
                            {vo.assessmentValue !== null && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Assessment</span>
                                <span className="font-medium">{formatCurrency(vo.assessmentValue)}</span>
                              </div>
                            )}
                            {vo.approvedAmount !== null && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Approved</span>
                                <span className="font-medium text-emerald-600">{formatCurrency(vo.approvedAmount)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Reference Information */}
                        <div className="p-4 rounded-lg bg-background border border-border/50">
                          <div className="flex items-center gap-2 mb-3">
                            <FileText className="h-4 w-4 text-primary" />
                            <h4 className="text-sm font-medium">References</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            {vo.submissionReference && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Submission</span>
                                <span className="font-mono text-xs">{vo.submissionReference}</span>
                              </div>
                            )}
                            {vo.vorReference && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">VOR</span>
                                <span className="font-mono text-xs">{vo.vorReference}</span>
                              </div>
                            )}
                            {vo.dvoReference && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">DVO</span>
                                <span className="font-mono text-xs">{vo.dvoReference}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="p-4 rounded-lg bg-background border border-border/50">
                          <div className="flex items-center gap-2 mb-3">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <h4 className="text-sm font-medium">Timeline</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            {vo.submissionDate && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Submitted</span>
                                <span>{formatDate(vo.submissionDate)}</span>
                              </div>
                            )}
                            {vo.dvoIssuedDate && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">DVO Issued</span>
                                <span>{formatDate(vo.dvoIssuedDate)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Remarks */}
                        {(vo.remarks || vo.actionNotes) && (
                          <div className="md:col-span-3 p-4 rounded-lg bg-background border border-border/50">
                            <div className="flex items-center gap-2 mb-3">
                              <MessageSquare className="h-4 w-4 text-purple-600" />
                              <h4 className="text-sm font-medium">Notes & Remarks</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              {vo.remarks && (
                                <div>
                                  <span className="text-muted-foreground text-xs block mb-1">Remarks</span>
                                  <p className="text-foreground leading-relaxed">{vo.remarks}</p>
                                </div>
                              )}
                              {vo.actionNotes && (
                                <div>
                                  <span className="text-muted-foreground text-xs block mb-1">Action Notes</span>
                                  <p className="text-foreground leading-relaxed">{vo.actionNotes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
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
