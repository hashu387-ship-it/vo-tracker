"use client";

import { useState, useMemo } from "react";
import { PaymentApplication } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Receipt,
    Loader2,
    Search,
    Filter,
    Download,
    ChevronDown,
    ChevronUp,
    ArrowUpDown,
    CheckCircle2,
    Clock,
    FileText,
    Eye,
    Calendar,
    DollarSign,
    TrendingUp,
    Sparkles,
    LayoutGrid,
    LayoutList,
    X,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { exportPaymentsToExcel } from "@/lib/excel-export";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PaymentForm } from "./payment-form";

interface PaymentTablePremiumProps {
    payments: PaymentApplication[];
    onRefresh: () => void;
    isLoading: boolean;
}

type SortField = 'paymentNo' | 'grossAmount' | 'netPayment' | 'submittedDate';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'table' | 'cards';

const statusColors: { [key: string]: { bg: string; text: string; border: string; dot: string } } = {
    'Draft': { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20', dot: 'bg-zinc-400' },
    'Submitted': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-400' },
    'Submitted on ACONEX': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', dot: 'bg-indigo-400' },
    'Certified': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400' },
    'Paid': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
};

const approvalColors: { [key: string]: { bg: string; text: string } } = {
    'Pending': { bg: 'bg-zinc-500/10', text: 'text-zinc-400' },
    'Received': { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    'Under Review': { bg: 'bg-amber-500/10', text: 'text-amber-400' },
};

export function PaymentTablePremium({ payments, onRefresh, isLoading }: PaymentTablePremiumProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<PaymentApplication | null>(null);
    const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<SortField>('paymentNo');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [expandedCard, setExpandedCard] = useState<number | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Sort and filter payments
    const filteredPayments = useMemo(() => {
        let result = [...payments];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.paymentNo.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter(p => p.paymentStatus === statusFilter);
        }

        // Sort
        result.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'paymentNo':
                    const numA = parseInt(a.paymentNo.replace(/\D/g, '')) || 0;
                    const numB = parseInt(b.paymentNo.replace(/\D/g, '')) || 0;
                    comparison = numA - numB;
                    break;
                case 'grossAmount':
                    comparison = (a.grossAmount || 0) - (b.grossAmount || 0);
                    break;
                case 'netPayment':
                    comparison = (a.netPayment || 0) - (b.netPayment || 0);
                    break;
                case 'submittedDate':
                    comparison = new Date(a.submittedDate || 0).getTime() - new Date(b.submittedDate || 0).getTime();
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [payments, searchQuery, statusFilter, sortField, sortOrder]);

    const sortedPayments = [...payments].sort((a, b) => b.id - a.id);
    const lastPayment = sortedPayments.length > 0 ? sortedPayments[0] : null;

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const openCreate = () => {
        setEditingPayment(null);
        setIsFormOpen(true);
    };

    const openEdit = (payment: PaymentApplication) => {
        setEditingPayment(payment);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this payment?")) return;

        try {
            const res = await fetch(`/api/payments/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Payment deleted");
            onRefresh();
        } catch (error) {
            toast.error("Failed to delete payment");
        }
    };

    const handleStatusUpdate = async (id: number, newStatus: string, type: 'paymentStatus' | 'approvalStatus') => {
        setUpdatingStatusId(id);
        try {
            const res = await fetch(`/api/payments/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [type]: newStatus }),
            });
            if (!res.ok) throw new Error("Failed to update status");
            toast.success(`${type === 'paymentStatus' ? 'Payment' : 'Approval'} status updated`);
            onRefresh();
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const handleCreate = async (data: any) => {
        try {
            const res = await fetch("/api/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create");
            toast.success("Payment created");
            setIsFormOpen(false);
            onRefresh();
        } catch (error) {
            toast.error("Failed to create payment");
        }
    };

    const handleUpdate = async (data: any) => {
        if (!editingPayment) return;
        try {
            const res = await fetch(`/api/payments/${editingPayment.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update");
            toast.success("Payment updated");
            setIsFormOpen(false);
            onRefresh();
        } catch (error) {
            toast.error("Failed to update payment");
        }
    };

    const handleExport = async (exportAll: boolean = false) => {
        setIsExporting(true);
        try {
            const dataToExport = exportAll ? payments : filteredPayments;
            await exportPaymentsToExcel(dataToExport, {
                filename: exportAll
                    ? `Payment_Register_Complete_${format(new Date(), "yyyy-MM-dd")}`
                    : `Payment_Register_Filtered_${format(new Date(), "yyyy-MM-dd")}`,
                includeFilters: !exportAll,
                filterInfo: exportAll ? {} : {
                    searchQuery,
                    statusFilter,
                },
            });
            toast.success(
                exportAll
                    ? `Exported all ${payments.length} payments to Excel`
                    : `Exported ${filteredPayments.length} filtered payments to Excel`
            );
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export payments");
        } finally {
            setIsExporting(false);
        }
    };

    const SortButton = ({ field, label }: { field: SortField; label: string }) => (
        <button
            onClick={() => handleSort(field)}
            className={`flex items-center gap-1 text-xs uppercase tracking-wider font-medium transition-colors ${sortField === field ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
                }`}
        >
            {label}
            {sortField === field ? (
                sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
            ) : (
                <ArrowUpDown className="h-3 w-3 opacity-50" />
            )}
        </button>
    );

    return (
        <div className="space-y-6">
            {/* Controls Bar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between p-4 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl"
            >
                {/* Search */}
                <div className="relative flex-1 w-full lg:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search payments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:ring-indigo-500/50"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Filters & Controls */}
                <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[160px] bg-zinc-800/50 border-zinc-700/50 text-white">
                            <Filter className="h-4 w-4 mr-2 text-zinc-500" />
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Submitted">Submitted</SelectItem>
                            <SelectItem value="Submitted on ACONEX">ACONEX</SelectItem>
                            <SelectItem value="Certified">Certified</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* View Toggle */}
                    <div className="flex items-center gap-1 p-1 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-500 hover:text-white'}`}
                        >
                            <LayoutList className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-500 hover:text-white'}`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Export Button */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="bg-zinc-800/50 border-zinc-700/50 text-white hover:bg-zinc-700/50 hover:border-zinc-600/50"
                                disabled={isExporting || payments.length === 0}
                            >
                                {isExporting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="mr-2 h-4 w-4" />
                                )}
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 w-56">
                            <DropdownMenuLabel className="text-zinc-400">Export to Excel</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            <DropdownMenuItem
                                onClick={() => handleExport(false)}
                                className="text-zinc-300 focus:bg-zinc-800 cursor-pointer"
                                disabled={filteredPayments.length === 0}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                <div className="flex flex-col">
                                    <span>Export Filtered</span>
                                    <span className="text-xs text-zinc-500">{filteredPayments.length} records</span>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleExport(true)}
                                className="text-zinc-300 focus:bg-zinc-800 cursor-pointer"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                <div className="flex flex-col">
                                    <span>Export All</span>
                                    <span className="text-xs text-zinc-500">{payments.length} records</span>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* New Payment Button */}
                    <Button
                        onClick={openCreate}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">New Payment</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                </div>
            </motion.div>

            {/* Results Summary */}
            <div className="flex items-center justify-between px-1">
                <p className="text-sm text-zinc-500">
                    Showing <span className="text-white font-medium">{filteredPayments.length}</span> of{" "}
                    <span className="text-white font-medium">{payments.length}</span> payments
                </p>
            </div>

            {/* Table View */}
            <AnimatePresence mode="wait">
                {viewMode === 'table' ? (
                    <motion.div
                        key="table"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="hidden md:block overflow-hidden rounded-2xl bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 shadow-2xl"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-800/50">
                                        <th className="text-left p-4"><SortButton field="paymentNo" label="Ref" /></th>
                                        <th className="text-left p-4 min-w-[200px]">
                                            <span className="text-xs uppercase tracking-wider font-medium text-zinc-500">Description</span>
                                        </th>
                                        <th className="text-right p-4"><SortButton field="grossAmount" label="Gross" /></th>
                                        <th className="text-right p-4">
                                            <span className="text-xs uppercase tracking-wider font-medium text-zinc-500">Deductions</span>
                                        </th>
                                        <th className="text-right p-4"><SortButton field="netPayment" label="Net" /></th>
                                        <th className="text-center p-4">
                                            <span className="text-xs uppercase tracking-wider font-medium text-zinc-500">Status</span>
                                        </th>
                                        <th className="text-center p-4"><SortButton field="submittedDate" label="Date" /></th>
                                        <th className="text-right p-4 w-12"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={8} className="p-16 text-center">
                                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-400" />
                                                <p className="text-zinc-500 mt-3">Loading payments...</p>
                                            </td>
                                        </tr>
                                    ) : filteredPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="p-16 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
                                                        <Receipt className="h-8 w-8 text-zinc-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-medium text-zinc-400">No payments found</p>
                                                        <p className="text-sm text-zinc-600">Try adjusting your search or filters</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPayments.map((payment, index) => {
                                            const status = statusColors[payment.paymentStatus] || statusColors['Draft'];
                                            const totalDeductions = Math.abs(payment.advancePaymentRecovery || 0) + Math.abs(payment.retention || 0);

                                            return (
                                                <motion.tr
                                                    key={payment.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.02 }}
                                                    className="border-b border-zinc-800/30 hover:bg-zinc-800/30 transition-colors group"
                                                >
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-1 h-10 rounded-full ${status.dot}`} />
                                                            <span className="font-mono font-bold text-white">{payment.paymentNo}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="text-zinc-300 truncate max-w-[200px]" title={payment.description}>
                                                            {payment.description}
                                                        </p>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <span className="font-mono text-blue-400 font-medium">
                                                            {formatCurrency(payment.grossAmount)}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex flex-col items-end gap-0.5">
                                                            <span className="font-mono text-xs text-red-400/80">
                                                                -{formatCurrency(Math.abs(payment.advancePaymentRecovery || 0))}
                                                            </span>
                                                            <span className="font-mono text-xs text-amber-400/80">
                                                                -{formatCurrency(Math.abs(payment.retention || 0))}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <span className="font-mono text-emerald-400 font-bold text-lg">
                                                            {formatCurrency(payment.netPayment)}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <Select
                                                            defaultValue={payment.paymentStatus}
                                                            onValueChange={(val) => handleStatusUpdate(payment.id, val, 'paymentStatus')}
                                                            disabled={updatingStatusId === payment.id}
                                                        >
                                                            <SelectTrigger className={`h-8 text-xs font-medium border ${status.border} ${status.bg} ${status.text} justify-center min-w-[120px]`}>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Draft">Draft</SelectItem>
                                                                <SelectItem value="Submitted">Submitted</SelectItem>
                                                                <SelectItem value="Submitted on ACONEX">ACONEX</SelectItem>
                                                                <SelectItem value="Certified">Certified</SelectItem>
                                                                <SelectItem value="Paid">Paid</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="font-mono text-xs text-zinc-500">
                                                            {payment.submittedDate ? format(new Date(payment.submittedDate), "dd MMM yy") : "-"}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                                                                <DropdownMenuLabel className="text-zinc-400">Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => openEdit(payment)} className="text-zinc-300 focus:bg-zinc-800 cursor-pointer">
                                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="bg-zinc-800" />
                                                                <DropdownMenuItem onClick={() => handleDelete(payment.id)} className="text-red-400 focus:bg-red-500/10 cursor-pointer">
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ) : null}

                {/* Cards View (Mobile & Grid) */}
                {viewMode === 'cards' || viewMode === 'table' ? (
                    <motion.div
                        key="cards"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={viewMode === 'table' ? 'md:hidden' : ''}
                    >
                        <div className={`grid gap-4 ${viewMode === 'cards' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                            {isLoading ? (
                                <div className="col-span-full p-16 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-400" />
                                    <p className="text-zinc-500 mt-3">Loading payments...</p>
                                </div>
                            ) : filteredPayments.length === 0 ? (
                                <div className="col-span-full p-16 text-center">
                                    <Receipt className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
                                    <p className="text-lg font-medium text-zinc-400">No payments found</p>
                                </div>
                            ) : (
                                filteredPayments.map((payment, index) => {
                                    const status = statusColors[payment.paymentStatus] || statusColors['Draft'];
                                    const approval = approvalColors[(payment as any).approvalStatus] || approvalColors['Pending'];
                                    const isExpanded = expandedCard === payment.id;

                                    return (
                                        <motion.div
                                            key={payment.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            layout
                                            className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-zinc-700/50 transition-all group"
                                        >
                                            {/* Card Header */}
                                            <div className="p-5 space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-1.5 h-12 rounded-full ${status.dot}`} />
                                                        <div>
                                                            <h3 className="font-mono font-bold text-xl text-white">{payment.paymentNo}</h3>
                                                            <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-[180px]">{payment.description}</p>
                                                        </div>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                                                            <DropdownMenuItem onClick={() => openEdit(payment)} className="text-zinc-300 cursor-pointer">
                                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDelete(payment.id)} className="text-red-400 cursor-pointer">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                {/* Status Badges */}
                                                <div className="flex flex-wrap gap-2">
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${status.bg} ${status.text} border ${status.border}`}>
                                                        {payment.paymentStatus}
                                                    </span>
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${approval.bg} ${approval.text}`}>
                                                        {(payment as any).approvalStatus || 'Pending'}
                                                    </span>
                                                </div>

                                                {/* Financial Summary */}
                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800/50">
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Gross Amount</p>
                                                        <p className="font-mono font-semibold text-blue-400">{formatCurrency(payment.grossAmount)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] uppercase tracking-wider text-emerald-500 font-bold mb-1">Net Payment</p>
                                                        <p className="font-mono font-bold text-lg text-emerald-400">{formatCurrency(payment.netPayment)}</p>
                                                    </div>
                                                </div>

                                                {/* Expand/Collapse Button */}
                                                <button
                                                    onClick={() => setExpandedCard(isExpanded ? null : payment.id)}
                                                    className="w-full flex items-center justify-center gap-2 pt-3 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                                                >
                                                    {isExpanded ? (
                                                        <>
                                                            <ChevronUp className="h-4 w-4" />
                                                            <span>Show less</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="h-4 w-4" />
                                                            <span>Show details</span>
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
                                                        <div className="p-5 pt-0 space-y-4">
                                                            {/* Deductions */}
                                                            <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-800/30 rounded-xl">
                                                                <div>
                                                                    <p className="text-[10px] text-zinc-500 uppercase">Adv. Recovery</p>
                                                                    <p className="font-mono text-sm text-red-400">
                                                                        -{formatCurrency(Math.abs(payment.advancePaymentRecovery || 0))}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-zinc-500 uppercase">Retention</p>
                                                                    <p className="font-mono text-sm text-amber-400">
                                                                        -{formatCurrency(Math.abs(payment.retention || 0))}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-zinc-500 uppercase">VAT Recovery</p>
                                                                    <p className="font-mono text-sm text-red-400/70">
                                                                        -{formatCurrency(Math.abs(payment.vatRecovery || 0))}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-zinc-500 uppercase">VAT (15%)</p>
                                                                    <p className="font-mono text-sm text-zinc-400">
                                                                        +{formatCurrency(payment.vat)}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Dates */}
                                                            <div className="flex items-center justify-between text-xs text-zinc-500">
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="h-3.5 w-3.5" />
                                                                    <span>Submitted: {payment.submittedDate ? format(new Date(payment.submittedDate), "dd MMM yyyy") : "-"}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="h-3.5 w-3.5" />
                                                                    <span>Invoice: {payment.invoiceDate ? format(new Date(payment.invoiceDate), "dd MMM yyyy") : "-"}</span>
                                                                </div>
                                                            </div>

                                                            {/* Remarks */}
                                                            {(payment as any).remarks && (
                                                                <div className="p-3 bg-zinc-800/20 rounded-lg border border-zinc-800/50">
                                                                    <p className="text-[10px] text-zinc-500 uppercase mb-1">Remarks</p>
                                                                    <p className="text-xs text-zinc-400">{(payment as any).remarks}</p>
                                                                </div>
                                                            )}

                                                            {/* Status Update */}
                                                            <div className="pt-3 border-t border-zinc-800/50">
                                                                <Select
                                                                    defaultValue={payment.paymentStatus}
                                                                    onValueChange={(val) => handleStatusUpdate(payment.id, val, 'paymentStatus')}
                                                                    disabled={updatingStatusId === payment.id}
                                                                >
                                                                    <SelectTrigger className="w-full bg-zinc-800/50 border-zinc-700/50 text-white">
                                                                        <SelectValue placeholder="Update Status" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="Draft">Draft</SelectItem>
                                                                        <SelectItem value="Submitted">Submitted</SelectItem>
                                                                        <SelectItem value="Submitted on ACONEX">ACONEX</SelectItem>
                                                                        <SelectItem value="Certified">Certified</SelectItem>
                                                                        <SelectItem value="Paid">Paid</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {/* Payment Form Dialog */}
            <PaymentForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={editingPayment ? handleUpdate : handleCreate}
                initialData={editingPayment}
                lastPayment={lastPayment}
            />
        </div>
    );
}
