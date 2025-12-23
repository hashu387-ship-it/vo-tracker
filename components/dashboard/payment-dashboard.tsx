"use client";

import { PaymentApplication } from "@prisma/client";
import { motion } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    CreditCard,
    CheckCircle2,
    Clock,
    FileCheck,
    Banknote,
    ArrowUpRight,
    ArrowDownRight,
    PieChart,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
    PieChart as RechartsPie,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";

interface PaymentDashboardProps {
    payments: PaymentApplication[];
}

const statusColors: Record<string, string> = {
    Draft: "#94a3b8",
    Submitted: "#3b82f6",
    "Submitted on ACONEX": "#6366f1",
    Certified: "#f59e0b",
    Paid: "#10b981",
};

export function PaymentDashboard({ payments }: PaymentDashboardProps) {
    // Calculate metrics
    const totalGross = payments.reduce((sum, p) => sum + (p.grossAmount || 0), 0);
    const totalNet = payments.reduce((sum, p) => sum + (p.netPayment || 0), 0);
    const totalDeductions = totalGross - totalNet;

    const paidPayments = payments.filter((p) => p.paymentStatus === "Paid");
    const certifiedPayments = payments.filter((p) => p.paymentStatus === "Certified");
    const pendingPayments = payments.filter(
        (p) => !["Paid", "Certified"].includes(p.paymentStatus)
    );

    const totalPaid = paidPayments.reduce((sum, p) => sum + (p.netPayment || 0), 0);
    const totalCertified = certifiedPayments.reduce((sum, p) => sum + (p.netPayment || 0), 0);
    const totalPending = pendingPayments.reduce((sum, p) => sum + (p.netPayment || 0), 0);

    // Status distribution for pie chart
    const statusData = Object.entries(
        payments.reduce((acc, p) => {
            acc[p.paymentStatus] = (acc[p.paymentStatus] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ).map(([name, value]) => ({
        name: name === "Submitted on ACONEX" ? "ACONEX" : name,
        value,
        color: statusColors[name] || "#94a3b8",
    }));

    // Monthly data for bar chart
    const monthlyData = payments.reduce((acc, p) => {
        if (p.submittedDate) {
            const date = new Date(p.submittedDate);
            const monthKey = date.toLocaleString("default", { month: "short", year: "2-digit" });
            if (!acc[monthKey]) {
                acc[monthKey] = { month: monthKey, gross: 0, net: 0 };
            }
            acc[monthKey].gross += p.grossAmount || 0;
            acc[monthKey].net += p.netPayment || 0;
        }
        return acc;
    }, {} as Record<string, { month: string; gross: number; net: number }>);

    const chartData = Object.values(monthlyData)
        .slice(-6)
        .map((d) => ({
            ...d,
            gross: d.gross / 1000000,
            net: d.net / 1000000,
        }));

    const kpiCards = [
        {
            title: "Total Gross",
            value: totalGross,
            icon: Banknote,
            color: "blue",
            bgLight: "bg-blue-50",
            bgDark: "dark:bg-blue-500/10",
            textColor: "text-blue-600 dark:text-blue-400",
            borderColor: "border-blue-200 dark:border-blue-500/20",
        },
        {
            title: "Total Net",
            value: totalNet,
            icon: TrendingUp,
            color: "emerald",
            bgLight: "bg-emerald-50",
            bgDark: "dark:bg-emerald-500/10",
            textColor: "text-emerald-600 dark:text-emerald-400",
            borderColor: "border-emerald-200 dark:border-emerald-500/20",
        },
        {
            title: "Total Paid",
            value: totalPaid,
            icon: CheckCircle2,
            color: "green",
            bgLight: "bg-green-50",
            bgDark: "dark:bg-green-500/10",
            textColor: "text-green-600 dark:text-green-400",
            borderColor: "border-green-200 dark:border-green-500/20",
            subtitle: `${paidPayments.length} payments`,
        },
        {
            title: "Certified",
            value: totalCertified,
            icon: FileCheck,
            color: "amber",
            bgLight: "bg-amber-50",
            bgDark: "dark:bg-amber-500/10",
            textColor: "text-amber-600 dark:text-amber-400",
            borderColor: "border-amber-200 dark:border-amber-500/20",
            subtitle: `${certifiedPayments.length} payments`,
        },
        {
            title: "Pending",
            value: totalPending,
            icon: Clock,
            color: "slate",
            bgLight: "bg-slate-50",
            bgDark: "dark:bg-slate-500/10",
            textColor: "text-slate-600 dark:text-slate-400",
            borderColor: "border-slate-200 dark:border-slate-500/20",
            subtitle: `${pendingPayments.length} payments`,
        },
        {
            title: "Deductions",
            value: totalDeductions,
            icon: TrendingDown,
            color: "red",
            bgLight: "bg-red-50",
            bgDark: "dark:bg-red-500/10",
            textColor: "text-red-600 dark:text-red-400",
            borderColor: "border-red-200 dark:border-red-500/20",
            subtitle: `${((totalDeductions / totalGross) * 100).toFixed(1)}% of gross`,
        },
    ];

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {kpiCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border ${card.bgLight} ${card.bgDark} ${card.borderColor} transition-all hover:shadow-md`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <card.icon className={`h-4 w-4 ${card.textColor}`} />
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {card.title}
                            </span>
                        </div>
                        <p className={`text-lg font-bold ${card.textColor} font-mono`}>
                            {formatCurrency(card.value)}
                        </p>
                        {card.subtitle && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {card.subtitle}
                            </p>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <PieChart className="h-4 w-4 text-slate-500" />
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                            Status Distribution
                        </h3>
                    </div>
                    <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPie>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={70}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                                        border: "none",
                                        borderRadius: "8px",
                                        color: "#fff",
                                    }}
                                    formatter={(value) => [`${value} payments`, ""]}
                                />
                            </RechartsPie>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 justify-center">
                        {statusData.map((item) => (
                            <div key={item.name} className="flex items-center gap-1.5 text-xs">
                                <div
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-slate-600 dark:text-slate-400">
                                    {item.name} ({item.value})
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Monthly Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 lg:col-span-2"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-slate-500" />
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                Monthly Trend (SAR Millions)
                            </h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-blue-500" />
                                <span className="text-slate-500">Gross</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-emerald-500" />
                                <span className="text-slate-500">Net</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} barGap={4}>
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 11 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 11 }}
                                    tickFormatter={(v) => `${v}M`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                                        border: "none",
                                        borderRadius: "8px",
                                        color: "#fff",
                                    }}
                                    formatter={(value) => [
                                        `SAR ${Number(value).toFixed(2)}M`,
                                        "",
                                    ]}
                                />
                                <Bar dataKey="gross" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="net" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Quick Stats Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4 p-4 bg-gradient-to-r from-rsg-navy to-rsg-blue rounded-xl"
            >
                <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg">
                    <CreditCard className="h-5 w-5 text-white/70" />
                    <div>
                        <p className="text-xs text-white/60">Total Applications</p>
                        <p className="text-lg font-bold text-white">{payments.length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg">
                    <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                    <div>
                        <p className="text-xs text-white/60">Collection Rate</p>
                        <p className="text-lg font-bold text-white">
                            {totalGross > 0
                                ? `${((totalPaid / totalGross) * 100).toFixed(1)}%`
                                : "0%"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg">
                    <ArrowDownRight className="h-5 w-5 text-amber-400" />
                    <div>
                        <p className="text-xs text-white/60">Avg. Deduction</p>
                        <p className="text-lg font-bold text-white">
                            {payments.length > 0
                                ? `${((totalDeductions / payments.length / 1000000).toFixed(2))}M`
                                : "0"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg ml-auto">
                    <div className="text-right">
                        <p className="text-xs text-white/60">Awaiting Certification</p>
                        <p className="text-lg font-bold text-rsg-gold">
                            {formatCurrency(totalPending)}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
