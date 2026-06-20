"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  FileText,
  CreditCard,
  Sun,
  Moon,
  Menu,
  X,
  Plus,
  ChevronDown,
  Sparkles,
  Eye,
  Lock,
  LogIn,
  Unlock,
  Gauge,
  Search,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/components/providers/workspace-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserButton, useUser, SignInButton } from "@clerk/nextjs";
import { useGuestMode } from "@/components/providers/guest-mode-provider";

const navigation = [
  { name: "Command Center", href: "/intelligence", icon: Gauge },
  { name: "Variation Orders", href: "/vos", icon: FileText },
  { name: "Payments", href: "/payments", icon: CreditCard },
];

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isLoaded, isSignedIn } = useUser();
  const { isGuest, isEditAuthorized, requestEditAccess } = useGuestMode();
  const { togglePalette, toggleAssistant } = useWorkspace();

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
            <Link href="/intelligence" className="flex items-center gap-3 group">
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

            {/* Desktop Navigation — pill segmented control */}
            <nav className="hidden md:flex items-center gap-1 rounded-full border border-slate-200/70 bg-slate-100/70 p-1 dark:border-zinc-800 dark:bg-zinc-900/60">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link key={item.name} href={item.href}>
                    <motion.div
                      whileTap={{ scale: 0.97 }}
                      className={`relative flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${
                        isActive
                          ? "text-rsg-navy dark:text-rsg-gold"
                          : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 -z-10 rounded-full bg-white shadow-sm dark:bg-zinc-800"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <item.icon className="h-4 w-4" />
                      <span className="hidden lg:inline">{item.name}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Command palette trigger */}
            <button
              onClick={togglePalette}
              className="hidden md:flex items-center gap-2 h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 hover:border-rsg-navy/40 dark:hover:border-rsg-gold/40 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="text-xs">Search</span>
              <kbd className="text-[10px] rounded border border-slate-300 dark:border-zinc-600 px-1">⌘K</kbd>
            </button>

            {/* AI assistant trigger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleAssistant}
              title="Ask the AI assistant (⌘J)"
              className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-rsg-navy dark:text-rsg-gold"
            >
              <Bot className="h-4 w-4" />
            </Button>

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

            {/* Guest Mode Badge */}
            {isGuest && (
              <div className="hidden md:flex items-center gap-2">
                {isEditAuthorized ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Unlock className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-500">Edit Access</span>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => requestEditAccess()}
                    className="h-8 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rsg-gold/10 hover:text-rsg-gold border border-slate-200 dark:border-slate-700"
                  >
                    <Lock className="w-3 h-3 mr-1.5" />
                    <span className="text-xs font-medium">Unlock Edit</span>
                  </Button>
                )}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20">
                  <Eye className="w-3 h-3 text-sky-500" />
                  <span className="text-xs font-medium text-sky-500">Guest</span>
                </div>
              </div>
            )}

            {/* User Button or Sign In */}
            <div className="hidden sm:block">
              {isSignedIn ? (
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "h-9 w-9 rounded-xl border-2 border-slate-200 dark:border-zinc-700 hover:border-rsg-gold/50 transition-colors",
                    },
                  }}
                />
              ) : (
                <SignInButton mode="modal">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 rounded-xl border-slate-200 dark:border-zinc-700 hover:border-rsg-gold/50 hover:bg-rsg-gold/5"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </SignInButton>
              )}
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
                  {isSignedIn ? (
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
                  ) : (
                    <div className="space-y-3">
                      {/* Guest Mode Indicator */}
                      <div className="flex items-center justify-between px-2 py-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-sky-500/10 rounded-lg">
                            <Eye className="w-5 h-5 text-sky-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              Guest Mode
                            </p>
                            <p className="text-xs text-slate-500 dark:text-zinc-500">
                              {isEditAuthorized ? "Edit access granted" : "View only"}
                            </p>
                          </div>
                        </div>
                        {isEditAuthorized && (
                          <div className="px-2 py-1 rounded-lg bg-emerald-500/10">
                            <Unlock className="w-4 h-4 text-emerald-500" />
                          </div>
                        )}
                      </div>

                      {/* Edit Access Button */}
                      {!isEditAuthorized && (
                        <Button
                          onClick={() => {
                            requestEditAccess();
                            setMobileMenuOpen(false);
                          }}
                          variant="outline"
                          className="w-full justify-center gap-2 h-11 rounded-xl border-slate-200 dark:border-zinc-700"
                        >
                          <Lock className="w-4 h-4" />
                          Unlock Edit Access
                        </Button>
                      )}

                      {/* Sign In Button */}
                      <SignInButton mode="modal">
                        <Button
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-rsg-navy to-rsg-blue text-white"
                        >
                          <LogIn className="w-4 h-4" />
                          Sign In
                        </Button>
                      </SignInButton>
                    </div>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
