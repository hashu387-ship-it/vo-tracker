"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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

            // Intelligent Description Parsing
            let nextDescription = "";
            const nextMonth = format(nextDate, 'MMMM yyyy');
            nextDescription = `Payment Application for ${nextMonth}`;

            reset({
                paymentNo: nextNo,
                description: nextDescription,
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

        // Logic Update: VAT calculated on Gross, with deduction ONLY for Advance Recovery VAT.
        // Retention is deducted from the Net Payment but does NOT reduce the VAT payable.
        // 
        // VAT (Output) = Gross * 15%
        // VAT (Recovery/Input deduction) = AdvRec * 15%
        // Net = (Gross + VAT) - (AdvRec + VAT on AdvRec) - Retention

        const advRec = -(gross * ADV_RECOVERY_PERCENT);
        const ret = -(gross * RETENTION_PERCENT);

        // VAT Recovery now ONLY includes Advance Payment Recovery portion
        const vatRec = advRec * VAT_PERCENT;
        const vat = gross * VAT_PERCENT;

        setValue("advancePaymentRecovery", parseFloat(advRec.toFixed(2)));
        setValue("retention", parseFloat(ret.toFixed(2)));
        setValue("vatRecovery", parseFloat(vatRec.toFixed(2)));
        setValue("vat", parseFloat(vat.toFixed(2)));

        const net = gross + advRec + ret + vatRec + vat;
        setValue("netPayment", parseFloat(net.toFixed(2)));


    }, [grossAmount, setValue]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-background/95 dark:bg-zinc-950/95 backdrop-blur-xl border-border/50 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center justify-between">
                        <span>{initialData ? "Edit Payment Application" : "New Payment Application"}</span>
                        {lastPayment && !initialData && (
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/30 px-2 py-1 rounded border border-emerald-500/20">Auto-Filled from Previous</span>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        Enter payment details. Calculations for Advance Recovery (32.09%), Retention (5%), and VAT (15%) are automated on the Net amount.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="paymentNo">Payment No</Label>
                            <Input id="paymentNo" placeholder="IPA 25" {...register("paymentNo")} className="bg-muted/50" />
                            {errors.paymentNo && <p className="text-sm text-destructive">{errors.paymentNo.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paymentStatus">Payment Status</Label>
                            <Controller
                                control={control}
                                name="paymentStatus"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <SelectTrigger className="bg-muted/50">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Draft">Draft</SelectItem>
                                            <SelectItem value="Submitted">Submitted</SelectItem>
                                            <SelectItem value="Submitted on ACONEX">Submitted on ACONEX</SelectItem>
                                            <SelectItem value="Certified">Certified</SelectItem>
                                            <SelectItem value="Paid">Paid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.paymentStatus && <p className="text-sm text-destructive">{errors.paymentStatus.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" placeholder="Period or Description" {...register("description")} className="bg-muted/50" />
                        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="approvalStatus">Approval Status</Label>
                            <Controller
                                control={control}
                                name="approvalStatus"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <SelectTrigger className="bg-muted/50">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Received">Received</SelectItem>
                                            <SelectItem value="Under Review">Under Review</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ffcLiveAction">FFC Action</Label>
                            <Input id="ffcLiveAction" placeholder="Transaction..." {...register("ffcLiveAction")} className="bg-muted/50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rsgLiveAction">RSG Action</Label>
                            <Input id="rsgLiveAction" placeholder="Transaction..." {...register("rsgLiveAction")} className="bg-muted/50" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="remarks">Remarks</Label>
                        <Input id="remarks" placeholder="Any remarks" {...register("remarks")} className="bg-muted/50" />
                    </div>

                    <div className="p-4 rounded-xl border border-border/50 bg-card/50 shadow-inner space-y-4">
                        <h4 className="text-sm font-medium text-primary flex items-center mb-2">
                            <Info className="h-4 w-4 mr-2" />
                            Financial Breakdown
                        </h4>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="grossAmount">Gross Amount</Label>
                                <Input id="grossAmount" type="number" step="0.01" {...register("grossAmount")} className="font-mono text-lg bg-background/50 focus:bg-background transition-colors" />
                                {errors.grossAmount && <p className="text-sm text-destructive">{errors.grossAmount.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="netPayment" className="text-emerald-600 dark:text-emerald-400 font-bold">Net Payment</Label>
                                <Input id="netPayment" type="number" step="0.01" {...register("netPayment")} readOnly className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-lg" />
                                <p className="text-[10px] text-muted-foreground">Includes VAT, deducts Retention & Adv. Recovery</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border/50 pt-4">
                            <div className="space-y-1">
                                <Label htmlFor="advancePaymentRecovery" className="text-red-500/80 text-xs">Adv. Rec (32.09%)</Label>
                                <Input id="advancePaymentRecovery" type="number" step="0.01" {...register("advancePaymentRecovery")} className="h-8 text-sm bg-muted/30 border-border/50 text-red-500 font-mono" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="retention" className="text-amber-500/80 text-xs">Retention (5%)</Label>
                                <Input id="retention" type="number" step="0.01" {...register("retention")} className="h-8 text-sm bg-muted/30 border-border/50 text-amber-500 font-mono" />
                                <p className="text-[9px] text-muted-foreground">Deducted from Gross</p>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="vatRecovery" className="text-red-500/80 text-xs">VAT Rec (15%)</Label>
                                <Input id="vatRecovery" type="number" step="0.01" {...register("vatRecovery")} className="h-8 text-sm bg-muted/30 border-border/50 text-red-500 font-mono" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="vat" className="text-muted-foreground text-xs">VAT (15%)</Label>
                                <Input id="vat" type="number" step="0.01" {...register("vat")} className="h-8 text-sm bg-muted/30 border-border/50 font-mono" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="submittedDate">Submitted Date</Label>
                            <Input id="submittedDate" type="date" {...register("submittedDate")} className="bg-muted/50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="invoiceDate">Invoice Date</Label>
                            <Input id="invoiceDate" type="date" {...register("invoiceDate")} className="bg-muted/50" />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? "Update Payment" : "Create Payment"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
