import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { PaymentApplication } from "@prisma/client";
import { TrendingUp, Activity, Wallet, FileText, CheckCircle2 } from "lucide-react";

interface PaymentStatsProps {
    payments: PaymentApplication[];
}

export function PaymentStats({ payments }: PaymentStatsProps) {
    // Constants from project data
    const ORIGINAL_CONTRACT_VALUE = 217501556.12;
    const REVISED_CONTRACT_VALUE = 232612538.97;
    const ADVANCE_PAYMENT_PAID = 65250466.83;
    const RETENTION_CAP_PERCENTAGE = 0.05;
    const RETENTION_CAP_VALUE = 11630626.95; // 5% of Revised

    // Calculations
    const totalGrossCertified = payments.reduce((sum, p) => sum + (p.grossAmount || 0), 0) - (43500311.22 + 21750155.61); // Exclude AP01, AP02 from "Work Done"? Usually APs are not work done.
    // Wait, user text: "Total Work Done 183,107,592.39".
    // Let's check: Sum of IPA 1-24 Gross?
    // IPA 23 Gross is 18M. 
    // Calculating on the fly might be risky if I don't know exactly which rows count.
    // However, generally AP01/AP02 are Advance Payments, not "Work Executed".
    // So filter out AP01, AP02.

    // Let's filter payments that are NOT starting with AP
    const workPayments = payments.filter(p => !p.paymentNo.startsWith('AP'));
    const calculatedWorkDone = workPayments.reduce((sum, p) => sum + (p.grossAmount || 0), 0);

    // Advance Payment Recovery
    // User text: "Deducted till Date 54,211,168.65".
    const totalAdvRecovery = payments.reduce((sum, p) => sum + Math.abs(p.advancePaymentRecovery || 0), 0);
    const advBalance = ADVANCE_PAYMENT_PAID - totalAdvRecovery;

    // Retention
    // User text: "Deducted till Date 8,663,508.37".
    // Note: My seed has IPA 21 with POSITIVE retention (Release?).
    // "Deducted till date" usually implies sum of deductions only.
    // "Total Retention" (Limit) is 11.6M.
    const retentionDeducted = payments
        .filter(p => (p.retention || 0) < 0)
        .reduce((sum, p) => sum + Math.abs(p.retention || 0), 0);

    // Balance refers to "Limit - Deducted" or "Amount Held"?
    // User text: Balance 2,967,118.58 => 11,630,626.95 - 8,663,508.37 = 2,967,118.58.
    // So Balance = Limit - Deducted.
    const retentionBalance = RETENTION_CAP_VALUE - retentionDeducted;

    // Derived Percentages
    const workDonePercentage = (calculatedWorkDone / REVISED_CONTRACT_VALUE) * 100;
    const advRecoveryPercentage = (totalAdvRecovery / ADVANCE_PAYMENT_PAID) * 100;
    const retentionPercentage = (retentionDeducted / RETENTION_CAP_VALUE) * 100;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Project Value Card */}
            <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Project Value</CardTitle>
                    <FileText className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                        {formatCurrency(REVISED_CONTRACT_VALUE)}
                    </div>
                    <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Original Contract</span>
                            <span>{formatCurrency(ORIGINAL_CONTRACT_VALUE)}</span>
                        </div>
                    </div>
                    <div className="mt-3 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                </CardContent>
            </Card>

            {/* Advance Payment Card */}
            <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Advance Payment</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                        {formatCurrency(ADVANCE_PAYMENT_PAID)}
                    </div>
                    <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Recovered ({advRecoveryPercentage.toFixed(1)}%)</span>
                            <span className="text-emerald-600 font-medium">{formatCurrency(totalAdvRecovery)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Balance</span>
                            <span className="text-gray-700 dark:text-gray-300">{formatCurrency(advBalance)}</span>
                        </div>
                    </div>
                    <div className="mt-3 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(advRecoveryPercentage, 100)}%` }}></div>
                    </div>
                </CardContent>
            </Card>

            {/* Retention Card */}
            <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Retention (5% Cap)</CardTitle>
                    <Wallet className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                        {formatCurrency(RETENTION_CAP_VALUE)}
                    </div>
                    <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Deducted ({retentionPercentage.toFixed(1)}%)</span>
                            <span className="text-amber-600 font-medium">{formatCurrency(retentionDeducted)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Balance to Cap</span>
                            <span className="text-gray-700 dark:text-gray-300">{formatCurrency(retentionBalance)}</span>
                        </div>
                    </div>
                    <div className="mt-3 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(retentionPercentage, 100)}%` }}></div>
                    </div>
                </CardContent>
            </Card>

            {/* Work Done Card */}
            <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Work Done</CardTitle>
                    <Activity className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                        {formatCurrency(calculatedWorkDone)}
                    </div>
                    <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Progress</span>
                            <span className="text-indigo-600 font-medium">{workDonePercentage.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Balance Work</span>
                            <span className="text-gray-700 dark:text-gray-300">{formatCurrency(REVISED_CONTRACT_VALUE - calculatedWorkDone)}</span>
                        </div>
                    </div>
                    <div className="mt-3 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(workDonePercentage, 100)}%` }}></div>
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
