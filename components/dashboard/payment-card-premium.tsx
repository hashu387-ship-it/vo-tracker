"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PaymentApplication } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import {
  CreditCard,
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
  FileText,
  TrendingUp,
  TrendingDown,
  Receipt,
  ArrowRight,
  Percent,
  Shield,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentCardPremiumProps {
  payment: PaymentApplication;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: string) => void;
  index?: number;
}

const statusConfig: { [key: string]: { color: string; bgLight: string; bgDark: string; icon: any } } = {
  Draft: {
    color: "text-slate-600 dark:text-slate-400",
    bgLight: "bg-slate-100",
    bgDark: "dark:bg-slate-800/50",
    icon: FileText,
  },
  Submitted: {
    color: "text-blue-600 dark:text-blue-400",
    bgLight: "bg-blue-100",
    bgDark: "dark:bg-blue-900/30",
    icon: Clock,
  },
  "Submitted on ACONEX": {
    color: "text-indigo-600 dark:text-indigo-400",
    bgLight: "bg-indigo-100",
    bgDark: "dark:bg-indigo-900/30",
    icon: FileText,
  },
  Certified: {
    color: "text-amber-600 dark:text-amber-400",
    bgLight: "bg-amber-100",
    bgDark: "dark:bg-amber-900/30",
    icon: CheckCircle2,
  },
  Paid: {
    color: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-100",
    bgDark: "dark:bg-emerald-900/30",
    icon: CheckCircle2,
  },
};

export function PaymentCardPremium({ payment, onEdit, onDelete, onStatusChange, index = 0 }: PaymentCardPremiumProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = statusConfig[payment.paymentStatus] || statusConfig.Draft;
  const StatusIcon = status.icon;

  // Calculate deduction percentage
  const totalDeductions = Math.abs(payment.advancePaymentRecovery || 0) + Math.abs(payment.retention || 0) + Math.abs(payment.vatRecovery || 0);
  const deductionPercentage = payment.grossAmount ? ((totalDeductions / payment.grossAmount) * 100).toFixed(1) : '0';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-lg shadow-slate-200/50 dark:shadow-black/20 transition-all duration-300 hover:shadow-xl hover:border-slate-300 dark:hover:border-zinc-700">
        {/* Status Accent */}
        <div className={`absolute top-0 left-0 w-1.5 h-full ${status.bgLight} ${status.bgDark}`}>
          <div className={`w-full h-full ${status.color.replace('text-', 'bg-').replace('-600', '-500').replace('-400', '-500')}`} />
        </div>

        {/* Main Content */}
        <div className="p-5 pl-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2.5 rounded-xl ${status.bgLight} ${status.bgDark} shrink-0`}>
                <CreditCard className={`h-5 w-5 ${status.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono font-bold text-lg text-slate-900 dark:text-white">
                    {payment.paymentNo}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold ${status.bgLight} ${status.bgDark} ${status.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {payment.paymentStatus}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-zinc-400 line-clamp-1">
                  {payment.description}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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

          {/* Financial Summary */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-500">Gross Amount</span>
              </div>
              <p className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                {formatCurrency(payment.grossAmount)}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Net Payment</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <p className="font-mono font-bold text-xl text-emerald-600 dark:text-emerald-400">
                {formatCurrency(payment.netPayment)}
              </p>
            </div>
          </div>

          {/* Deductions Summary Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-500 dark:text-zinc-500">Total Deductions</span>
              <span className="font-mono text-red-500 dark:text-red-400">
                -{formatCurrency(totalDeductions)} ({deductionPercentage}%)
              </span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(parseFloat(deductionPercentage), 100)}%` }}
                transition={{ duration: 0.8, delay: index * 0.05 }}
                className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-orange-500 rounded-full"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
              <Shield className="h-3.5 w-3.5 text-red-500" />
              <div className="min-w-0">
                <p className="text-[9px] text-red-600/70 dark:text-red-400/70">Adv. Rec</p>
                <p className="font-mono text-xs text-red-600 dark:text-red-400 truncate">
                  {formatCurrency(Math.abs(payment.advancePaymentRecovery || 0))}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <Wallet className="h-3.5 w-3.5 text-amber-500" />
              <div className="min-w-0">
                <p className="text-[9px] text-amber-600/70 dark:text-amber-400/70">Retention</p>
                <p className="font-mono text-xs text-amber-600 dark:text-amber-400 truncate">
                  {formatCurrency(Math.abs(payment.retention || 0))}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
              <Percent className="h-3.5 w-3.5 text-slate-500" />
              <div className="min-w-0">
                <p className="text-[9px] text-slate-500 dark:text-zinc-500">VAT 15%</p>
                <p className="font-mono text-xs text-slate-600 dark:text-zinc-400 truncate">
                  {formatCurrency(payment.vat)}
                </p>
              </div>
            </div>
          </div>

          {/* Status Selector */}
          {onStatusChange && (
            <div className="mb-4">
              <Select defaultValue={payment.paymentStatus} onValueChange={onStatusChange}>
                <SelectTrigger className="w-full h-9 bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Submitted on ACONEX">Submitted on ACONEX</SelectItem>
                  <SelectItem value="Certified">Certified</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Expand/Collapse */}
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
              <div className="px-5 pl-7 pb-5 pt-0 space-y-4 border-t border-slate-100 dark:border-zinc-800">
                {/* Dates */}
                <div className="pt-4 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800">
                      <Calendar className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-500">Submitted</p>
                      <p className="font-mono text-sm text-slate-700 dark:text-zinc-300">
                        {payment.submittedDate ? format(new Date(payment.submittedDate), "dd MMM yyyy") : "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800">
                      <Receipt className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-500">Invoice</p>
                      <p className="font-mono text-sm text-slate-700 dark:text-zinc-300">
                        {payment.invoiceDate ? format(new Date(payment.invoiceDate), "dd MMM yyyy") : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* VAT Details */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-500 mb-2">VAT Breakdown</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-slate-400">VAT Recovery (Input)</p>
                      <p className="font-mono text-sm text-red-600 dark:text-red-400">
                        -{formatCurrency(Math.abs(payment.vatRecovery || 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">VAT Output (15%)</p>
                      <p className="font-mono text-sm text-slate-700 dark:text-zinc-300">
                        +{formatCurrency(payment.vat)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                {(payment as any).remarks && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-500 mb-2">Remarks</h4>
                    <p className="text-sm text-slate-600 dark:text-zinc-400">
                      {(payment as any).remarks}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {(payment as any).ffcLiveAction || (payment as any).rsgLiveAction ? (
                  <div className="grid grid-cols-2 gap-3">
                    {(payment as any).ffcLiveAction && (
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase">FFC Action</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">{(payment as any).ffcLiveAction}</p>
                      </div>
                    )}
                    {(payment as any).rsgLiveAction && (
                      <div className="p-3 rounded-xl bg-rsg-gold/10 dark:bg-rsg-gold/20">
                        <p className="text-[10px] text-rsg-gold uppercase">RSG Action</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">{(payment as any).rsgLiveAction}</p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Grid component for displaying multiple payment cards
interface PaymentCardGridProps {
  payments: PaymentApplication[];
  onEdit?: (payment: PaymentApplication) => void;
  onDelete?: (payment: PaymentApplication) => void;
  onStatusChange?: (payment: PaymentApplication, status: string) => void;
}

export function PaymentCardGrid({ payments, onEdit, onDelete, onStatusChange }: PaymentCardGridProps) {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-6 rounded-full bg-slate-100 dark:bg-zinc-800 mb-4">
          <CreditCard className="h-10 w-10 text-slate-400 dark:text-zinc-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Payment Applications</h3>
        <p className="text-slate-500 dark:text-zinc-400 max-w-sm">
          No payment applications found. Create a new one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {payments.map((payment, index) => (
        <PaymentCardPremium
          key={payment.id}
          payment={payment}
          index={index}
          onEdit={onEdit ? () => onEdit(payment) : undefined}
          onDelete={onDelete ? () => onDelete(payment) : undefined}
          onStatusChange={onStatusChange ? (status) => onStatusChange(payment, status) : undefined}
        />
      ))}
    </div>
  );
}
