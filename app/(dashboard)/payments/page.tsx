'use client';

import { useState, useEffect } from 'react';
import { PaymentApplication } from '@prisma/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard,
    RefreshCw,
    Download,
    Plus,
    Search,
    Filter,
    Loader2,
    MoreHorizontal,
    Pencil,
    Trash2,
    X,
    ChevronDown,
    Calendar,
    FileText,
    TrendingUp,
    ArrowUpDown,
    ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { exportPaymentsToExcel } from '@/lib/excel-export';
import { PaymentForm } from '@/components/dashboard/payment-form';

type SortField = 'paymentNo' | 'grossAmount' | 'netPayment' | 'submittedDate';
type SortOrder = 'asc' | 'desc';

const statusConfig: { [key: string]: { bg: string; text: string; border: string; dot: string } } = {
    'Draft': {
        bg: 'bg-slate-100 dark:bg-slate-500/10',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-500/20',
        dot: 'bg-slate-400'
    },
    'Submitted': {
        bg: 'bg-blue-50 dark:bg-blue-500/10',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-500/20',
        dot: 'bg-blue-500'
    },
    'Submitted on ACONEX': {
        bg: 'bg-indigo-50 dark:bg-indigo-500/10',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-500/20',
        dot: 'bg-indigo-500'
    },
    'Certified': {
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-500/20',
        dot: 'bg-amber-500'
    },
    'Paid': {
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-500/20',
        dot: 'bg-emerald-500'
    },
};

export default function PaymentsPage() {
    const [payments, setPayments] = useState<PaymentApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<SortField>('paymentNo');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<PaymentApplication | null>(null);
    const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

    const fetchPayments = async (showRefreshIndicator = false) => {
        if (showRefreshIndicator) setIsRefreshing(true);
        try {
            const res = await fetch('/api/payments');
            const json = await res.json();
            if (json.data) {
                setPayments(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch payments', error);
            toast.error('Failed to load payments');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    // Filter and sort payments
    const filteredPayments = payments
        .filter(p => {
            const matchesSearch = !searchQuery ||
                p.paymentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || p.paymentStatus === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
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

    // Calculate totals
    const totals = filteredPayments.reduce((acc, p) => ({
        gross: acc.gross + (p.grossAmount || 0),
        net: acc.net + (p.netPayment || 0),
    }), { gross: 0, net: 0 });

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportPaymentsToExcel(filteredPayments, {
                filename: `Payment_Register_${format(new Date(), "yyyy-MM-dd")}`,
                filterInfo: { searchQuery, statusFilter },
            });
            toast.success(`Exported ${filteredPayments.length} payments`);
        } catch (error) {
            toast.error('Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this payment?")) return;
        try {
            const res = await fetch(`/api/payments/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            toast.success("Payment deleted");
            fetchPayments();
        } catch {
            toast.error("Delete failed");
        }
    };

    const handleStatusUpdate = async (id: number, newStatus: string) => {
        setUpdatingStatusId(id);
        try {
            const res = await fetch(`/api/payments/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentStatus: newStatus }),
            });
            if (!res.ok) throw new Error();
            toast.success("Status updated");
            fetchPayments();
        } catch {
            toast.error("Update failed");
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
            if (!res.ok) throw new Error();
            toast.success("Payment created");
            setIsFormOpen(false);
            fetchPayments();
        } catch {
            toast.error("Create failed");
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
            if (!res.ok) throw new Error();
            toast.success("Payment updated");
            setIsFormOpen(false);
            setEditingPayment(null);
            fetchPayments();
        } catch {
            toast.error("Update failed");
        }
    };

    const sortedPayments = [...payments].sort((a, b) => b.id - a.id);
    const lastPayment = sortedPayments.length > 0 ? sortedPayments[0] : null;

    const SortHeader = ({ field, label, align = 'left' }: { field: SortField; label: string; align?: 'left' | 'right' }) => (
        <button
            onClick={() => handleSort(field)}
            className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                sortField === field
                    ? 'text-rsg-gold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-rsg-navy dark:hover:text-white'
            } ${align === 'right' ? 'justify-end ml-auto' : ''}`}
        >
            {label}
            {sortField === field ? (
                sortOrder === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
            ) : (
                <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
            )}
        </button>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Register</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {filteredPayments.length} payments • Total Net: {formatCurrency(totals.net)}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchPayments(true)}
                        disabled={isRefreshing}
                        className="border-slate-200 dark:border-slate-700"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={isExporting || filteredPayments.length === 0}
                        className="border-slate-200 dark:border-slate-700"
                    >
                        {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        <span className="hidden sm:inline ml-2">Export</span>
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => { setEditingPayment(null); setIsFormOpen(true); }}
                        className="bg-rsg-navy hover:bg-rsg-navy/90 text-white"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline ml-2">New Payment</span>
                    </Button>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="flex flex-col sm:flex-row gap-3"
            >
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search payments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                        <Filter className="h-4 w-4 mr-2 text-slate-400" />
                        <SelectValue />
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
            </motion.div>

            {/* Payment Table */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
            >
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="col-span-3">
                        <SortHeader field="paymentNo" label="Payment" />
                    </div>
                    <div className="col-span-3 hidden md:block">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</span>
                    </div>
                    <div className="col-span-2">
                        <SortHeader field="grossAmount" label="Gross" align="right" />
                    </div>
                    <div className="col-span-2">
                        <SortHeader field="netPayment" label="Net" align="right" />
                    </div>
                    <div className="col-span-1 text-center">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</span>
                    </div>
                    <div className="col-span-1"></div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-rsg-navy dark:text-rsg-gold" />
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <CreditCard className="h-12 w-12 mb-4 opacity-40" />
                            <p className="font-medium">No payments found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </div>
                    ) : (
                        filteredPayments.map((payment, index) => {
                            const status = statusConfig[payment.paymentStatus] || statusConfig['Draft'];
                            const isHovered = hoveredRow === payment.id;

                            return (
                                <motion.div
                                    key={payment.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="relative"
                                    onMouseEnter={() => setHoveredRow(payment.id)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                >
                                    {/* Main Row */}
                                    <div className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors ${
                                        isHovered ? 'bg-slate-50 dark:bg-slate-800/50' : ''
                                    }`}>
                                        <div className="col-span-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-1 h-10 rounded-full ${status.dot}`} />
                                                <div>
                                                    <p className="font-mono font-bold text-slate-900 dark:text-white">{payment.paymentNo}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 md:hidden truncate max-w-[120px]">{payment.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-span-3 hidden md:block">
                                            <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{payment.description}</p>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <p className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                                                {formatCurrency(payment.grossAmount)}
                                            </p>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <p className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(payment.netPayment)}
                                            </p>
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${status.bg} ${status.text} border ${status.border}`}>
                                                {payment.paymentStatus === 'Submitted on ACONEX' ? 'ACONEX' : payment.paymentStatus}
                                            </span>
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => { setEditingPayment(payment); setIsFormOpen(true); }}>
                                                        <Pencil className="h-4 w-4 mr-2" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleDelete(payment.id)} className="text-red-600">
                                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* Hover Details Panel */}
                                    <AnimatePresence>
                                        {isHovered && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800"
                                            >
                                                <div className="px-6 py-4">
                                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                                        {/* Deductions */}
                                                        <div>
                                                            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Adv. Recovery</p>
                                                            <p className="font-mono text-sm text-red-600 dark:text-red-400">
                                                                -{formatCurrency(Math.abs(payment.advancePaymentRecovery || 0))}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Retention</p>
                                                            <p className="font-mono text-sm text-amber-600 dark:text-amber-400">
                                                                -{formatCurrency(Math.abs(payment.retention || 0))}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">VAT Recovery</p>
                                                            <p className="font-mono text-sm text-red-500 dark:text-red-400/70">
                                                                -{formatCurrency(Math.abs(payment.vatRecovery || 0))}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">VAT (15%)</p>
                                                            <p className="font-mono text-sm text-slate-600 dark:text-slate-300">
                                                                +{formatCurrency(payment.vat)}
                                                            </p>
                                                        </div>

                                                        {/* Dates */}
                                                        <div>
                                                            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Submitted</p>
                                                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                                                {payment.submittedDate ? format(new Date(payment.submittedDate), 'dd MMM yyyy') : '-'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Invoice</p>
                                                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                                                {payment.invoiceDate ? format(new Date(payment.invoiceDate), 'dd MMM yyyy') : '-'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Status Update */}
                                                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3">
                                                        <span className="text-xs text-slate-500">Update Status:</span>
                                                        <Select
                                                            defaultValue={payment.paymentStatus}
                                                            onValueChange={(val) => handleStatusUpdate(payment.id, val)}
                                                            disabled={updatingStatusId === payment.id}
                                                        >
                                                            <SelectTrigger className="h-8 w-[140px] text-xs">
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
                                                        {updatingStatusId === payment.id && (
                                                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                                        )}
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

                {/* Table Footer */}
                {filteredPayments.length > 0 && (
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium">
                        <div className="col-span-3 md:col-span-6">
                            <span className="text-sm text-slate-600 dark:text-slate-300">
                                Total ({filteredPayments.length} payments)
                            </span>
                        </div>
                        <div className="col-span-2 text-right">
                            <p className="font-mono text-sm text-blue-600 dark:text-blue-400">{formatCurrency(totals.gross)}</p>
                        </div>
                        <div className="col-span-2 text-right">
                            <p className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totals.net)}</p>
                        </div>
                        <div className="col-span-2"></div>
                    </div>
                )}
            </motion.div>

            {/* Payment Form Dialog */}
            <PaymentForm
                open={isFormOpen}
                onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingPayment(null); }}
                onSubmit={editingPayment ? handleUpdate : handleCreate}
                initialData={editingPayment}
                lastPayment={lastPayment}
            />
        </div>
    );
}
