"use client";

import { motion } from "framer-motion";
import { AlertTriangle, LogIn, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";

interface DemoDisclaimerProps {
  type?: "banner" | "card";
}

export function DemoDisclaimer({ type = "banner" }: DemoDisclaimerProps) {
  if (type === "card") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 dark:from-amber-500/20 dark:via-orange-500/20 dark:to-amber-500/20 border border-amber-500/30 rounded-2xl p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <Eye className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Demo Mode - Sample Data
              </h3>
              <p className="text-sm text-amber-700/80 dark:text-amber-400/80 mt-1">
                You are viewing demonstration data. Sign in with authorized credentials to access real project data.
              </p>
            </div>
          </div>
          <div className="md:ml-auto">
            <SignInButton mode="modal">
              <Button className="bg-gradient-to-r from-rsg-navy to-rsg-blue hover:from-rsg-blue hover:to-rsg-navy text-white shadow-lg gap-2">
                <LogIn className="h-4 w-4" />
                Sign In for Real Data
              </Button>
            </SignInButton>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white py-2.5 px-4 shadow-lg"
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium">
            Demo Mode: Viewing sample data only
          </span>
        </div>
        <div className="hidden sm:block w-px h-4 bg-white/30" />
        <SignInButton mode="modal">
          <button className="text-sm font-semibold underline underline-offset-2 hover:no-underline flex items-center gap-1.5 transition-all">
            <LogIn className="h-3.5 w-3.5" />
            Sign in to view real data
          </button>
        </SignInButton>
      </div>
    </motion.div>
  );
}
