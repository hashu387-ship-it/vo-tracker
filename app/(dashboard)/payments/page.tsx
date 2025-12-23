'use client';

import { useState, useEffect } from 'react';
import { PaymentApplication } from '@prisma/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
    CreditCard,
    TrendingUp,
    BarChart3,
    Sparkles,
    ChevronDown,
    RefreshCw,
} from 'lucide-react';
import { PaymentHeroStats } from '@/components/dashboard/payment-hero-stats';
import { PaymentAnalytics } from '@/components/dashboard/payment-analytics';
import { PaymentTablePremium } from '@/components/dashboard/payment-table-premium';
import { Button } from '@/components/ui/button';

// Tab types
type TabType = 'overview' | 'analytics' | 'register';

export default function PaymentsPage() {
    const [payments, setPayments] = useState<PaymentApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    const fetchPayments = async (showRefreshIndicator = false) => {
        if (showRefreshIndicator) setIsRefreshing(true);
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
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const tabs = [
        { id: 'overview' as TabType, label: 'Overview', icon: Sparkles, description: 'Key metrics & stats' },
        { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3, description: 'Charts & insights' },
        { id: 'register' as TabType, label: 'Register', icon: CreditCard, description: 'Payment records' },
    ];

    return (
        <div className="min-h-screen bg-[#09090b]">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/3 rounded-full blur-[150px]" />
            </div>

            <div className="relative container mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 pb-20">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20">
                                <CreditCard className="h-6 w-6 text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                                    Payment Register
                                </h1>
                                <p className="text-sm text-zinc-500">
                                    Manage In-tranche Payment Applications & Certifications
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Refresh Button */}
                    <Button
                        variant="outline"
                        onClick={() => fetchPayments(true)}
                        disabled={isRefreshing}
                        className="bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </motion.div>

                {/* Navigation Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-wrap gap-2 p-1.5 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl"
                >
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                                    isActive
                                        ? 'text-white'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/20 rounded-xl"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <tab.icon className="relative h-4 w-4" />
                                <span className="relative hidden sm:inline">{tab.label}</span>
                                <span className="relative sm:hidden">{tab.label.slice(0, 3)}</span>
                            </button>
                        );
                    })}
                </motion.div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Hero Stats */}
                            <PaymentHeroStats payments={payments} />

                            {/* Quick Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveTab('analytics')}
                                    className="p-6 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl text-left group hover:border-indigo-500/30 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                            <BarChart3 className="h-6 w-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                                                View Analytics
                                            </h3>
                                            <p className="text-sm text-zinc-500">Charts & detailed insights</p>
                                        </div>
                                    </div>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveTab('register')}
                                    className="p-6 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl text-left group hover:border-emerald-500/30 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                            <CreditCard className="h-6 w-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                                Payment Register
                                            </h3>
                                            <p className="text-sm text-zinc-500">Manage all payments</p>
                                        </div>
                                    </div>
                                </motion.button>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="p-6 bg-gradient-to-br from-zinc-900/50 via-zinc-900/30 to-indigo-900/20 backdrop-blur-xl border border-indigo-500/20 rounded-2xl"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20">
                                            <TrendingUp className="h-6 w-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">
                                                {payments.length} Applications
                                            </h3>
                                            <p className="text-sm text-zinc-500">
                                                {payments.filter(p => p.paymentStatus === 'Paid').length} Paid
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Recent Payments Preview */}
                            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold text-white">Recent Payments</h3>
                                        <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-400">
                                            Last 5
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setActiveTab('register')}
                                        className="text-zinc-400 hover:text-white"
                                    >
                                        View all
                                        <ChevronDown className="h-4 w-4 ml-1 rotate-[-90deg]" />
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {payments.slice(0, 5).map((payment, index) => (
                                        <motion.div
                                            key={payment.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-1.5 h-10 rounded-full ${
                                                    payment.paymentStatus === 'Paid' ? 'bg-emerald-400' :
                                                    payment.paymentStatus === 'Certified' ? 'bg-amber-400' :
                                                    'bg-zinc-500'
                                                }`} />
                                                <div>
                                                    <p className="font-mono font-bold text-white">{payment.paymentNo}</p>
                                                    <p className="text-xs text-zinc-500 truncate max-w-[200px]">{payment.description}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono font-semibold text-emerald-400">
                                                    SAR {(payment.netPayment / 1000000).toFixed(2)}M
                                                </p>
                                                <p className={`text-xs ${
                                                    payment.paymentStatus === 'Paid' ? 'text-emerald-500' :
                                                    payment.paymentStatus === 'Certified' ? 'text-amber-500' :
                                                    'text-zinc-500'
                                                }`}>
                                                    {payment.paymentStatus}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <PaymentAnalytics payments={payments} />
                    )}

                    {activeTab === 'register' && (
                        <PaymentTablePremium
                            payments={payments}
                            onRefresh={() => fetchPayments()}
                            isLoading={isLoading}
                        />
                    )}
                </motion.div>
            </div>
        </div>
    );
}
