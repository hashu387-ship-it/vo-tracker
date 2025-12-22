
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calculator, Save, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const paymentSchema = z.object({
    paymentNo: z.string().min(1, 'Payment No is required'),
    description: z.string().min(1, 'Description is required'),
    grossAmount: z.number().min(0),
    advancePaymentRecovery: z.number().default(0),
    retention: z.number().default(0),
    vatRecovery: z.number().default(0),
    vat: z.number().default(0),
    netPayment: z.number(),
    submittedDate: z.date().optional().nullable(),
    invoiceDate: z.date().optional().nullable(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
    initialData?: any;
    onSuccess?: () => void;
    isDialog?: boolean;
}

export function PaymentForm({ initialData, onSuccess, isDialog }: PaymentFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [autoCalcEnabled, setAutoCalcEnabled] = useState(true);

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: initialData || {
            paymentNo: '',
            description: '',
            grossAmount: 0,
            advancePaymentRecovery: 0,
            retention: 0,
            vatRecovery: 0,
            vat: 0,
            netPayment: 0,
            submittedDate: undefined,
            invoiceDate: undefined,
        },
    });

    const { watch, setValue } = form;
    const grossAmount = watch('grossAmount');

    const [rateScheme, setRateScheme] = useState<'initial' | 'revised'>('revised');

    // Auto-calculation logic
    useEffect(() => {
        if (!autoCalcEnabled || initialData) return;

        if (grossAmount > 0) {
            // Rates based on scheme
            const rates = rateScheme === 'initial'
                ? { adv: 0.20, ret: 0.10 }
                : { adv: 0.3209, ret: 0.05 };

            const advRec = -(grossAmount * rates.adv);
            const ret = -(grossAmount * rates.ret);
            const vatRec = advRec * 0.15;
            const vat = grossAmount * 0.15;

            setValue('advancePaymentRecovery', parseFloat(advRec.toFixed(2)));
            setValue('retention', parseFloat(ret.toFixed(2)));
            setValue('vatRecovery', parseFloat(vatRec.toFixed(2)));
            setValue('vat', parseFloat(vat.toFixed(2)));

            const net = grossAmount + advRec + ret + vatRec + vat;
            setValue('netPayment', parseFloat(net.toFixed(2)));
        }
    }, [grossAmount, autoCalcEnabled, setValue, initialData, rateScheme]);

    // Re-calculate Net if any component changes manually
    const advRec = watch('advancePaymentRecovery');
    const ret = watch('retention');
    const vatRec = watch('vatRecovery');
    const vat = watch('vat');

    useEffect(() => {
        if (grossAmount !== undefined) {
            const net = (Number(grossAmount) || 0) + (Number(advRec) || 0) + (Number(ret) || 0) + (Number(vatRec) || 0) + (Number(vat) || 0);
            setValue('netPayment', parseFloat(net.toFixed(2)));
        }
    }, [grossAmount, advRec, ret, vatRec, vat, setValue]);


    async function onSubmit(data: PaymentFormValues) {
        setIsSubmitting(true);
        try {
            const url = initialData ? `/api/payments/${initialData.id}` : '/api/payments';
            const method = initialData ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to save payment');
            }

            toast.success(initialData ? 'Payment updated' : 'Payment created');
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error('Something went wrong');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card className={cn("w-full", isDialog && "border-0 shadow-none")}>
            {!isDialog && (
                <CardHeader>
                    <CardTitle>Payment Application Details</CardTitle>
                    <CardDescription>Enter the gross certified amount to auto-calculate deductions and net payment.</CardDescription>
                </CardHeader>
            )}
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Payment No / IPA Ref</Label>
                            <Input {...form.register('paymentNo')} placeholder="e.g. IPA 15" />
                            {form.formState.errors.paymentNo && <p className="text-red-500 text-xs">{form.formState.errors.paymentNo.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Description / Month</Label>
                            <Input {...form.register('description')} placeholder="e.g. Jan 25th 2025 – Feb 25th 2025" />
                            {form.formState.errors.description && <p className="text-red-500 text-xs">{form.formState.errors.description.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-blue-600 font-semibold">Gross Certified Amount</Label>
                            <Input
                                type="number"
                                step="0.01"
                                {...form.register('grossAmount', { valueAsNumber: true })}
                                className="border-blue-200 focus:border-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Adv. Payment Recovery</Label>
                            <Input type="number" step="0.01" {...form.register('advancePaymentRecovery', { valueAsNumber: true })} />
                            <p className="text-[10px] text-gray-500">Usually negative (e.g. -20% or -32.09%)</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Retention</Label>
                            <Input type="number" step="0.01" {...form.register('retention', { valueAsNumber: true })} />
                            <p className="text-[10px] text-gray-500">Usually negative (e.g. -10% or -5%)</p>
                        </div>

                        <div className="space-y-2">
                            <Label>VAT Recovery (Adv)</Label>
                            <Input type="number" step="0.01" {...form.register('vatRecovery', { valueAsNumber: true })} />
                            <p className="text-[10px] text-gray-500">15% of Adv Recovery</p>
                        </div>

                        <div className="space-y-2">
                            <Label>VAT 15%</Label>
                            <Input type="number" step="0.01" {...form.register('vat', { valueAsNumber: true })} />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-green-600 font-bold">Net Payment Certified</Label>
                            <Input
                                type="number"
                                step="0.01"
                                {...form.register('netPayment', { valueAsNumber: true })}
                                className="font-bold bg-green-50 border-green-200"
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-2">
                            <Label>Submitted Date (FFC to TRSDC)</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !watch('submittedDate') && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {watch('submittedDate') ? format(watch('submittedDate')!, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={watch('submittedDate') || undefined}
                                        onSelect={(date) => setValue('submittedDate', date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <Label>Invoice Submitted Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !watch('invoiceDate') && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {watch('invoiceDate') ? format(watch('invoiceDate')!, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={watch('invoiceDate') || undefined}
                                        onSelect={(date) => setValue('invoiceDate', date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        {!initialData && (
                            <div className="flex flex-col gap-2 mr-auto border p-2 rounded bg-gray-50">
                                <span className="text-xs font-semibold text-gray-700">Auto-Calc Settings:</span>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="rateScheme"
                                            value="initial"
                                            checked={rateScheme === 'initial'}
                                            onChange={() => setRateScheme('initial')}
                                            className="text-rsg-blue"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-700">Initial (20% / 10%)</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="rateScheme"
                                            value="revised"
                                            checked={rateScheme === 'revised'}
                                            onChange={() => setRateScheme('revised')}
                                            className="text-rsg-blue"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-700">Revised (32.09% / 5%)</span>
                                        </div>
                                    </label>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                        type="checkbox"
                                        id="autoCalc"
                                        checked={autoCalcEnabled}
                                        onChange={(e) => setAutoCalcEnabled(e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                                    />
                                    <Label htmlFor="autoCalc" className="cursor-pointer text-xs text-gray-500">Enable Auto-calculation</Label>
                                </div>
                            </div>
                        )}
                        <Button type="submit" disabled={isSubmitting} className="bg-rsg-blue hover:bg-rsg-navy">
                            {isSubmitting ? 'Saving...' : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Payment
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
