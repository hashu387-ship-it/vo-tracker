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
import { Plus, MoreHorizontal, Pencil, Trash2, Receipt, Loader2, ArrowUpDown } from "lucide-react";
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
                    <h3 className="text-3xl font-bold tracking-tight text-foreground">Payment Register</h3>
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
            <div className="rounded-xl border border-zinc-800 bg-[#09090b] shadow-2xl overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-900/50 hover:bg-zinc-900/50 border-b border-zinc-800">
                                <TableHead className="text-zinc-400 font-medium w-[80px] h-12">Ref</TableHead>
                                <TableHead className="text-zinc-400 font-medium min-w-[200px]">Description</TableHead>
                                <TableHead className="text-zinc-400 font-medium text-right min-w-[140px] bg-zinc-900/30">Gross Certified</TableHead>
                                <TableHead className="text-zinc-400 font-medium text-right min-w-[120px]">Adv Rec</TableHead>
                                <TableHead className="text-zinc-400 font-medium text-right min-w-[120px]">Retention</TableHead>
                                <TableHead className="text-zinc-400 font-medium text-right min-w-[120px]">VAT Rec</TableHead>
                                <TableHead className="text-zinc-400 font-medium text-right min-w-[110px]">VAT 15%</TableHead>
                                <TableHead className="text-emerald-400 font-bold text-right min-w-[140px] bg-emerald-950/10 border-x border-emerald-900/10">Net Payment</TableHead>
                                <TableHead className="text-zinc-400 font-medium min-w-[110px]">Submitted</TableHead>
                                <TableHead className="text-zinc-400 font-medium min-w-[110px]">Invoice</TableHead>
                                <TableHead className="text-zinc-400 font-medium text-center min-w-[130px]">Pay Status</TableHead>
                                <TableHead className="text-zinc-400 font-medium text-center min-w-[130px]">App Status</TableHead>
                                <TableHead className="text-zinc-400 font-medium min-w-[150px]">Remarks</TableHead>
                                <TableHead className="text-zinc-400 font-medium min-w-[120px]">FFC Action</TableHead>
                                <TableHead className="text-zinc-400 font-medium min-w-[120px]">RSG Action</TableHead>
                                <TableHead className="text-zinc-400 font-medium text-right w-[60px]"></TableHead>
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
                                    className={`group transition-colors border-zinc-800/50 hover:bg-zinc-800/30 ${index % 2 === 0 ? 'bg-transparent' : 'bg-zinc-900/20'}`}
                                >
                                    <TableCell className="font-mono text-zinc-300 font-medium">{payment.paymentNo}</TableCell>
                                    <TableCell className="max-w-[200px]">
                                        <div className="truncate font-medium text-zinc-200" title={payment.description}>
                                            {payment.description}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-medium text-blue-400 bg-blue-950/10">
                                        {formatCurrency(payment.grossAmount)}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-red-400/80">
                                        {payment.advancePaymentRecovery ? `(${formatCurrency(Math.abs(payment.advancePaymentRecovery))})` : "-"}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-amber-500/80">
                                        {payment.retention && payment.retention < 0
                                            ? `(${formatCurrency(Math.abs(payment.retention))})`
                                            : payment.retention > 0
                                                ? formatCurrency(payment.retention)
                                                : "-"}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-red-400/80">
                                        {payment.vatRecovery ? `(${formatCurrency(Math.abs(payment.vatRecovery))})` : "-"}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-zinc-400">
                                        {formatCurrency(payment.vat)}
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-bold text-emerald-400 bg-emerald-950/10 border-x border-emerald-900/10">
                                        {formatCurrency(payment.netPayment)}
                                    </TableCell>
                                    <TableCell className="text-xs text-zinc-500 whitespace-nowrap font-mono">
                                        {payment.submittedDate ? format(new Date(payment.submittedDate), "dd MMM yyyy") : "-"}
                                    </TableCell>
                                    <TableCell className="text-xs text-zinc-500 whitespace-nowrap font-mono">
                                        {payment.invoiceDate ? format(new Date(payment.invoiceDate), "dd MMM yyyy") : "-"}
                                    </TableCell>

                                    {/* Clickable Payment Status */}
                                    <TableCell className="p-1">
                                        <Select
                                            defaultValue={payment.paymentStatus}
                                            onValueChange={(val) => handleStatusUpdate(payment.id, val, 'paymentStatus')}
                                            disabled={updatingStatusId === payment.id}
                                        >
                                            <SelectTrigger className={`h-7 text-[10px] font-medium border-0 focus:ring-0 focus:ring-offset-0 bg-transparent justify-center ${payment.paymentStatus === 'Paid' ? 'text-emerald-400 hover:text-emerald-300' :
                                                    payment.paymentStatus === 'Certified' ? 'text-blue-400 hover:text-blue-300' :
                                                        'text-zinc-400 hover:text-zinc-300'
                                                }`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
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
                                            <SelectTrigger className={`h-7 text-[10px] font-medium border-0 focus:ring-0 focus:ring-offset-0 bg-transparent justify-center ${(payment as any).approvalStatus === 'Received' ? 'text-blue-400 hover:text-blue-300' :
                                                    'text-zinc-500 hover:text-zinc-400'
                                                }`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Received">Received</SelectItem>
                                                <SelectItem value="Under Review">Under Review</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>

                                    <TableCell className="max-w-[150px]">
                                        <div className="truncate text-xs text-zinc-500" title={(payment as any).remarks || ""}>
                                            {(payment as any).remarks || "-"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[120px]">
                                        <div className="truncate text-xs text-zinc-500" title={(payment as any).ffcLiveAction || ""}>
                                            {(payment as any).ffcLiveAction || "-"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[120px]">
                                        <div className="truncate text-xs text-zinc-500" title={(payment as any).rsgLiveAction || ""}>
                                            {(payment as any).rsgLiveAction || "-"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pl-0">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-zinc-800 text-zinc-400">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-200">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => openEdit(payment)} className="focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer">
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-zinc-800" />
                                                <DropdownMenuItem onClick={() => handleDelete(payment.id)} className="text-red-500 focus:bg-red-950/30 focus:text-red-400 cursor-pointer">
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
                                    <TableCell colSpan={16} className="h-64 text-center text-zinc-500">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center ring-1 ring-zinc-800">
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
