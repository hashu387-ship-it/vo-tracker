import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { PaymentApplication } from "@prisma/client";
import { TrendingUp, TrendingDown, DollarSign, Activity, Wallet, PieChart } from "lucide-react";

interface PaymentStatsProps {
    payments: PaymentApplication[];
}

export function PaymentStats({ payments }: PaymentStatsProps) {
    // Constants from project data
    const ORIGINAL_CONTRACT_VALUE = 217501556.12;
    const REVISED_CONTRACT_VALUE = 232612538.97;
    const ADVANCE_PAYMENT_PAID = 65250466.83;
    const RETENTION_CAP_PERCENTAGE = 0.05;
    const RETENTION_CAP_VALUE = REVISED_CONTRACT_VALUE * RETENTION_CAP_PERCENTAGE; // 11,630,626.95

    // Calculations
    const totalGrossCertified = payments.reduce((sum, p) => sum + (p.grossAmount || 0), 0);

    // Advance Payment Recovery
    const totalAdvRecovery = payments.reduce((sum, p) => sum + Math.abs(p.advancePaymentRecovery || 0), 0);
    const advBalance = ADVANCE_PAYMENT_PAID - totalAdvRecovery;
    const advRecoveryPercentage = (totalAdvRecovery / ADVANCE_PAYMENT_PAID) * 100;

    // Retention
    // Note: Some retention values might be negative (deduction) or positive (release)
    // We want "Deducted till Date". Assuming releases decrease the "Held" amount.
    // User summary says "Deducted till date 8,663,508.37".
    // If we sum all retention columns (where deduction is negative), we get net held.
    // Let's sum Math.abs for deductions? No, we should sum the actual values.
    // In our seed, deductions are negative. So simple sum will be negative.
    // -8.6M means 8.6M held.
    // If there's a release (positive), it reduces the held amount.
    const totalRetentionHeld = Math.abs(payments.reduce((sum, p) => sum + (p.retention || 0), 0));

    // Work Done
    const workDonePercentage = (totalGrossCertified / REVISED_CONTRACT_VALUE) * 100;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Contract Value Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-100 dark:border-blue-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Contract Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {formatCurrency(REVISED_CONTRACT_VALUE)}
                    </div>
                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                        Original: {formatCurrency(ORIGINAL_CONTRACT_VALUE)}
                    </p>
                    <div className="mt-2 h-1 w-full bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                </CardContent>
            </Card>

            {/* Advance Payment Card */}
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-100 dark:border-emerald-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Advance Payment</CardTitle>
                    <WorkflowIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                        {formatCurrency(advBalance)}
                    </div>
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1 flex justify-between">
                        <span>Paid: {formatCurrency(ADVANCE_PAYMENT_PAID)}</span>
                    </p>
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 flex justify-between">
                        <span>Recovered: {formatCurrency(totalAdvRecovery)}</span>
                    </p>
                    <div className="mt-2 h-1 w-full bg-emerald-200 dark:bg-emerald-800 rounded-full overflow-hidden">
                        {/* Progress bar shows recovered % */}
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(advRecoveryPercentage, 100)}%` }}></div>
                    </div>
                    <p className="text-[10px] text-right mt-1 text-emerald-600 dark:text-emerald-400">{advRecoveryPercentage.toFixed(1)}% Recovered</p>
                </CardContent>
            </Card>

            {/* Retention Card */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-100 dark:border-amber-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">Retention Held</CardTitle>
                    <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                        {formatCurrency(totalRetentionHeld)}
                    </div>
                    <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
                        5% Limit ({formatCurrency(RETENTION_CAP_VALUE)})
                    </p>
                    <div className="mt-2 h-1 w-full bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(totalRetentionHeld / RETENTION_CAP_VALUE) * 100}%` }}></div>
                    </div>
                </CardContent>
            </Card>

            {/* Work Done Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-100 dark:border-purple-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Work Done</CardTitle>
                    <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {formatCurrency(totalGrossCertified)}
                    </div>
                    <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                        {workDonePercentage.toFixed(1)}% of Revised Contract
                    </p>
                    <div className="mt-2 h-1 w-full bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(workDonePercentage, 100)}%` }}></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function WorkflowIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="8" height="8" x="3" y="3" rx="2" />
            <path d="M7 11v4a2 2 0 0 0 2 2h4" />
            <rect width="8" height="8" x="13" y="13" rx="2" />
        </svg>
    )
}
