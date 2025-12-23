"use client";

import { useMemo, useEffect, useState } from "react";
import { PaymentApplication } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";
import { motion, useSpring, useTransform } from "framer-motion";
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
    DollarSign,
    Receipt,
    Percent,
    Shield,
    Target,
    Sparkles,
} from "lucide-react";

interface PaymentHeroStatsProps {
    payments: PaymentApplication[];
}

// Animated Counter Component
function AnimatedValue({ value, prefix = "", suffix = "", decimals = 0 }: {
    value: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
}) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const duration = 2000;
        const startTime = Date.now();
        const startValue = displayValue;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = startValue + (value - startValue) * easeOut;
            setDisplayValue(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value]);

    const formatValue = (val: number) => {
        if (val >= 1000000) {
            return `${(val / 1000000).toFixed(decimals)}M`;
        } else if (val >= 1000) {
            return `${(val / 1000).toFixed(decimals)}K`;
        }
        return val.toFixed(decimals);
    };

    return (
        <span className="tabular-nums">
            {prefix}{formatValue(displayValue)}{suffix}
        </span>
    );
}

// Animated Ring Progress
function AnimatedRing({ progress, color, size = 80, strokeWidth = 6 }: {
    progress: number;
    color: string;
    size?: number;
    strokeWidth?: number;
}) {
    const [animatedProgress, setAnimatedProgress] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedProgress(progress), 100);
        return () => clearTimeout(timer);
    }, [progress]);

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    className="text-zinc-800"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className="transition-all duration-1000 ease-out"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke={color}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-sm">{progress.toFixed(0)}%</span>
            </div>
        </div>
    );
}

export function PaymentHeroStats({ payments }: PaymentHeroStatsProps) {
    // Constants
    const REVISED_CONTRACT_VALUE = 232612538.97;
    const ADVANCE_PAYMENT_PAID = 65250466.83;
    const RETENTION_CAP_VALUE = 11630626.95;

    // Calculations
    const stats = useMemo(() => {
        const workPayments = payments.filter(p => !p.paymentNo.startsWith('AP'));
        const totalWorkDone = workPayments.reduce((sum, p) => sum + (p.grossAmount || 0), 0);
        const totalAdvRecovery = payments.reduce((sum, p) => sum + Math.abs(p.advancePaymentRecovery || 0), 0);
        const totalNetPayment = payments.reduce((sum, p) => sum + (p.netPayment || 0), 0);
        const totalVAT = payments.reduce((sum, p) => sum + (p.vat || 0), 0);
        const retentionDeducted = payments.filter(p => (p.retention || 0) < 0)
            .reduce((sum, p) => sum + Math.abs(p.retention || 0), 0);

        const paidPayments = payments.filter(p => p.paymentStatus === 'Paid').length;
        const certifiedPayments = payments.filter(p => p.paymentStatus === 'Certified').length;

        return {
            totalWorkDone,
            totalAdvRecovery,
            totalNetPayment,
            totalVAT,
            retentionDeducted,
            advBalance: ADVANCE_PAYMENT_PAID - totalAdvRecovery,
            retentionBalance: RETENTION_CAP_VALUE - retentionDeducted,
            workDonePercentage: (totalWorkDone / REVISED_CONTRACT_VALUE) * 100,
            advRecoveryPercentage: (totalAdvRecovery / ADVANCE_PAYMENT_PAID) * 100,
            retentionPercentage: (retentionDeducted / RETENTION_CAP_VALUE) * 100,
            paidPayments,
            certifiedPayments,
            totalPayments: payments.length,
        };
    }, [payments]);

    const kpiCards = [
        {
            title: "Total Work Done",
            value: stats.totalWorkDone,
            percentage: stats.workDonePercentage,
            icon: Activity,
            color: "#6366f1",
            gradient: "from-indigo-500/20 via-indigo-500/10 to-transparent",
            borderColor: "border-indigo-500/20",
            trend: "up",
            subtitle: `${stats.workDonePercentage.toFixed(1)}% of contract`,
        },
        {
            title: "Net Payments",
            value: stats.totalNetPayment,
            percentage: (stats.totalNetPayment / stats.totalWorkDone) * 100 || 0,
            icon: DollarSign,
            color: "#10b981",
            gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
            borderColor: "border-emerald-500/20",
            trend: "up",
            subtitle: `${stats.paidPayments} paid of ${stats.totalPayments}`,
        },
        {
            title: "Advance Recovered",
            value: stats.totalAdvRecovery,
            percentage: stats.advRecoveryPercentage,
            icon: Shield,
            color: "#f59e0b",
            gradient: "from-amber-500/20 via-amber-500/10 to-transparent",
            borderColor: "border-amber-500/20",
            trend: stats.advRecoveryPercentage > 80 ? "up" : "neutral",
            subtitle: `Balance: SAR ${(stats.advBalance / 1000000).toFixed(1)}M`,
        },
        {
            title: "Retention Held",
            value: stats.retentionDeducted,
            percentage: stats.retentionPercentage,
            icon: Wallet,
            color: "#ec4899",
            gradient: "from-pink-500/20 via-pink-500/10 to-transparent",
            borderColor: "border-pink-500/20",
            trend: "neutral",
            subtitle: `Cap: SAR ${(RETENTION_CAP_VALUE / 1000000).toFixed(1)}M`,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Main Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-800/50 p-6 md:p-8"
            >
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-emerald-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
                    <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-pink-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
                </div>

                {/* Header */}
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                            <Sparkles className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Payment Overview</h2>
                            <p className="text-sm text-zinc-500">Real-time financial analytics</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-sm text-zinc-400">Live</span>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                            <span className="text-sm font-mono text-zinc-300">{payments.length} Applications</span>
                        </div>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {kpiCards.map((card, index) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -4 }}
                            className={`relative group overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} backdrop-blur-xl border ${card.borderColor} p-5 cursor-pointer transition-all duration-300`}
                        >
                            {/* Glow Effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ background: `radial-gradient(circle at 50% 0%, ${card.color}20, transparent 60%)` }} />

                            {/* Icon & Title */}
                            <div className="relative flex items-center justify-between mb-4">
                                <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${card.color}15` }}>
                                    <card.icon className="h-5 w-5" style={{ color: card.color }} />
                                </div>
                                <AnimatedRing progress={Math.min(card.percentage, 100)} color={card.color} size={48} strokeWidth={4} />
                            </div>

                            {/* Value */}
                            <div className="relative space-y-1">
                                <p className="text-xs uppercase tracking-wider text-zinc-500 font-medium">{card.title}</p>
                                <p className="text-xl md:text-2xl font-bold text-white tracking-tight">
                                    <AnimatedValue value={card.value} prefix="SAR " decimals={1} />
                                </p>
                                <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                                    {card.trend === "up" && <ArrowUpRight className="h-3 w-3 text-emerald-400" />}
                                    {card.trend === "down" && <ArrowDownRight className="h-3 w-3 text-red-400" />}
                                    {card.subtitle}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Stats Bar */}
                <div className="relative mt-8 pt-6 border-t border-zinc-800/50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500">Paid</p>
                                <p className="text-lg font-bold text-white">{stats.paidPayments}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <FileText className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500">Certified</p>
                                <p className="text-lg font-bold text-white">{stats.certifiedPayments}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <Receipt className="h-4 w-4 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500">Total VAT</p>
                                <p className="text-lg font-bold text-white">SAR {(stats.totalVAT / 1000000).toFixed(1)}M</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20">
                                <Target className="h-4 w-4 text-pink-400" />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500">Contract Value</p>
                                <p className="text-lg font-bold text-white">SAR {(REVISED_CONTRACT_VALUE / 1000000).toFixed(0)}M</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
