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
  Download,
  FileSpreadsheet,
  Upload as UploadIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './status-badge';
import { DeleteVODialog } from './delete-vo-dialog';
import { UploadFileDialog } from './upload-file-dialog';
import { VO, useDeleteVO } from '@/lib/hooks/use-vos';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [uploadVoId, setUploadVoId] = useState<number | null>(null);
  const deleteMutation = useDeleteVO();

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['vos'] });
  };

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
                className="cursor-pointer p-3 pl-4"
              >
                {/* Mobile Layout */}
                <div className="sm:hidden space-y-2">
                  {/* Top: ID + Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">#{vo.id}</span>
                      {/* File indicator badge */}
                      {(vo.ffcRsgProposedFile || vo.rsgAssessedFile || vo.dvoRrApprovedFile) && (
                        <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <FileSpreadsheet className="h-3 w-3 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <StatusBadge status={vo.status} size="sm" />
                  </div>

                  {/* Subject */}
                  <h3 className="text-sm font-medium text-foreground leading-tight pr-8">
                    {vo.subject}
                  </h3>

                  {/* Meta info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
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
                      <span className="font-semibold text-foreground">
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
                        className="flex-1 h-7 text-xs gap-1.5"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/vos/${vo.id}/edit`);
                        }}
                        className="flex-1 h-7 text-xs gap-1.5"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(vo.id);
                        }}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex items-center gap-3">
                  {/* Expand Icon */}
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    className="text-muted-foreground group-hover:text-foreground transition-colors"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0 grid grid-cols-12 gap-3 items-center">
                    {/* ID + File Indicator */}
                    <div className="col-span-1 flex items-center gap-1.5">
                      <span className="text-xs font-mono text-muted-foreground">#{vo.id}</span>
                      {(vo.ffcRsgProposedFile || vo.rsgAssessedFile || vo.dvoRrApprovedFile) && (
                        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center ring-1 ring-blue-500/30">
                          <FileSpreadsheet className="h-3 w-3 text-blue-600" />
                        </div>
                      )}
                    </div>

                    {/* Subject + Type */}
                    <div className="col-span-5">
                      <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors mb-0.5">
                        {vo.subject}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Tag className="h-3 w-3" />
                        <span>{submissionTypeConfig[vo.submissionType]?.label || vo.submissionType}</span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="col-span-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {formatDate(vo.submissionDate)}
                      </div>
                    </div>

                    {/* Value */}
                    <div className="col-span-2 text-right">
                      {vo.proposalValue && (
                        <span className="text-sm font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
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
                    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/vos/${vo.id}`)}
                        className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/vos/${vo.id}/edit`)}
                        className="h-7 w-7 p-0 hover:bg-amber-500/10 hover:text-amber-600 transition-all"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(vo.id)}
                        className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
                    <div className="p-3 pl-4 bg-gradient-to-br from-muted/40 to-muted/20">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Financial Information */}
                        <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 border border-emerald-500/20 backdrop-blur-sm">
                          <div className="flex items-center gap-2 mb-2.5">
                            <div className="h-7 w-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
                              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                            </div>
                            <h4 className="text-xs font-semibold text-emerald-900 dark:text-emerald-100">Financial Details</h4>
                          </div>
                          <div className="space-y-1.5 text-xs">
                            {vo.proposalValue !== null && (
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Proposal</span>
                                <span className="font-semibold text-foreground">{formatCurrency(vo.proposalValue)}</span>
                              </div>
                            )}
                            {vo.assessmentValue !== null && (
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Assessment</span>
                                <span className="font-semibold text-foreground">{formatCurrency(vo.assessmentValue)}</span>
                              </div>
                            )}
                            {vo.approvedAmount !== null && (
                              <div className="flex justify-between items-center pt-1 border-t border-emerald-500/10">
                                <span className="text-muted-foreground">Approved</span>
                                <span className="font-bold text-emerald-600">{formatCurrency(vo.approvedAmount)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Reference Information */}
                        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/5 to-blue-600/5 border border-blue-500/20 backdrop-blur-sm">
                          <div className="flex items-center gap-2 mb-2.5">
                            <div className="h-7 w-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                              <FileText className="h-3.5 w-3.5 text-blue-600" />
                            </div>
                            <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-100">References</h4>
                          </div>
                          <div className="space-y-1.5 text-xs">
                            {vo.submissionReference && (
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Submission</span>
                                <span className="font-mono text-[10px] bg-blue-500/5 px-1.5 py-0.5 rounded">{vo.submissionReference}</span>
                              </div>
                            )}
                            {vo.vorReference && (
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">VOR</span>
                                <span className="font-mono text-[10px] bg-blue-500/5 px-1.5 py-0.5 rounded">{vo.vorReference}</span>
                              </div>
                            )}
                            {vo.dvoReference && (
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">DVO</span>
                                <span className="font-mono text-[10px] bg-blue-500/5 px-1.5 py-0.5 rounded">{vo.dvoReference}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/5 to-amber-600/5 border border-amber-500/20 backdrop-blur-sm">
                          <div className="flex items-center gap-2 mb-2.5">
                            <div className="h-7 w-7 rounded-full bg-amber-500/10 flex items-center justify-center">
                              <Clock className="h-3.5 w-3.5 text-amber-600" />
                            </div>
                            <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-100">Timeline</h4>
                          </div>
                          <div className="space-y-1.5 text-xs">
                            {vo.submissionDate && (
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Submitted</span>
                                <span className="font-medium">{formatDate(vo.submissionDate)}</span>
                              </div>
                            )}
                            {vo.dvoIssuedDate && (
                              <div className="flex justify-between items-center pt-1 border-t border-amber-500/10">
                                <span className="text-muted-foreground">DVO Issued</span>
                                <span className="font-medium">{formatDate(vo.dvoIssuedDate)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Remarks */}
                        {(vo.remarks || vo.actionNotes) && (
                          <div className="md:col-span-3 p-3 rounded-lg bg-gradient-to-br from-purple-500/5 to-purple-600/5 border border-purple-500/20 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2.5">
                              <div className="h-7 w-7 rounded-full bg-purple-500/10 flex items-center justify-center">
                                <MessageSquare className="h-3.5 w-3.5 text-purple-600" />
                              </div>
                              <h4 className="text-xs font-semibold text-purple-900 dark:text-purple-100">Notes & Remarks</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              {vo.remarks && (
                                <div className="p-2 rounded bg-purple-500/5 border border-purple-500/10">
                                  <span className="text-muted-foreground text-[10px] block mb-1 font-medium">Remarks</span>
                                  <p className="text-foreground leading-relaxed">{vo.remarks}</p>
                                </div>
                              )}
                              {vo.actionNotes && (
                                <div className="p-2 rounded bg-purple-500/5 border border-purple-500/10">
                                  <span className="text-muted-foreground text-[10px] block mb-1 font-medium">Action Notes</span>
                                  <p className="text-foreground leading-relaxed">{vo.actionNotes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* File Attachments */}
                        <div className="md:col-span-3 p-3 rounded-lg bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-violet-500/5 border border-blue-500/20 backdrop-blur-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center ring-1 ring-blue-500/30">
                                <FileSpreadsheet className="h-3.5 w-3.5 text-blue-600" />
                              </div>
                              <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-100">File Attachments</h4>
                            </div>
                            {isAdmin && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadVoId(vo.id);
                                }}
                                className="h-7 text-xs gap-1.5 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50"
                              >
                                <UploadIcon className="h-3 w-3" />
                                Upload
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                            {/* FFC/RSG Proposed */}
                            <div className={`p-2.5 rounded-lg border transition-all ${
                              vo.ffcRsgProposedFile
                                ? 'bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/30'
                                : 'bg-muted/30 border-border/30'
                            }`}>
                              <div className="flex items-start justify-between mb-1.5">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">FFC/RSG Proposed</span>
                                {vo.ffcRsgProposedFile && (
                                  <a
                                    href={vo.ffcRsgProposedFile}
                                    download
                                    onClick={(e) => e.stopPropagation()}
                                    className="group/download"
                                  >
                                    <div className="h-6 w-6 rounded-full bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center transition-all">
                                      <Download className="h-3 w-3 text-blue-600 group-hover/download:scale-110 transition-transform" />
                                    </div>
                                  </a>
                                )}
                              </div>
                              {vo.ffcRsgProposedFile ? (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <div className="h-5 w-5 rounded bg-emerald-500/10 flex items-center justify-center">
                                    <FileSpreadsheet className="h-3 w-3 text-emerald-600" />
                                  </div>
                                  <span className="text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">File Uploaded</span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground/60 italic">No file</span>
                              )}
                            </div>

                            {/* RSG Assessed */}
                            <div className={`p-2.5 rounded-lg border transition-all ${
                              vo.rsgAssessedFile
                                ? 'bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border-cyan-500/30'
                                : 'bg-muted/30 border-border/30'
                            }`}>
                              <div className="flex items-start justify-between mb-1.5">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">RSG Assessed</span>
                                {vo.rsgAssessedFile && (
                                  <a
                                    href={vo.rsgAssessedFile}
                                    download
                                    onClick={(e) => e.stopPropagation()}
                                    className="group/download"
                                  >
                                    <div className="h-6 w-6 rounded-full bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center transition-all">
                                      <Download className="h-3 w-3 text-blue-600 group-hover/download:scale-110 transition-transform" />
                                    </div>
                                  </a>
                                )}
                              </div>
                              {vo.rsgAssessedFile ? (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <div className="h-5 w-5 rounded bg-emerald-500/10 flex items-center justify-center">
                                    <FileSpreadsheet className="h-3 w-3 text-emerald-600" />
                                  </div>
                                  <span className="text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">File Uploaded</span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground/60 italic">No file</span>
                              )}
                            </div>

                            {/* DVO RR Approved */}
                            <div className={`p-2.5 rounded-lg border transition-all ${
                              vo.dvoRrApprovedFile
                                ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/30'
                                : 'bg-muted/30 border-border/30'
                            }`}>
                              <div className="flex items-start justify-between mb-1.5">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">DVO RR Approved</span>
                                {vo.dvoRrApprovedFile && (
                                  <a
                                    href={vo.dvoRrApprovedFile}
                                    download
                                    onClick={(e) => e.stopPropagation()}
                                    className="group/download"
                                  >
                                    <div className="h-6 w-6 rounded-full bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center transition-all">
                                      <Download className="h-3 w-3 text-blue-600 group-hover/download:scale-110 transition-transform" />
                                    </div>
                                  </a>
                                )}
                              </div>
                              {vo.dvoRrApprovedFile ? (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <div className="h-5 w-5 rounded bg-emerald-500/10 flex items-center justify-center">
                                    <FileSpreadsheet className="h-3 w-3 text-emerald-600" />
                                  </div>
                                  <span className="text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">File Uploaded</span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground/60 italic">No file</span>
                              )}
                            </div>
                          </div>
                        </div>
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

      <UploadFileDialog
        open={uploadVoId !== null}
        onOpenChange={(open) => !open && setUploadVoId(null)}
        voId={uploadVoId || 0}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
