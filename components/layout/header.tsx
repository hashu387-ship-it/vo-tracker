"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Sun,
  Moon,
  Menu,
  X,
  Plus,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserButton, useUser } from "@clerk/nextjs";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Variation Orders", href: "/vos", icon: FileText },
  { name: "Payments", href: "/payments", icon: CreditCard },
];

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAdmin = isLoaded && user?.publicMetadata?.role === "admin";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-zinc-800/50 shadow-sm"
          : "bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border-b border-slate-200/30 dark:border-zinc-800/30"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-rsg-navy to-rsg-blue rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative p-2 rounded-xl bg-gradient-to-br from-rsg-navy to-rsg-blue shadow-lg shadow-rsg-navy/20">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  VO Tracker
                </span>
                <span className="hidden lg:inline text-xs text-slate-500 dark:text-zinc-500 ml-2">
                  | HW2 Commercial
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`relative px-4 h-9 gap-2 rounded-xl ${
                        isActive
                          ? "text-rsg-navy dark:text-rsg-gold bg-rsg-navy/5 dark:bg-rsg-gold/10"
                          : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="hidden lg:inline">{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-rsg-navy to-rsg-blue dark:from-rsg-gold dark:to-amber-400 rounded-full"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Quick Add Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="hidden sm:flex bg-gradient-to-r from-rsg-navy to-rsg-blue hover:from-rsg-blue hover:to-rsg-navy text-white shadow-lg shadow-rsg-navy/20 rounded-xl gap-1.5 transition-all duration-300 hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden lg:inline">New</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/vos/new">
                  <DropdownMenuItem className="cursor-pointer">
                    <FileText className="h-4 w-4 mr-2" />
                    New Variation Order
                  </DropdownMenuItem>
                </Link>
                <Link href="/payments">
                  <DropdownMenuItem className="cursor-pointer">
                    <CreditCard className="h-4 w-4 mr-2" />
                    New Payment
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              {mounted ? (
                theme === "dark" ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-600" />
                )
              ) : (
                <div className="h-4 w-4 rounded-full bg-slate-200 dark:bg-zinc-700 animate-pulse" />
              )}
            </Button>

            {/* Admin Badge */}
            {isAdmin && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rsg-gold/10 border border-rsg-gold/20">
                <div className="w-1.5 h-1.5 rounded-full bg-rsg-gold animate-pulse" />
                <span className="text-xs font-medium text-rsg-gold">Admin</span>
              </div>
            )}

            {/* User Button */}
            <div className="hidden sm:block">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 rounded-xl border-2 border-slate-200 dark:border-zinc-700 hover:border-rsg-gold/50 transition-colors",
                  },
                }}
              />
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden w-9 h-9 rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-slate-200/50 dark:border-zinc-800/50"
            >
              <nav className="py-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                          isActive
                            ? "bg-rsg-navy/5 dark:bg-rsg-gold/10 text-rsg-navy dark:text-rsg-gold"
                            : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                        {isActive && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-rsg-navy dark:bg-rsg-gold" />
                        )}
                      </div>
                    </Link>
                  );
                })}

                {/* Mobile Quick Actions */}
                <div className="pt-4 border-t border-slate-200/50 dark:border-zinc-800/50 space-y-2 px-2">
                  <Link href="/vos/new" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-start gap-3 bg-gradient-to-r from-rsg-navy to-rsg-blue text-white rounded-xl h-12">
                      <Plus className="h-5 w-5" />
                      New Variation Order
                    </Button>
                  </Link>
                </div>

                {/* Mobile User Section */}
                <div className="pt-4 border-t border-slate-200/50 dark:border-zinc-800/50 px-2">
                  <div className="flex items-center gap-3 px-2 py-2">
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "h-10 w-10 rounded-xl",
                        },
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {user?.firstName || "User"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-zinc-500">
                        {isAdmin ? "Administrator" : "Viewer"}
                      </p>
                    </div>
                  </div>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
