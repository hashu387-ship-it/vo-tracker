
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
import { Plus, Pencil, Trash2, MoreHorizontal, Receipt } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { PaymentForm } from "./payment-form";
import { toast } from "sonner";
import { PaymentStats } from "./payment-stats";

interface PaymentRegisterProps {
    payments: PaymentApplication[];
    onRefresh: () => void;
    isLoading: boolean;
}

export function PaymentRegister({ payments, onRefresh, isLoading }: PaymentRegisterProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<PaymentApplication | null>(null);

    const handleCreate = async (values: any) => {
        try {
            const res = await fetch("/api/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) throw new Error("Failed to create payment");

            toast.success("Payment created successfully");
            setIsFormOpen(false);
            onRefresh();
        } catch (error) {
            toast.error("Error creating payment");
            console.error(error);
        }
    };

    const handleUpdate = async (values: any) => {
        if (!editingPayment) return;
        try {
            const res = await fetch(`/api/payments/${editingPayment.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) throw new Error("Failed to update payment");

            toast.success("Payment updated successfully");
            setIsFormOpen(false);
            setEditingPayment(null);
            onRefresh();
        } catch (error) {
            toast.error("Error updating payment");
            console.error(error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this payment?")) return;
        try {
            const res = await fetch(`/api/payments/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete payment");

            toast.success("Payment deleted successfully");
            onRefresh();
        } catch (error) {
            toast.error("Error deleting payment");
            console.error(error);
        }
    };

    const openEdit = (payment: PaymentApplication) => {
        setEditingPayment(payment);
        setIsFormOpen(true);
    };

    const openCreate = () => {
        setEditingPayment(null);
        setIsFormOpen(true);
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading payments...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Payment Register</h3>
                    <p className="text-sm text-muted-foreground mt-1">Manage all In-tranche Payment Applications</p>
                </div>
                <Button onClick={openCreate} className="shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0">
                    <Plus className="mr-2 h-4 w-4" />
                    New Payment Application
                </Button>
            </div>

            <PaymentStats payments={payments} />

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-950 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-900 hover:bg-gray-900 border-b-gray-800">
                                <TableHead className="text-gray-100 font-semibold w-[80px]">Ref</TableHead>
                                <TableHead className="text-gray-100 font-semibold min-w-[220px]">Description</TableHead>
                                <TableHead className="text-gray-100 font-semibold text-right min-w-[140px] bg-gray-800/50 border-x border-gray-700/50">Gross Certified</TableHead>
                                <TableHead className="text-gray-100 font-semibold text-right min-w-[130px]">Adv Recovery</TableHead>
                                <TableHead className="text-gray-100 font-semibold text-right min-w-[130px]">Retention</TableHead>
                                <TableHead className="text-gray-100 font-semibold text-right min-w-[130px]">VAT Recovery</TableHead>
                                <TableHead className="text-gray-100 font-semibold text-right min-w-[120px]">VAT 15%</TableHead>
                                <TableHead className="text-emerald-400 font-bold text-right min-w-[140px] bg-gray-800/50 border-x border-gray-700/50">Net Payment</TableHead>
                                <TableHead className="text-gray-100 font-semibold min-w-[120px]">Submitted Date</TableHead>
                                <TableHead className="text-gray-100 font-semibold min-w-[120px]">Invoice Date</TableHead>
                                <TableHead className="text-gray-100 font-semibold text-center min-w-[110px]">Payment Status</TableHead>
                                <TableHead className="text-gray-100 font-semibold text-center min-w-[140px]">Status</TableHead>
                                <TableHead className="text-gray-100 font-semibold min-w-[150px]">Remarks</TableHead>
                                <TableHead className="text-gray-100 font-semibold min-w-[120px]">FFC Action</TableHead>
                                <TableHead className="text-gray-100 font-semibold min-w-[120px]">RSG Action</TableHead>
                                <TableHead className="text-gray-100 font-semibold text-right w-[80px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment, index) => (
                                <TableRow
                                    key={payment.id}
                                    className={`group hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50/30 dark:bg-gray-900/20'}`}
                                >
                                    <TableCell className="font-medium font-mono text-gray-700 dark:text-gray-300">{payment.paymentNo}</TableCell>
                                    <TableCell className="max-w-[220px]">
                                        <div className="truncate font-medium text-gray-800 dark:text-gray-200" title={payment.description}>
                                            {payment.description}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-medium text-blue-700 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/10 border-x border-gray-100 dark:border-gray-800">
                                        {formatCurrency(payment.grossAmount)}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-red-600 dark:text-red-400">
                                        {payment.advancePaymentRecovery ? `(${formatCurrency(Math.abs(payment.advancePaymentRecovery))})` : "-"}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-red-600 dark:text-red-400">
                                        {payment.retention && payment.retention < 0
                                            ? `(${formatCurrency(Math.abs(payment.retention))})`
                                            : payment.retention > 0
                                                ? formatCurrency(payment.retention) // Positive logic for release
                                                : "-"}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-red-600 dark:text-red-400">
                                        {payment.vatRecovery ? `(${formatCurrency(Math.abs(payment.vatRecovery))})` : "-"}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-gray-600 dark:text-gray-400">
                                        {formatCurrency(payment.vat)}
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-900/10 border-x border-gray-100 dark:border-gray-800">
                                        {formatCurrency(payment.netPayment)}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                        {payment.submittedDate ? format(new Date(payment.submittedDate), "MMM dd, yyyy") : "-"}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                        {payment.invoiceDate ? format(new Date(payment.invoiceDate), "MMM dd, yyyy") : "-"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border shadow-sm
                                            ${payment.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                                                payment.paymentStatus === 'Submitted on ACONEX' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' :
                                                    'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}>
                                            {payment.paymentStatus}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border shadow-sm
                                            ${(payment as any).approvalStatus === 'Received' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                                                'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}>
                                            {(payment as any).approvalStatus || "-"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-[150px]">
                                        <div className="truncate text-xs text-muted-foreground" title={payment.remarks || ""}>
                                            {payment.remarks || "-"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[120px]">
                                        <div className="truncate text-xs text-muted-foreground" title={payment.ffcLiveAction || ""}>
                                            {payment.ffcLiveAction || "-"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[120px]">
                                        <div className="truncate text-xs text-muted-foreground" title={payment.rsgLiveAction || ""}>
                                            {payment.rsgLiveAction || "-"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => openEdit(payment)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleDelete(payment.id)} className="text-red-600 focus:text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {payments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={16} className="h-32 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <Receipt className="h-8 w-8 opacity-20" />
                                            <p>No payment records found.</p>
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
            />
        </div>
    );
}
