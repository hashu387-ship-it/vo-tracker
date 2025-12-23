
'use client';

import { useState, useEffect } from 'react';
import { PaymentForm } from '@/components/payments/payment-form';
import { ProjectDetailsCard } from '@/components/payments/project-details-card';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Payment {
    id: number;
    paymentNo: string;
    description: string;
    grossAmount: number;
    advancePaymentRecovery: number;
    retention: number;
    vatRecovery: number;
    vat: number;
    netPayment: number;
    submittedDate: string | null;
    invoiceDate: string | null;
    paymentStatus: string;
    ffcLiveAction: string | null;
    rsgLiveAction: string | null;
    remarks: string | null;
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Payment | undefined>(undefined);

    const fetchPayments = async () => {
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
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this payment record?')) return;
        try {
            await fetch(`/api/payments/${id}`, { method: 'DELETE' });
            toast.success('Payment deleted');
            fetchPayments();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleEdit = (payment: Payment) => {
        // Convert string dates to Date objects for the form
        const paymentForForm = {
            ...payment,
            submittedDate: payment.submittedDate ? new Date(payment.submittedDate) : null,
            invoiceDate: payment.invoiceDate ? new Date(payment.invoiceDate) : null,
        };
        setEditingPayment(paymentForForm as any);
        setIsDialogOpen(true);
    };

    const currency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR' }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <div className="container mx-auto p-6 space-y-8">
                <DashboardHeader
                    onExport={() => { }}
                    onPrint={() => window.print()}
                />

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-rsg-navy tracking-tight">Payment Register</h2>
                        <p className="text-gray-500 mt-1">Manage Invoices and Payment Applications</p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setEditingPayment(undefined);
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-rsg-gold hover:bg-[#B08D55] text-white">
                                <Plus className="mr-2 h-4 w-4" />
                                New Payment Application
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingPayment ? 'Edit Payment' : 'New Payment Application'}</DialogTitle>
                            </DialogHeader>
                            <PaymentForm
                                initialData={editingPayment}
                                isDialog
                                onSuccess={() => {
                                    setIsDialogOpen(false);
                                    fetchPayments();
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Project Details Summary */}
                <ProjectDetailsCard />

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-rsg-navy/5">
                                <TableRow>
                                    <TableHead className="font-bold text-rsg-navy">Ref</TableHead>
                                    <TableHead className="font-bold text-rsg-navy min-w-[200px]">Description</TableHead>
                                    <TableHead className="font-bold text-right text-blue-700">Gross Amount</TableHead>
                                    <TableHead className="font-bold text-right text-red-600">Adv Rec</TableHead>
                                    <TableHead className="font-bold text-right text-red-600">Retention</TableHead>
                                    <TableHead className="font-bold text-right text-red-600">VAT Rec</TableHead>
                                    <TableHead className="font-bold text-right text-gray-700">VAT 15%</TableHead>
                                    <TableHead className="font-bold text-right text-green-700 bg-green-50">Net Payment</TableHead>
                                    <TableHead className="text-right">Submitted</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={11} className="h-24 text-center">Loading payments...</TableCell>
                                    </TableRow>
                                ) : payments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} className="h-24 text-center text-gray-500">No payment records found.</TableCell>
                                    </TableRow>
                                ) : (
                                    payments.map((payment) => {
                                        const statusColor =
                                            payment.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                                            payment.paymentStatus === 'Received' ? 'bg-blue-100 text-blue-700' :
                                            payment.paymentStatus === 'Submitted on ACONEX' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-600';

                                        return (
                                            <TableRow key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell className="font-medium text-rsg-blue">{payment.paymentNo}</TableCell>
                                                <TableCell className="text-gray-600 text-xs md:text-sm">{payment.description}</TableCell>
                                                <TableCell className="text-right font-mono text-blue-700">{currency(payment.grossAmount)}</TableCell>
                                                <TableCell className="text-right font-mono text-red-500">{currency(payment.advancePaymentRecovery)}</TableCell>
                                                <TableCell className="text-right font-mono text-red-500">{currency(payment.retention)}</TableCell>
                                                <TableCell className="text-right font-mono text-red-500">{currency(payment.vatRecovery)}</TableCell>
                                                <TableCell className="text-right font-mono text-gray-600">{currency(payment.vat)}</TableCell>
                                                <TableCell className="text-right font-mono font-bold text-green-700 bg-green-50/50">{currency(payment.netPayment)}</TableCell>
                                                <TableCell className="text-right text-xs text-gray-500">
                                                    {payment.submittedDate ? format(new Date(payment.submittedDate), 'MMM d, yyyy') : '-'}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-medium ${statusColor}`}>
                                                        {payment.paymentStatus}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(payment)} className="h-8 w-8 text-gray-500 hover:text-blue-600">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(payment.id)} className="h-8 w-8 text-gray-500 hover:text-red-600">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}
