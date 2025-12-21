'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building2, Waves, FileText, Globe, Users } from 'lucide-react';
import { Footer } from '@/components/layout/footer';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-orange-500" />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              FIRST<span className="text-orange-500">FIX</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all">
                Access Register
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="relative overflow-hidden pt-20 pb-32">
          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-50 pointer-events-none">
            <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl mix-blend-multiply" />
            <div className="absolute top-40 left-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl mix-blend-multiply" />
          </div>

          <div className="container relative mx-auto px-4 text-center">
            {/* Logos */}
            <div className="mb-12 flex flex-col items-center justify-center gap-8 md:flex-row md:gap-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-opacity">
                <Waves className="h-10 w-10 text-blue-600" />
                <span className="text-3xl font-serif font-bold text-slate-800 tracking-wide">
                  Red Sea
                </span>
              </div>
              <div className="hidden h-12 w-px bg-slate-300 md:block" />
              <div className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-opacity">
                <Building2 className="h-10 w-10 text-orange-500" />
                <span className="text-3xl font-sans font-black tracking-tighter text-slate-900">
                  FIRST<span className="text-orange-500">FIX</span>
                </span>
              </div>
            </div>

            {/* Main Title */}
            <div className="mb-8 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 mb-4">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                HW2 Project Portal
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="block text-slate-900">Commercial Register</span>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Variation Order Log
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-slate-600 md:text-xl">
                Centralized management system for tracking, assessing, and approving variations for the HW2 Red Sea Project.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-8 text-base bg-slate-900 hover:bg-slate-800 text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300">
                  Open Register
                  <FileText className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Features/Stats Grid */}
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto text-left">
              {[
                {
                  icon: Globe,
                  title: "Project Scope",
                  desc: "HW2 Hotel 02 First Fix Works"
                },
                {
                  icon: Users,
                  title: "Commercial Team",
                  desc: "Restricted Access - Internal Use Only"
                },
                {
                  icon: FileText,
                  title: "Documentation",
                  desc: "Complete VO Lifecycle Tracking"
                }
              ].map((feature, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-blue-50 p-3 group-hover:bg-blue-100 transition-colors">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
