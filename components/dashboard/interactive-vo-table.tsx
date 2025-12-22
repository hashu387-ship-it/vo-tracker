'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  FileText,
  Calendar,
  DollarSign,
  MessageSquare,
  ExternalLink,
  Edit3,
  Eye,
  ArrowUpRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  UploadCloud,
  Download
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useVOs } from '@/lib/hooks/use-vos';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_CONFIG: Record<string, {
  label: string;
  shortLabel: string;
  color: string;
  bg: string;
  text: string;
  icon: React.ReactNode;
  gradient: string;
}> = {
  PendingWithFFC: {
    label: 'Pending with FFC',
    shortLabel: 'FFC',
    color: '#f97316',
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    text: 'text-orange-600 dark:text-orange-400',
    icon: <Clock className="h-3 w-3" />,
    gradient: 'from-orange-500 to-orange-600',
  },
  PendingWithRSG: {
    label: 'Pending with RSG',
    shortLabel: 'RSG',
    color: '#f59e0b',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    icon: <Clock className="h-3 w-3" />,
    gradient: 'from-amber-500 to-amber-600',
  },
  PendingWithRSGFFC: {
    label: 'Pending with RSG/FFC',
    shortLabel: 'RSG/FFC',
    color: '#eab308',
    bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
    text: 'text-yellow-600 dark:text-yellow-500',
    icon: <AlertCircle className="h-3 w-3" />,
    gradient: 'from-yellow-400 to-yellow-500',
  },
  ApprovedAwaitingDVO: {
    label: 'Approved & Awaiting DVO',
    shortLabel: 'Awaiting DVO',
    color: '#06b6d4',
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    text: 'text-cyan-600 dark:text-cyan-400',
    icon: <CheckCircle2 className="h-3 w-3" />,
    gradient: 'from-cyan-500 to-cyan-600',
  },
  DVORRIssued: {
    label: 'DVO RR Issued',
    shortLabel: 'Completed',
    color: '#10b981',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: <CheckCircle2 className="h-3 w-3" />,
    gradient: 'from-emerald-500 to-emerald-600',
  },
};

interface VORowProps {
  vo: {
    id: number;
    subject: string;
    status: string;
    submissionDate: string;
    proposalValue: number | null;
    approvedAmount: number | null;
    submissionReference?: string | null;
    vorReference?: string | null;
    dvoReference?: string | null;
    remarks?: string | null;
    proposedFileUrl?: string | null;
    assessmentFileUrl?: string | null;
    approvalFileUrl?: string | null;
    dvoFileUrl?: string | null;
  };
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onRefresh: () => void;
}

function VORow({ vo, index, isExpanded, onToggle, onRefresh }: VORowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const statusConfig = STATUS_CONFIG[vo.status] || STATUS_CONFIG.PendingWithFFC;
  const displayValue = vo.approvedAmount || vo.proposalValue || 0;
  const isApproved = vo.approvedAmount !== null && vo.approvedAmount > 0;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(fileType);
    try {
      // 1. Upload to Supabase
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', `vo-${vo.id}/${fileType}-${Date.now()}.xlsx`);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');
      const { url } = await uploadRes.json();

      // 2. Update VO record
      const updateRes = await fetch(`/api/vo/${vo.id}/files`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileType, fileUrl: url }),
      });

      if (!updateRes.ok) throw new Error('Update failed');

      onRefresh(); // Refresh data to show new file
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`
        group relative transition-all duration-300
        ${isExpanded ? 'bg-muted/50 dark:bg-muted/20' : ''}
        ${isHovered && !isExpanded ? 'bg-muted/30 dark:bg-muted/10' : ''}
      `}
    >
      {/* Hover accent line */}
      <motion.div
        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${statusConfig.gradient}`}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: isHovered || isExpanded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ originY: 0 }}
      />

      {/* Main Row */}
      <div
        onClick={onToggle}
        className="cursor-pointer px-4 sm:px-6 py-4 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center"
      >
        {/* Mobile: Top row with ID and Status */}
        <div className="sm:hidden flex justify-between items-center">
          {/* <span className="text-xs font-mono text-muted-foreground font-bold">
            #{String(index + 1).padStart(3, '0')}
          </span> */}<span /> {/* Spacer */}
          <Badge
            className={`${statusConfig.bg} ${statusConfig.text} border-0 gap-1 text-[10px] font-semibold uppercase tracking-wide`}
          >
            {statusConfig.icon}
            {statusConfig.shortLabel}
          </Badge>
        </div>

        {/* ID (Desktop) - Removed */}
        {/* <div className="hidden sm:flex col-span-1 items-center gap-2">
          <span className="text-sm font-mono text-muted-foreground font-medium group-hover:text-foreground transition-colors">
            {String(index + 1).padStart(3, '0')}
          </span>
        </div> */}

        {/* Subject */}
        <div className="col-span-1 sm:col-span-6">
          <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-tight">
            {vo.subject}
          </h3>
          {/* Mobile: Date & Value */}
          <div className="sm:hidden mt-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(vo.submissionDate)}
            </span>
            <span className={`font-mono font-bold ${isApproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
              {formatCurrency(displayValue)}
            </span>
          </div>
        </div>

        {/* Value (Desktop) */}
        <div className="hidden sm:block col-span-2 text-right">
          <div className={`font-mono text-sm font-medium ${isApproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
            {formatCurrency(displayValue)}
          </div>
          {isApproved && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wide">
              Approved
            </span>
          )}
        </div>

        {/* Date (Desktop) */}
        <div className="hidden sm:block col-span-2 text-sm text-muted-foreground text-right pr-4">
          <div className="flex items-center gap-1.5 justify-end">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(vo.submissionDate)}</span>
          </div>
        </div>

        {/* Status (Desktop) */}
        <div className="hidden sm:flex col-span-2 justify-end items-center gap-3">
          <Badge
            className={`${statusConfig.bg} ${statusConfig.text} border-0 gap-1.5 px-3 py-1 text-xs font-semibold`}
          >
            {statusConfig.icon}
            {statusConfig.shortLabel}
          </Badge>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-muted-foreground group-hover:text-foreground"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-6 pb-5 pt-2">
              <div className="rounded-xl bg-background/80 dark:bg-background/40 border border-border/50 p-4 sm:p-5 backdrop-blur-sm">
                <div className="grid gap-4 lg:grid-cols-3">
                  {/* References */}
                  <div className="lg:col-span-2 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5" />
                      Reference Details
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {[
                        { key: 'submissionReference', label: 'Submission Ref', value: vo.submissionReference },
                        { key: 'vorReference', label: 'VOR Ref', value: vo.vorReference },
                        { key: 'dvoReference', label: 'DVO Ref', value: vo.dvoReference },
                      ].map((ref) => ref.value && (
                        <motion.div
                          key={ref.key}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-lg bg-muted/50 dark:bg-muted/30 p-3 border border-border/30"
                        >
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">
                            {ref.label}
                          </p>
                          <p className="font-mono text-sm font-bold text-foreground truncate">
                            {ref.value}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Remarks */}
                    {vo.remarks && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-4 border border-amber-200/50 dark:border-amber-500/20"
                      >
                        <p className="text-[10px] uppercase tracking-widest text-amber-600/80 dark:text-amber-500/80 font-bold mb-2 flex items-center gap-1.5">
                          <MessageSquare className="h-3 w-3" />
                          Remarks
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {vo.remarks}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:items-end lg:justify-center">
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex gap-2 w-full lg:w-auto"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/vos/${vo.id}/edit`;
                        }}
                        className="flex-1 lg:flex-none gap-2 h-10 text-xs font-semibold hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/vos/${vo.id}`;
                        }}
                        className="flex-1 lg:flex-none gap-2 h-10 text-xs font-semibold bg-primary hover:bg-primary/90 transition-all"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Details
                        <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="border-t border-border/50 pt-4 mt-4">
                  {/* DEBUG: Temporary visibility check */}
                  {/* <div className="p-2 bg-red-500/10 border border-red-500 text-red-500 mb-2 font-bold text-center">
                    DEBUG: DOCUMENTS SECTION IS RENDERED
                  </div> */}
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" />
                    Attached Documents
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { id: 'proposedFileUrl', label: 'Proposed File', file: vo.proposedFileUrl },
                      { id: 'assessmentFileUrl', label: 'RSG Assessment', file: vo.assessmentFileUrl },
                      { id: 'approvalFileUrl', label: 'Approval Doc', file: vo.approvalFileUrl },
                      { id: 'dvoFileUrl', label: 'DVO RR', file: vo.dvoFileUrl },
                    ].map((doc) => (
                      <div key={doc.id} className="p-3 rounded-lg bg-muted/30 border border-border/50 flex flex-col gap-2">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">{doc.label}</span>

                        {doc.file ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full gap-2 text-xs h-8 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20"
                            asChild
                          >
                            <a
                              href={doc.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </a>
                          </Button>
                        ) : (
                          <div className="relative">
                            <input
                              type="file"
                              accept=".xlsx, .xls"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                              disabled={!!uploading}
                              onChange={(e) => handleFileUpload(e, doc.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-2 text-xs h-8"
                              disabled={!!uploading}
                            >
                              {uploading === doc.id ? (
                                <Sparkles className="h-3 w-3 animate-spin" />
                              ) : (
                                <UploadCloud className="h-3 w-3" />
                              )}
                              {uploading === doc.id ? 'Uploading...' : 'Upload Excel'}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function InteractiveVOTable({ filterStatus }: { filterStatus: string | null }) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const { data, isLoading, refetch } = useVOs({});

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
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Skeleton className="h-20 w-full rounded-xl" />
          </motion.div>
        ))}
      </div>
    );
  }

  const allVOs = data?.data || [];
  const vos = filterStatus
    ? allVOs.filter(vo => vo.status === filterStatus)
    : allVOs;

  if (vos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 p-12 text-center border border-border/50"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="mx-auto h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"
        >
          <FileText className="h-10 w-10 text-primary" />
        </motion.div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          {filterStatus ? `No ${STATUS_CONFIG[filterStatus]?.label || 'Matching'} Orders` : 'No Variation Orders Found'}
        </h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          {filterStatus
            ? 'Try selecting a different status or clear the filter.'
            : 'Start by creating your first variation order to track its progress.'
          }
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {filterStatus ? STATUS_CONFIG[filterStatus]?.label : 'All Variation Orders'}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {vos.length} record{vos.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 dark:bg-primary/10 text-primary text-xs font-semibold"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Click rows to expand</span>
          </motion.div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl overflow-hidden border border-border/50 bg-card/50 backdrop-blur-xl shadow-xl">
        {/* Desktop Header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-muted/50 dark:bg-muted/30 border-b border-border/50 text-xs font-bold text-muted-foreground uppercase tracking-widest">
          {/* <div className="col-span-1">#</div> Reason: Removed as per request */}
          <div className="col-span-6">Subject</div>
          <div className="col-span-2 text-right">Value</div>
          <div className="col-span-2 text-right pr-4">Date</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/30">
          <AnimatePresence mode="popLayout">
            {vos.map((vo, index) => (
              <VORow
                key={vo.id}
                vo={vo}
                index={index}
                isExpanded={expandedRows.has(vo.id)}
                onToggle={() => toggleRow(vo.id)}
                onRefresh={refetch}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
