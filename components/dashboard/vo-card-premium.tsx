"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VO } from "@prisma/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Building,
  Hash,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface VOCardPremiumProps {
  vo: VO;
  onEdit?: () => void;
  onDelete?: () => void;
  index?: number;
}

const statusConfig: { [key: string]: { color: string; bgLight: string; bgDark: string; icon: any; label: string } } = {
  PendingWithFFC: {
    color: "text-orange-600 dark:text-orange-400",
    bgLight: "bg-orange-50",
    bgDark: "dark:bg-orange-900/20",
    icon: Clock,
    label: "Pending with FFC",
  },
  PendingWithRSG: {
    color: "text-amber-600 dark:text-amber-400",
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-amber-900/20",
    icon: AlertCircle,
    label: "Pending with RSG",
  },
  PendingWithRSGFFC: {
    color: "text-yellow-600 dark:text-yellow-400",
    bgLight: "bg-yellow-50",
    bgDark: "dark:bg-yellow-900/20",
    icon: Clock,
    label: "Pending RSG/FFC",
  },
  ApprovedAwaitingDVO: {
    color: "text-cyan-600 dark:text-cyan-400",
    bgLight: "bg-cyan-50",
    bgDark: "dark:bg-cyan-900/20",
    icon: CheckCircle2,
    label: "Approved - Awaiting DVO",
  },
  DVORRIssued: {
    color: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-900/20",
    icon: CheckCircle2,
    label: "DVO/RR Issued",
  },
};

export function VOCardPremium({ vo, onEdit, onDelete, index = 0 }: VOCardPremiumProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = statusConfig[vo.status] || statusConfig.PendingWithFFC;
  const StatusIcon = status.icon;

  // Use correct field names from Prisma schema
  const displayValue = vo.approvedAmount || vo.proposalValue || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-lg shadow-slate-200/50 dark:shadow-black/20 transition-all duration-300 hover:shadow-xl hover:border-slate-300 dark:hover:border-zinc-700">
        {/* Status Accent Line */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${status.bgLight} ${status.bgDark}`}>
          <div className={`h-full ${status.color.replace('text-', 'bg-').replace('-600', '-500').replace('-400', '-500')}`} style={{ width: '100%' }} />
        </div>

        {/* Main Content */}
        <div className="p-5 pt-6">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Icon Container */}
              <div className={`p-3 rounded-xl ${status.bgLight} ${status.bgDark} shrink-0`}>
                <FileText className={`h-5 w-5 ${status.color}`} />
              </div>

              {/* Title & Reference */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${status.bgLight} ${status.bgDark} ${status.color} border border-current/10`}>
                    VO-{vo.id.toString().padStart(3, '0')}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium ${status.bgLight} ${status.bgDark} ${status.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 text-sm leading-snug">
                  {vo.subject}
                </h3>
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <Link href={`/vos/${vo.id}`}>
                  <DropdownMenuItem className="cursor-pointer">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                </Link>
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-red-600 dark:text-red-400 cursor-pointer">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Value & Date Row */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-500">Value</p>
                <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(displayValue)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-right">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-500">Submitted</p>
                <p className="font-mono text-sm text-slate-700 dark:text-zinc-300">
                  {formatDate(vo.submissionDate)}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800">
                <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-500" />
              </div>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 text-center">
              <p className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-zinc-500 mb-0.5">Proposed</p>
              <p className="font-mono text-xs font-medium text-slate-700 dark:text-zinc-300 truncate">
                {formatCurrency(vo.proposalValue || 0)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 text-center">
              <p className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-zinc-500 mb-0.5">Assessed</p>
              <p className="font-mono text-xs font-medium text-slate-700 dark:text-zinc-300 truncate">
                {vo.assessmentValue ? formatCurrency(vo.assessmentValue) : '-'}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center">
              <p className="text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-0.5">Approved</p>
              <p className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">
                {vo.approvedAmount ? formatCurrency(vo.approvedAmount) : '-'}
              </p>
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 transition-colors"
          >
            {isExpanded ? (
              <>
                <span>Show less</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Show details</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 pt-0 space-y-4 border-t border-slate-100 dark:border-zinc-800">
                {/* References */}
                <div className="pt-4 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-500">References</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
                      <Hash className="h-3.5 w-3.5 text-slate-400" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-400">Submission Ref</p>
                        <p className="text-xs font-mono text-slate-700 dark:text-zinc-300 truncate">{vo.submissionReference || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
                      <Hash className="h-3.5 w-3.5 text-slate-400" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-400">VOR Ref</p>
                        <p className="text-xs font-mono text-slate-700 dark:text-zinc-300 truncate">{vo.vorReference || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
                      <Hash className="h-3.5 w-3.5 text-slate-400" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-400">DVO Ref</p>
                        <p className="text-xs font-mono text-slate-700 dark:text-zinc-300 truncate">{vo.dvoReference || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
                      <Building className="h-3.5 w-3.5 text-slate-400" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-400">Type</p>
                        <p className="text-xs text-slate-700 dark:text-zinc-300 truncate">{vo.submissionType || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                {vo.remarks && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-500">Remarks</h4>
                    <p className="text-sm text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-lg">
                      {vo.remarks}
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <Link href={`/vos/${vo.id}`}>
                  <Button className="w-full bg-gradient-to-r from-rsg-navy to-rsg-blue hover:from-rsg-blue hover:to-rsg-navy text-white rounded-xl">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Details
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Grid component for displaying multiple VO cards
interface VOCardGridProps {
  vos: VO[];
  onEdit?: (vo: VO) => void;
  onDelete?: (vo: VO) => void;
}

export function VOCardGrid({ vos, onEdit, onDelete }: VOCardGridProps) {
  if (vos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-6 rounded-full bg-slate-100 dark:bg-zinc-800 mb-4">
          <FileText className="h-10 w-10 text-slate-400 dark:text-zinc-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Variation Orders</h3>
        <p className="text-slate-500 dark:text-zinc-400 max-w-sm">
          No variation orders found. Create a new one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {vos.map((vo, index) => (
        <VOCardPremium
          key={vo.id}
          vo={vo}
          index={index}
          onEdit={onEdit ? () => onEdit(vo) : undefined}
          onDelete={onDelete ? () => onDelete(vo) : undefined}
        />
      ))}
    </div>
  );
}
