
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Calculations
const ADV_RECOVERY_PERCENT = 0.3209; // 32.09%
const RETENTION_PERCENT = 0.05; // 5%
const VAT_PERCENT = 0.15; // 15%

const formSchema = z.object({
    paymentNo: z.string().min(1, "Payment No is required"),
    description: z.string().min(1, "Description is required"),
    paymentStatus: z.string().min(1, "Status is required"),
    grossAmount: z.coerce.number().min(0, "Must be positive"),
    advancePaymentRecovery: z.coerce.number(),
    retention: z.coerce.number(),
    vatRecovery: z.coerce.number(),
    vat: z.coerce.number(),
    netPayment: z.coerce.number(),
    submittedDate: z.string().optional(),
    invoiceDate: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof formSchema>;

interface PaymentFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: PaymentFormValues) => Promise<void>;
    initialData?: any;
}

export function PaymentForm({ open, onOpenChange, onSubmit, initialData }: PaymentFormProps) {
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
            grossAmount: 0,
            advancePaymentRecovery: 0,
            retention: 0,
            vatRecovery: 0,
            vat: 0,
            netPayment: 0,
            submittedDate: "",
            invoiceDate: "",
        },
    });

    useEffect(() => {
        if (initialData) {
            reset({
                ...initialData,
                submittedDate: initialData.submittedDate ? new Date(initialData.submittedDate).toISOString().split('T')[0] : "",
                invoiceDate: initialData.invoiceDate ? new Date(initialData.invoiceDate).toISOString().split('T')[0] : "",
            });
        } else {
            reset({
                paymentNo: "",
                description: "",
                paymentStatus: "Draft",
                grossAmount: 0,
                advancePaymentRecovery: 0,
                retention: 0,
                vatRecovery: 0,
                vat: 0,
                netPayment: 0,
                submittedDate: "",
                invoiceDate: "",
            });
        }
    }, [initialData, reset]);

    // Auto-calculation logic
    const grossAmount = watch("grossAmount");

    useEffect(() => {
        if (!grossAmount && grossAmount !== 0) return;

        const gross = Number(grossAmount);
        // Logic verified against IPA 24:
        // Adv Rec = -(Gross * 0.3209)
        // Ret = -(Gross * 0.05)
        // Vat Rec = Adv Rec * 0.15
        // Vat = Gross * 0.15
        const advRec = -(gross * ADV_RECOVERY_PERCENT);
        const ret = -(gross * RETENTION_PERCENT);
        const vat = gross * VAT_PERCENT;
        const vatRec = advRec * VAT_PERCENT; // Negative * positive = negative

        setValue("advancePaymentRecovery", parseFloat(advRec.toFixed(2)));
        setValue("retention", parseFloat(ret.toFixed(2)));
        setValue("vatRecovery", parseFloat(vatRec.toFixed(2)));
        setValue("vat", parseFloat(vat.toFixed(2)));

        const net = gross + advRec + ret + vatRec + vat;
        setValue("netPayment", parseFloat(net.toFixed(2)));

    }, [grossAmount, setValue]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Payment" : "New Payment"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="paymentNo">Payment No</Label>
                            <Input id="paymentNo" placeholder="IPA 25" {...register("paymentNo")} />
                            {errors.paymentNo && <p className="text-sm text-red-500">{errors.paymentNo.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paymentStatus">Status</Label>
                            <Controller
                                control={control}
                                name="paymentStatus"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <SelectTrigger>
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
                            {errors.paymentStatus && <p className="text-sm text-red-500">{errors.paymentStatus.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" placeholder="Period or Description" {...register("description")} />
                        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="grossAmount">Gross Amount</Label>
                            <Input id="grossAmount" type="number" step="0.01" {...register("grossAmount")} />
                            {errors.grossAmount && <p className="text-sm text-red-500">{errors.grossAmount.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="netPayment">Net Payment</Label>
                            <Input id="netPayment" type="number" step="0.01" {...register("netPayment")} readOnly className="bg-muted" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="advancePaymentRecovery">Adv. Recovery (32.09%)</Label>
                            <Input id="advancePaymentRecovery" type="number" step="0.01" {...register("advancePaymentRecovery")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="retention">Retention (5%)</Label>
                            <Input id="retention" type="number" step="0.01" {...register("retention")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="vatRecovery">VAT Recovery</Label>
                            <Input id="vatRecovery" type="number" step="0.01" {...register("vatRecovery")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="vat">VAT (15%)</Label>
                            <Input id="vat" type="number" step="0.01" {...register("vat")} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="submittedDate">Submitted Date</Label>
                            <Input id="submittedDate" type="date" {...register("submittedDate")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="invoiceDate">Invoice Date</Label>
                            <Input id="invoiceDate" type="date" {...register("invoiceDate")} />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? "Update Payment" : "Create Payment"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
