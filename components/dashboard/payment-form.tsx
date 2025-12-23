
"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { formatCurrency } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Info } from "lucide-react";
import { addMonths, format } from "date-fns";

// Calculations
const ADV_RECOVERY_PERCENT = 0.3209; // 32.09%
const RETENTION_PERCENT = 0.05; // 5%
const VAT_PERCENT = 0.15; // 15%

const formSchema = z.object({
    paymentNo: z.string().min(1, "Payment No is required"),
    description: z.string().min(1, "Description is required"),
    paymentStatus: z.string().min(1, "Payment Status is required"),
    approvalStatus: z.string().optional(),
    grossAmount: z.coerce.number().min(0, "Must be positive"),
    advancePaymentRecovery: z.coerce.number(),
    retention: z.coerce.number(),
    vatRecovery: z.coerce.number(),
    vat: z.coerce.number(),
    netPayment: z.coerce.number(),
    submittedDate: z.string().optional(),
    invoiceDate: z.string().optional(),
    remarks: z.string().optional(),
    ffcLiveAction: z.string().optional(),
    rsgLiveAction: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof formSchema>;

interface PaymentFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: PaymentFormValues) => Promise<void>;
    initialData?: any;
    lastPayment?: any;
}

export function PaymentForm({ open, onOpenChange, onSubmit, initialData, lastPayment }: PaymentFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PaymentFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            paymentNo: "",
            description: "",
            paymentStatus: "Draft",
            approvalStatus: "Received",
            grossAmount: 0,
            advancePaymentRecovery: 0,
            retention: 0,
            vatRecovery: 0,
            vat: 0,
            netPayment: 0,
            submittedDate: "",
            invoiceDate: "",
            remarks: "",
            ffcLiveAction: "",
            rsgLiveAction: "",
        },
    });

    useEffect(() => {
        if (initialData) {
            reset({
                ...initialData,
                submittedDate: initialData.submittedDate ? new Date(initialData.submittedDate).toISOString().split('T')[0] : "",
                invoiceDate: initialData.invoiceDate ? new Date(initialData.invoiceDate).toISOString().split('T')[0] : "",
                approvalStatus: initialData.approvalStatus || "Received",
                remarks: initialData.remarks || "",
                ffcLiveAction: initialData.ffcLiveAction || "",
                rsgLiveAction: initialData.rsgLiveAction || "",
            });
        } else if (open && lastPayment) {
            // Auto-fill logic based on last payment
            const lastNoMatch = lastPayment.paymentNo.match(/IPA\s*(\d+)/i);
            const nextNo = lastNoMatch ? `IPA ${parseInt(lastNoMatch[1]) + 1}` : "";

            // Suggest dates - assuming monthly cycle
            const lastDate = lastPayment.invoiceDate ? new Date(lastPayment.invoiceDate) : new Date();
            const nextDate = addMonths(lastDate, 1);
            const nextDateStr = format(nextDate, 'yyyy-MM-dd');

            reset({
                paymentNo: nextNo,
                description: "", // User must fill description
                paymentStatus: "Draft",
                approvalStatus: "Received",
                grossAmount: 0,
                advancePaymentRecovery: 0,
                retention: 0,
                vatRecovery: 0,
                vat: 0,
                netPayment: 0,
                submittedDate: nextDateStr,
                invoiceDate: nextDateStr,
                remarks: "",
                ffcLiveAction: "",
                rsgLiveAction: "",
            });
        } else if (open) {
            reset({
                paymentNo: "",
                description: "",
                paymentStatus: "Draft",
                approvalStatus: "Received",
                grossAmount: 0,
                advancePaymentRecovery: 0,
                retention: 0,
                vatRecovery: 0,
                vat: 0,
                netPayment: 0,
                submittedDate: new Date().toISOString().split('T')[0],
                invoiceDate: "",
                remarks: "",
                ffcLiveAction: "",
                rsgLiveAction: "",
            });
        }
    }, [initialData, open, lastPayment, reset]);

    // Auto-calculation logic
    const grossAmount = watch("grossAmount");

    useEffect(() => {
        if (!grossAmount && grossAmount !== 0) return;

        const gross = Number(grossAmount);

        // Logic Confirmation:
        // Adv Rec = -(Gross * 0.3209)
        // VAT on Adv Rec = Adv Rec * 0.15 (This deducts VAT portion of Advance)
        // Retention = -(Gross * 0.05) (No VAT effect, straight deduction)
        // VAT = Gross * 0.15 (VAT on Gross)

        // Net = Gross + AdvRec + Ret + VatRec + VAT
        // Net = (Gross - AdvRec) + (VAT on Net Base) - Retention?
        // Actually: Gross + VAT(Gross) - AdvRec - VAT(AdvRec) - Ret.
        // This effectively means VAT is paid on (Gross - AdvRec).
        // And Retention is deducted from the final check (after tax).

        const advRec = -(gross * ADV_RECOVERY_PERCENT);
        const ret = -(gross * RETENTION_PERCENT);
        const vat = gross * VAT_PERCENT;
        const vatRec = advRec * VAT_PERCENT;

        setValue("advancePaymentRecovery", parseFloat(advRec.toFixed(2)));
        setValue("retention", parseFloat(ret.toFixed(2)));
        setValue("vatRecovery", parseFloat(vatRec.toFixed(2)));
        setValue("vat", parseFloat(vat.toFixed(2)));

        const net = gross + advRec + ret + vatRec + vat;
        setValue("netPayment", parseFloat(net.toFixed(2)));

    }, [grossAmount, setValue]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-zinc-100 dark">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-zinc-100">{initialData ? "Edit Payment Application" : "New Payment Application"}</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Enter payment details. Calculations for Advance Recovery (32.09%), Retention (5%), and VAT (15%) are automated.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="paymentNo" className="text-zinc-300">Payment No</Label>
                            <Input id="paymentNo" placeholder="IPA 25" {...register("paymentNo")} className="bg-zinc-900 border-zinc-700 focus:border-emerald-500 text-zinc-100" />
                            {errors.paymentNo && <p className="text-sm text-red-500">{errors.paymentNo.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paymentStatus" className="text-zinc-300">Payment Status</Label>
                            <Controller
                                control={control}
                                name="paymentStatus"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-emerald-500/20">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                                            <SelectItem value="Draft">Draft</SelectItem>
                                            <SelectItem value="Submitted">Submitted</SelectItem>
                                            <SelectItem value="Submitted on ACONEX">Submitted on ACONEX</SelectItem>
                                            <SelectItem value="Certified">Certified</SelectItem>
                                            <SelectItem value="Paid">Paid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.paymentStatus && <p className="text-sm text-red-500">{errors.paymentStatus.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-zinc-300">Description</Label>
                        <Input id="description" placeholder="Period or Description" {...register("description")} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="approvalStatus" className="text-zinc-300">Approval Status</Label>
                            <Controller
                                control={control}
                                name="approvalStatus"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Received">Received</SelectItem>
                                            <SelectItem value="Under Review">Under Review</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ffcLiveAction" className="text-zinc-300">FFC Action</Label>
                            <Input id="ffcLiveAction" placeholder="Transaction..." {...register("ffcLiveAction")} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rsgLiveAction" className="text-zinc-300">RSG Action</Label>
                            <Input id="rsgLiveAction" placeholder="Transaction..." {...register("rsgLiveAction")} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="remarks" className="text-zinc-300">Remarks</Label>
                        <Input id="remarks" placeholder="Any remarks" {...register("remarks")} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                    </div>

                    <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 space-y-4">
                        <h4 className="text-sm font-medium text-emerald-400 flex items-center mb-2">
                            <Info className="h-4 w-4 mr-2" />
                            Financial Details
                        </h4>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="grossAmount" className="text-zinc-300">Gross Amount</Label>
                                <Input id="grossAmount" type="number" step="0.01" {...register("grossAmount")} className="bg-zinc-950 border-zinc-700 text-zinc-100 font-mono text-lg" />
                                {errors.grossAmount && <p className="text-sm text-red-500">{errors.grossAmount.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="netPayment" className="text-emerald-400 font-bold">Net Payment</Label>
                                <Input id="netPayment" type="number" step="0.01" {...register("netPayment")} readOnly className="bg-emerald-950/30 border-emerald-900/50 text-emerald-400 font-mono font-bold text-lg" />
                                <p className="text-[10px] text-zinc-500">Gross + VAT(Net) - AdvRec - Ret</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-zinc-800 pt-4">
                            <div className="space-y-1">
                                <Label htmlFor="advancePaymentRecovery" className="text-red-400 text-xs">Adv. Rec (32.09%)</Label>
                                <Input id="advancePaymentRecovery" type="number" step="0.01" {...register("advancePaymentRecovery")} className="h-8 text-sm bg-zinc-950/50 border-zinc-800 text-red-300 font-mono" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="retention" className="text-amber-500 text-xs">Retention (5%)</Label>
                                <Input id="retention" type="number" step="0.01" {...register("retention")} className="h-8 text-sm bg-zinc-950/50 border-zinc-800 text-amber-500 font-mono" />
                                <p className="text-[9px] text-zinc-600">Deducted from Net (No VAT)</p>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="vatRecovery" className="text-red-400 text-xs">VAT Rec (15%)</Label>
                                <Input id="vatRecovery" type="number" step="0.01" {...register("vatRecovery")} className="h-8 text-sm bg-zinc-950/50 border-zinc-800 text-red-300 font-mono" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="vat" className="text-zinc-300 text-xs">VAT (15%)</Label>
                                <Input id="vat" type="number" step="0.01" {...register("vat")} className="h-8 text-sm bg-zinc-950/50 border-zinc-800 text-zinc-300 font-mono" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="submittedDate" className="text-zinc-300">Submitted Date</Label>
                            <Input id="submittedDate" type="date" {...register("submittedDate")} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="invoiceDate" className="text-zinc-300">Invoice Date</Label>
                            <Input id="invoiceDate" type="date" {...register("invoiceDate")} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? "Update Payment" : "Create Payment"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
