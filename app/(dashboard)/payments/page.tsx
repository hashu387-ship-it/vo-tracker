'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PaymentRegister } from '@/components/dashboard/payment-register';
import { PaymentApplication } from '@prisma/client';
import { toast } from 'sonner';

export default function PaymentsPage() {
    const [payments, setPayments] = useState<PaymentApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    return (
        <div className="min-h-screen bg-[#09090b] pb-20 text-zinc-100">
            <div className="container mx-auto p-6 space-y-8">
                <DashboardHeader
                    onExport={() => { }}
                    onPrint={() => window.print()}
                />

                <div className="bg-transparent">
                    <PaymentRegister
                        payments={payments}
                        onRefresh={fetchPayments}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
}
