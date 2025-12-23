"use client";

import { useMemo } from "react";
import { PaymentApplication } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    LineChart,
    Line,
    Legend,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ComposedChart,
} from "recharts";
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Wallet,
    FileText,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    Target,
    BarChart3,
    PieChartIcon,
    LineChartIcon,
} from "lucide-react";

interface PaymentAnalyticsProps {
    payments: PaymentApplication[];
}

const COLORS = {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6",
    pink: "#ec4899",
    cyan: "#06b6d4",
    gradient: {
        primary: ["#6366f1", "#8b5cf6"],
        success: ["#10b981", "#34d399"],
        warning: ["#f59e0b", "#fbbf24"],
        danger: ["#ef4444", "#f87171"],
    }
};

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function PaymentAnalytics({ payments }: PaymentAnalyticsProps) {
    // Constants
    const ORIGINAL_CONTRACT_VALUE = 217501556.12;
    const REVISED_CONTRACT_VALUE = 232612538.97;
    const ADVANCE_PAYMENT_PAID = 65250466.83;
    const RETENTION_CAP_VALUE = 11630626.95;

    // Calculations
    const stats = useMemo(() => {
        const workPayments = payments.filter(p => !p.paymentNo.startsWith('AP'));
        const totalWorkDone = workPayments.reduce((sum, p) => sum + (p.grossAmount || 0), 0);
        const totalAdvRecovery = payments.reduce((sum, p) => sum + Math.abs(p.advancePaymentRecovery || 0), 0);
        const totalNetPayment = payments.reduce((sum, p) => sum + (p.netPayment || 0), 0);
        const retentionDeducted = payments.filter(p => (p.retention || 0) < 0)
            .reduce((sum, p) => sum + Math.abs(p.retention || 0), 0);

        return {
            totalWorkDone,
            totalAdvRecovery,
            totalNetPayment,
            retentionDeducted,
            advBalance: ADVANCE_PAYMENT_PAID - totalAdvRecovery,
            retentionBalance: RETENTION_CAP_VALUE - retentionDeducted,
            workDonePercentage: (totalWorkDone / REVISED_CONTRACT_VALUE) * 100,
            advRecoveryPercentage: (totalAdvRecovery / ADVANCE_PAYMENT_PAID) * 100,
            retentionPercentage: (retentionDeducted / RETENTION_CAP_VALUE) * 100,
        };
    }, [payments]);

    // Chart Data
    const trendData = useMemo(() => {
        return [...payments]
            .filter(p => !p.paymentNo.startsWith('AP'))
            .sort((a, b) => a.id - b.id)
            .map((p, index) => ({
                name: p.paymentNo.replace('IPA ', ''),
                gross: p.grossAmount || 0,
                net: p.netPayment || 0,
                retention: Math.abs(p.retention || 0),
                advRecovery: Math.abs(p.advancePaymentRecovery || 0),
                cumulative: 0,
            }))
            .map((item, index, arr) => ({
                ...item,
                cumulative: arr.slice(0, index + 1).reduce((sum, i) => sum + i.gross, 0),
            }));
    }, [payments]);

    const statusDistribution = useMemo(() => {
        const statusCounts: { [key: string]: number } = {};
        payments.forEach(p => {
            statusCounts[p.paymentStatus] = (statusCounts[p.paymentStatus] || 0) + 1;
        });
        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    }, [payments]);

    const financialBreakdown = useMemo(() => {
        const totalGross = payments.reduce((sum, p) => sum + (p.grossAmount || 0), 0);
        const totalNet = payments.reduce((sum, p) => sum + (p.netPayment || 0), 0);
        const totalVat = payments.reduce((sum, p) => sum + (p.vat || 0), 0);
        const totalRetention = payments.reduce((sum, p) => sum + Math.abs(p.retention || 0), 0);
        const totalAdvRec = payments.reduce((sum, p) => sum + Math.abs(p.advancePaymentRecovery || 0), 0);

        return [
            { name: "Net Payment", value: totalNet, color: COLORS.success },
            { name: "Retention", value: totalRetention, color: COLORS.warning },
            { name: "Adv Recovery", value: totalAdvRec, color: COLORS.danger },
            { name: "VAT", value: totalVat, color: COLORS.info },
        ];
    }, [payments]);

    const radarData = useMemo(() => [
        { subject: 'Work Done', A: stats.workDonePercentage, fullMark: 100 },
        { subject: 'Adv Recovery', A: stats.advRecoveryPercentage, fullMark: 100 },
        { subject: 'Retention', A: stats.retentionPercentage, fullMark: 100 },
        { subject: 'Net Paid', A: (stats.totalNetPayment / REVISED_CONTRACT_VALUE) * 100, fullMark: 100 },
        { subject: 'Payments', A: (payments.length / 30) * 100, fullMark: 100 },
    ], [stats, payments.length]);

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-xl p-4 shadow-2xl">
                    <p className="text-zinc-400 text-xs font-medium mb-2">IPA {label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-zinc-400">{entry.name}:</span>
                            <span className="text-white font-mono font-medium">{formatCurrency(entry.value)}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cumulative Payment Trend - Area Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20">
                                <TrendingUp className="h-5 w-5 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Cumulative Progress</h3>
                                <p className="text-xs text-zinc-500">Total work value over time</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-xs font-medium text-emerald-400">{stats.workDonePercentage.toFixed(1)}%</span>
                        </div>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="cumulative" name="Cumulative" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorCumulative)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Gross vs Net Comparison - Composed Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20">
                                <BarChart3 className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Payment Analysis</h3>
                                <p className="text-xs text-zinc-500">Gross vs Net per application</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                                    </linearGradient>
                                    <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: 20 }} iconType="circle" iconSize={8} />
                                <Bar dataKey="gross" name="Gross" fill="url(#grossGradient)" radius={[4, 4, 0, 0]} barSize={20} />
                                <Line type="monotone" dataKey="net" name="Net" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: '#10b981' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Payment Status Distribution - Donut Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 shadow-2xl"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/20">
                            <PieChartIcon className="h-5 w-5 text-pink-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Status Distribution</h3>
                            <p className="text-xs text-zinc-500">Payment status breakdown</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="h-[220px] flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={4}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {statusDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-xl px-4 py-2 shadow-2xl">
                                                        <p className="text-white font-medium">{payload[0].name}</p>
                                                        <p className="text-zinc-400 text-sm">{payload[0].value} payments</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-2 min-w-[140px]">
                            {statusDistribution.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                                    <span className="text-xs text-zinc-400 flex-1">{entry.name}</span>
                                    <span className="text-xs font-mono text-white">{entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Financial Breakdown - Stacked Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 shadow-2xl"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20">
                            <Wallet className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Financial Breakdown</h3>
                            <p className="text-xs text-zinc-500">Deductions and distributions</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {financialBreakdown.map((item, index) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                                className="space-y-2"
                            >
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-400">{item.name}</span>
                                    <span className="font-mono font-medium text-white">{formatCurrency(item.value)}</span>
                                </div>
                                <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.value / (financialBreakdown[0].value * 1.5)) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Performance Radar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 shadow-2xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
                            <Target className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Performance Overview</h3>
                            <p className="text-xs text-zinc-500">Key metrics at a glance</p>
                        </div>
                    </div>
                </div>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="#27272a" />
                            <PolarAngleAxis dataKey="subject" stroke="#71717a" fontSize={12} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#27272a" fontSize={10} />
                            <Radar
                                name="Progress"
                                dataKey="A"
                                stroke="#8b5cf6"
                                fill="#8b5cf6"
                                fillOpacity={0.3}
                                strokeWidth={2}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-xl px-4 py-2 shadow-2xl">
                                                <p className="text-white font-medium">{payload[0].payload.subject}</p>
                                                <p className="text-violet-400 font-mono">{Number(payload[0].value).toFixed(1)}%</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
}
