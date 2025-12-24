"use client";

import { useState } from "react";
import { PaymentApplication } from "@prisma/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { Plus, MoreHorizontal, Pencil, Trash2, Receipt, Loader2, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { PaymentForm } from "./payment-form";
import { PaymentStats } from "./payment-stats";
import { toast } from "sonner";

interface PaymentRegisterProps {
    payments: PaymentApplication[];
    onRefresh: () => void;
    isLoading: boolean;
}

export function PaymentRegister({ payments, onRefresh, isLoading }: PaymentRegisterProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<PaymentApplication | null>(null);
    const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

    // Derived state for auto-fill
    // Sort logic: use paymentNo for sorting usually, but here creation time is safer if user just added it.
    // Actually, sorting by 'submittedDate' or 'paymentNo' desc is better.
    // Let's assume the array passed is just 'payments'.
    const sortedPayments = [...payments].sort((a, b) => {
        // Try to parse paymentNo if possible (e.g. IPA 24 > IPA 1)
        // But for now, let's just use createdAt if available or id.
        return b.id - a.id;
    });
    const lastPayment = sortedPayments.length > 0 ? sortedPayments[0] : null;

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
            const res = await fetch(`/api/payments/${id}`, {
                method: "DELETE",
            });

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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight text-foreground">Payment Register</h3>
                    <p className="text-sm text-muted-foreground">Manage In-tranche Payment Applications & Certifications</p>
                </div>
                <Button
                    onClick={openCreate}
                    className="shadow-lg hover:shadow-emerald-500/20 text-white font-medium px-6 py-2.5 h-auto rounded-lg bg-emerald-600 hover:bg-emerald-500"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Payment Application
                </Button>
            </div>

            <PaymentStats payments={payments} />

            {/* Main Table Card */}
            <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="hidden md:block overflow-x-auto custom-scrollbar">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/40 border-b border-border/50">
                                <TableHead className="text-muted-foreground font-semibold w-[80px] h-12 uppercase text-[11px] tracking-wider">Ref</TableHead>
                                <TableHead className="text-muted-foreground font-semibold min-w-[200px] uppercase text-[11px] tracking-wider">Description</TableHead>
                                <TableHead className="text-muted-foreground font-semibold text-right min-w-[140px] bg-muted/20 uppercase text-[11px] tracking-wider">Gross Certified</TableHead>
                                <TableHead className="text-muted-foreground font-semibold text-right min-w-[120px] uppercase text-[11px] tracking-wider">Adv Rec</TableHead>
                                <TableHead className="text-muted-foreground font-semibold text-right min-w-[120px] uppercase text-[11px] tracking-wider">Retention</TableHead>
                                <TableHead className="text-muted-foreground font-semibold text-right min-w-[120px] uppercase text-[11px] tracking-wider">VAT Rec</TableHead>
                                <TableHead className="text-muted-foreground font-semibold text-right min-w-[110px] uppercase text-[11px] tracking-wider">VAT 15%</TableHead>
                                <TableHead className="text-emerald-600 dark:text-emerald-400 font-bold text-right min-w-[140px] bg-emerald-500/5 dark:bg-emerald-950/10 border-x border-emerald-500/10 uppercase text-[11px] tracking-wider">Net Payment</TableHead>
                                <TableHead className="text-muted-foreground font-semibold min-w-[110px] uppercase text-[11px] tracking-wider">Submitted</TableHead>
                                <TableHead className="text-muted-foreground font-semibold min-w-[110px] uppercase text-[11px] tracking-wider">Invoice</TableHead>
                                <TableHead className="text-muted-foreground font-semibold text-center min-w-[130px] uppercase text-[11px] tracking-wider">Pay Status</TableHead>
                                <TableHead className="text-muted-foreground font-semibold text-center min-w-[130px] uppercase text-[11px] tracking-wider">App Status</TableHead>
                                <TableHead className="text-muted-foreground font-semibold min-w-[150px] uppercase text-[11px] tracking-wider">Remarks</TableHead>
                                <TableHead className="text-muted-foreground font-semibold min-w-[120px] uppercase text-[11px] tracking-wider">FFC Action</TableHead>
                                <TableHead className="text-muted-foreground font-semibold min-w-[120px] uppercase text-[11px] tracking-wider">RSG Action</TableHead>
                                <TableHead className="text-muted-foreground font-semibold text-right w-[60px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={16} className="h-32 text-center text-zinc-500">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Loading records...
                                    </TableCell>
                                </TableRow>
                            ) : payments.map((payment, index) => (
                                <TableRow
                                    key={payment.id}
                                    className={`group transition-colors border-border/40 hover:bg-muted/50 ${index % 2 === 0 ? 'bg-transparent' : 'bg-muted/20'}`}
                                >
                                    <TableCell className="font-mono text-foreground font-medium">{payment.paymentNo}</TableCell>
                                    <TableCell className="max-w-[200px]">
                                        <div className="truncate font-medium text-foreground" title={payment.description}>
                                            {payment.description}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-medium text-blue-600 dark:text-blue-400 bg-blue-500/5 dark:bg-blue-950/10">
                                        {formatCurrency(payment.grossAmount)}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-red-500 dark:text-red-400 opacity-90">
                                        {payment.advancePaymentRecovery ? `(${formatCurrency(Math.abs(payment.advancePaymentRecovery))})` : "-"}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-amber-600 dark:text-amber-500 opacity-90">
                                        {payment.retention && payment.retention < 0
                                            ? `(${formatCurrency(Math.abs(payment.retention))})`
                                            : payment.retention > 0
                                                ? formatCurrency(payment.retention)
                                                : "-"}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-red-500 dark:text-red-400 opacity-90">
                                        {payment.vatRecovery ? `(${formatCurrency(Math.abs(payment.vatRecovery))})` : "-"}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                        {formatCurrency(payment.vat)}
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-950/10 border-x border-emerald-500/10">
                                        {formatCurrency(payment.netPayment)}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-mono">
                                        {payment.submittedDate ? format(new Date(payment.submittedDate), "dd MMM yyyy") : "-"}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-mono">
                                        {payment.invoiceDate ? format(new Date(payment.invoiceDate), "dd MMM yyyy") : "-"}
                                    </TableCell>

                                    {/* Clickable Payment Status */}
                                    <TableCell className="p-1">
                                        <Select
                                            defaultValue={payment.paymentStatus}
                                            onValueChange={(val) => handleStatusUpdate(payment.id, val, 'paymentStatus')}
                                            disabled={updatingStatusId === payment.id}
                                        >
                                            <SelectTrigger className={`h-7 text-[10px] font-medium border-0 focus:ring-0 focus:ring-offset-0 bg-transparent justify-center ${payment.paymentStatus === 'Paid' ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-500' :
                                                payment.paymentStatus === 'Certified' ? 'text-blue-600 dark:text-blue-400 hover:text-blue-500' :
                                                    'text-muted-foreground hover:text-foreground'
                                                }`}>
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
                                    </TableCell>

                                    {/* Clickable Approval Status */}
                                    <TableCell className="p-1">
                                        <Select
                                            defaultValue={(payment as any).approvalStatus || 'Pending'}
                                            onValueChange={(val) => handleStatusUpdate(payment.id, val, 'approvalStatus')}
                                            disabled={updatingStatusId === payment.id}
                                        >
                                            <SelectTrigger className={`h-7 text-[10px] font-medium border-0 focus:ring-0 focus:ring-offset-0 bg-transparent justify-center ${(payment as any).approvalStatus === 'Received' ? 'text-blue-600 dark:text-blue-400 hover:text-blue-500' :
                                                'text-muted-foreground hover:text-foreground'
                                                }`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Received">Received</SelectItem>
                                                <SelectItem value="Under Review">Under Review</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>

                                    <TableCell className="max-w-[150px]">
                                        <div className="truncate text-xs text-muted-foreground" title={(payment as any).remarks || ""}>
                                            {(payment as any).remarks || "-"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[120px]">
                                        <div className="truncate text-xs text-muted-foreground" title={(payment as any).ffcLiveAction || ""}>
                                            {(payment as any).ffcLiveAction || "-"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[120px]">
                                        <div className="truncate text-xs text-muted-foreground" title={(payment as any).rsgLiveAction || ""}>
                                            {(payment as any).rsgLiveAction || "-"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pl-0">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted text-muted-foreground">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => openEdit(payment)} className="cursor-pointer">
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleDelete(payment.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {payments.length === 0 && !isLoading && (
                                <TableRow>
                                    <TableCell colSpan={16} className="h-64 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center ring-1 ring-border">
                                                <Receipt className="h-6 w-6 opacity-40" />
                                            </div>
                                            <p className="text-lg font-medium text-zinc-400">No payment records found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 p-4">
                    {isLoading ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
                            <p>Loading payments...</p>
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Receipt className="h-12 w-12 opacity-20 mx-auto mb-3" />
                            <p>No payment records found</p>
                        </div>
                    ) : (
                        payments.map((payment) => (
                            <div key={payment.id} className="relative bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
                                {/* Header */}
                                <div className="pr-8">
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <span className="font-mono text-lg font-bold text-foreground">{payment.paymentNo}</span>
                                            <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                {formatCurrency(payment.grossAmount)}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ${payment.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                                                payment.paymentStatus === 'Certified' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                                                    'bg-muted text-muted-foreground border border-border'
                                                }`}>
                                                {payment.paymentStatus}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{payment.submittedDate ? format(new Date(payment.submittedDate), "dd MMM yyyy") : "-"}</span>
                                            {payment.invoiceDate && (
                                                <>
                                                    <span className="text-border">•</span>
                                                    <span>{payment.invoiceDate ? format(new Date(payment.invoiceDate), "dd MMM yyyy") : "-"}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted text-muted-foreground">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEdit(payment)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(payment.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Key Metrics Grid */}
                                <div className="grid grid-cols-2 gap-3 py-3 border-y border-border/50">
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Gross Amount</p>
                                        <p className="font-mono font-semibold text-blue-600 dark:text-blue-400 text-sm">
                                            {formatCurrency(payment.grossAmount)}
                                        </p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Net Payment</p>
                                        <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base">
                                            {formatCurrency(payment.netPayment)}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Retention</p>
                                        <p className="font-mono text-xs text-amber-600 dark:text-amber-500">
                                            {payment.retention ? formatCurrency(payment.retention) : '-'}
                                        </p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">VAT (15%)</p>
                                        <p className="font-mono text-xs text-muted-foreground">
                                            {formatCurrency(payment.vat)}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer & Dates */}
                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <span>Sub: {payment.submittedDate ? format(new Date(payment.submittedDate), "dd MMM") : "-"}</span>
                                        <span className="w-1 h-1 rounded-full bg-border" />
                                        <span>Inv: {payment.invoiceDate ? format(new Date(payment.invoiceDate), "dd MMM") : "-"}</span>
                                    </div>

                                    {/* Simple Status Toggle for Mobile (Simplified) */}
                                    {/* For full editing, user can edit via menu, but we can show approval status here */}
                                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${(payment as any).approvalStatus === 'Received'
                                        ? 'bg-blue-500/5 border-blue-500/20 text-blue-600 dark:text-blue-400'
                                        : 'bg-muted/30 border-border text-muted-foreground'
                                        }`}>
                                        <span className="text-[10px] font-medium">{(payment as any).approvalStatus || 'Pending'}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

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
