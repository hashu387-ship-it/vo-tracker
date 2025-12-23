
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
            <div className="flex justify-between items-center px-2">
                <div>
                    <h3 className="text-lg font-semibold">Payment Register</h3>
                    <p className="text-sm text-muted-foreground">Manage all In-tranche Payment Applications</p>
                </div>
                <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="h-4 w-4" />
                    Add Payment
                </Button>
            </div>

            <PaymentStats payments={payments} />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[100px]">No</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Gross Amount</TableHead>
                            <TableHead className="text-right">Adv Recovery</TableHead>
                            <TableHead className="text-right">Retention</TableHead>
                            <TableHead className="text-right">VAT</TableHead>
                            <TableHead className="text-right font-bold text-emerald-600">Net Payment</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.map((payment) => (
                            <TableRow key={payment.id} className="group">
                                <TableCell className="font-medium">{payment.paymentNo}</TableCell>
                                <TableCell className="max-w-[200px] truncate" title={payment.description}>
                                    {payment.description}
                                    <div className="text-xs text-muted-foreground">
                                        Sub: {payment.submittedDate ? format(new Date(payment.submittedDate), "MMM dd, yyyy") : "-"}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(payment.grossAmount)}</TableCell>
                                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                    {payment.advancePaymentRecovery ? formatCurrency(payment.advancePaymentRecovery) : "-"}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                    {payment.retention ? formatCurrency(payment.retention) : "-"}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                    {formatCurrency(payment.vat)}
                                </TableCell>
                                <TableCell className="text-right font-mono font-bold text-emerald-600">
                                    {formatCurrency(payment.netPayment)}
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${payment.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                            payment.paymentStatus === 'Submitted on ACONEX' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                                        {payment.paymentStatus}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
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
                                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                    No payments found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
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
