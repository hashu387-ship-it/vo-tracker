"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { useGuestMode } from "@/components/providers/guest-mode-provider";

export function PasswordDialog() {
    const { showPasswordDialog, verifyPassword, closePasswordDialog } = useGuestMode();
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = verifyPassword(password);
        if (isValid) {
            setSuccess(true);
            setTimeout(() => {
                setPassword("");
                setError(false);
                setSuccess(false);
            }, 500);
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    const handleClose = () => {
        setPassword("");
        setError(false);
        setSuccess(false);
        closePasswordDialog();
    };

    return (
        <AnimatePresence>
            {showPasswordDialog && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rsg-gold/10 rounded-lg">
                                    <Lock className="h-5 w-5 text-rsg-gold" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        Edit Authorization
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Enter password to edit
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError(false);
                                    }}
                                    placeholder="Enter edit password"
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        error
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                            : success
                                            ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                                            : "border-slate-200 dark:border-slate-700 focus:border-rsg-gold focus:ring-rsg-gold/20"
                                    } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all`}
                                    autoFocus
                                />
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2"
                                        >
                                            <AlertCircle className="h-5 w-5 text-red-500" />
                                        </motion.div>
                                    )}
                                    {success && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2"
                                        >
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-sm text-red-500 flex items-center gap-1.5"
                                    >
                                        <AlertCircle className="h-4 w-4" />
                                        Invalid password. Please try again.
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                className="w-full py-3 bg-rsg-gold hover:bg-rsg-gold/90 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-rsg-gold/20"
                            >
                                Unlock Edit Access
                            </button>
                        </form>

                        <p className="mt-4 text-xs text-slate-400 text-center">
                            Guest view mode • Password required for editing
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
