'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  FileText,
  Globe,
  Users,
  ChevronDown,
  Sparkles,
  Shield,
  Zap,
  BarChart3,
  CreditCard,
  Plus,
  Play,
  Menu,
  X,
  Sun,
  Moon,
  ArrowUpRight,
  Check,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

// Animated counter component
function AnimatedCounter({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// Floating particles background
function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

// Animated gradient orbs
function GradientOrbs() {
  return (
    <>
      <motion.div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(197,160,101,0.4) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(0,45,86,0.6) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -30, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      />
    </>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: FileText,
      title: 'Variation Orders',
      desc: 'Complete VO lifecycle management with real-time tracking',
      color: 'from-indigo-500 to-purple-500',
      stats: '150+',
      label: 'VOs Tracked',
    },
    {
      icon: CreditCard,
      title: 'Payment Register',
      desc: 'Advanced payment tracking with automated calculations',
      color: 'from-emerald-500 to-teal-500',
      stats: 'SAR 232M',
      label: 'Contract Value',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      desc: 'Interactive charts and real-time financial insights',
      color: 'from-amber-500 to-orange-500',
      stats: '24/7',
      label: 'Live Updates',
    },
  ];

  const stats = [
    { value: 232, suffix: 'M', prefix: 'SAR ', label: 'Contract Value' },
    { value: 26, suffix: '+', prefix: '', label: 'Payment Applications' },
    { value: 150, suffix: '+', prefix: '', label: 'Variation Orders' },
    { value: 99, suffix: '%', prefix: '', label: 'Accuracy Rate' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#0a0a0f] dark:via-[#0f0f1a] dark:to-[#0a0a0f] transition-colors duration-500">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-4 mt-4">
          <div className="max-w-7xl mx-auto px-6 py-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 shadow-lg shadow-slate-200/20 dark:shadow-black/20">
            <div className="flex items-center justify-between">
              {/* Logo Section */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/rsg-logo.png"
                    alt="RSG"
                    className="h-8 w-auto dark:brightness-0 dark:invert"
                    style={{ filter: mounted && theme === 'light' ? 'invert(0.15) sepia(1) saturate(3) hue-rotate(180deg)' : undefined }}
                  />
                  <div className="h-6 w-px bg-slate-300 dark:bg-zinc-700" />
                  <img src="/firstfix-v2.png" alt="FirstFix" className="h-8 w-auto dark:brightness-0 dark:invert" />
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/vos">
                  <Button variant="ghost" className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white">
                    VO Register
                  </Button>
                </Link>
                <Link href="/payments">
                  <Button variant="ghost" className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white">
                    Payments
                  </Button>
                </Link>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-10 h-10 rounded-xl"
                >
                  {mounted && theme === 'dark' ? (
                    <Sun className="h-5 w-5 text-amber-400" />
                  ) : (
                    <Moon className="h-5 w-5 text-slate-600" />
                  )}
                </Button>

                <Link href="/sign-in" className="hidden md:block">
                  <Button variant="ghost" className="text-slate-600 dark:text-zinc-400">
                    Sign In
                  </Button>
                </Link>

                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-rsg-navy to-rsg-blue hover:from-rsg-blue hover:to-rsg-navy text-white shadow-lg shadow-rsg-navy/25 rounded-xl px-6 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <span className="hidden sm:inline">Open Register</span>
                    <span className="sm:hidden">Enter</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden pt-4 pb-2 border-t border-slate-200/50 dark:border-zinc-800/50 mt-4"
              >
                <div className="flex flex-col gap-2">
                  <Link href="/dashboard">
                    <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
                  </Link>
                  <Link href="/vos">
                    <Button variant="ghost" className="w-full justify-start">VO Register</Button>
                  </Link>
                  <Link href="/payments">
                    <Button variant="ghost" className="w-full justify-start">Payments</Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button variant="ghost" className="w-full justify-start">Sign In</Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-rsg-navy via-rsg-blue to-rsg-navy" />
          <img
            src="/rsg-new-hero.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-rsg-navy via-transparent to-rsg-navy/50" />
          <GradientOrbs />
          <ParticleField />

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        {/* Hero Content */}
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 container mx-auto px-4 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm mb-8"
          >
            <Sparkles className="h-4 w-4 text-rsg-gold" />
            <span>HW2 Commercial Register System</span>
          </motion.div>

          {/* Logos */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-10"
          >
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 group">
              <img src="/rsg-logo.png" alt="Red Sea Global" className="h-12 md:h-16 w-auto brightness-0 invert group-hover:scale-110 transition-transform" />
            </div>
            <div className="hidden md:block h-16 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 group">
              <img src="/firstfix-v2.png" alt="FirstFix" className="h-12 md:h-16 w-auto brightness-0 invert group-hover:scale-110 transition-transform" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="space-y-4 mb-10"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-tight">
              <span className="block text-white/80 text-2xl sm:text-3xl md:text-4xl font-medium mb-2">R06-HW2 SW Hotel 02</span>
              <span className="block bg-gradient-to-r from-rsg-gold via-amber-300 to-rsg-gold bg-clip-text text-transparent font-serif italic">
                Variation Order LOG
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
              Enterprise-grade construction management with real-time tracking, analytics, and seamless collaboration
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-8 text-lg bg-white text-rsg-navy hover:bg-white/90 rounded-xl font-semibold shadow-2xl shadow-black/20 transition-all duration-300 hover:scale-105 group">
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Open Dashboard
              </Button>
            </Link>
            <Link href="/vos/new">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 border-white/30 text-white hover:bg-white/10 rounded-xl font-medium backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/50">
                <Plus className="mr-2 h-5 w-5" />
                New Variation Order
              </Button>
            </Link>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div key={i} className="p-4 md:p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
                  <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </div>
                <div className="text-xs md:text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-white/40"
            >
              <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
              <ChevronDown className="h-5 w-5" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/50 via-white to-slate-100/50 dark:from-zinc-900/50 dark:via-zinc-950 dark:to-zinc-900/50" />

        <div className="relative container mx-auto px-4">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rsg-gold/10 text-rsg-gold text-sm font-medium mb-4">
              <Zap className="h-4 w-4" />
              Cutting-Edge Features
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto">
              Powerful tools designed for modern construction management
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative"
              >
                <div className="relative h-full p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-slate-300 dark:hover:border-zinc-700">
                  {/* Gradient Accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color}`} />

                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-500 dark:text-zinc-400 mb-6">{feature.desc}</p>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-zinc-800">
                    <div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">{feature.stats}</div>
                      <div className="text-xs text-slate-400 dark:text-zinc-500">{feature.label}</div>
                    </div>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-800 group-hover:bg-slate-200 dark:group-hover:bg-zinc-700 transition-colors"
                    >
                      <ArrowUpRight className="h-5 w-5 text-slate-600 dark:text-zinc-400" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rsg-navy via-rsg-blue to-rsg-navy" />
        <GradientOrbs />

        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-white/60 mb-10">
              Access the complete variation order management system and streamline your construction workflow
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-10 text-lg bg-white text-rsg-navy hover:bg-white/90 rounded-xl font-semibold shadow-2xl transition-all duration-300 hover:scale-105">
                  Access Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-2 border-white/30 text-white hover:bg-white/10 rounded-xl font-medium transition-all duration-300 hover:scale-105">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src="/rsg-logo.png" alt="RSG" className="h-6 w-auto dark:brightness-0 dark:invert opacity-50" />
              <div className="h-4 w-px bg-slate-300 dark:bg-zinc-700" />
              <img src="/firstfix-v2.png" alt="FirstFix" className="h-6 w-auto dark:brightness-0 dark:invert opacity-50" />
            </div>
            <p className="text-sm text-slate-500 dark:text-zinc-500">
              © 2025 VO Tracker | Developed by Mohamed Roomy
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
