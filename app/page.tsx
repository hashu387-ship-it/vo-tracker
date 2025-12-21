'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building2, Waves, FileText, Globe, Users } from 'lucide-react';
import { Footer } from '@/components/layout/footer';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-rsg-gold" />
            <span className="text-xl font-bold tracking-tight text-rsg-navy">
              FIRST<span className="text-rsg-gold">FIX</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-rsg-navy hover:text-rsg-blue hover:bg-rsg-light font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-rsg-gold hover:bg-[#B08D55] text-white shadow-md transition-all rounded-none px-6">
                Access Register
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="relative pt-24 pb-40 bg-rsg-navy overflow-hidden">
          {/* Abstract Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-[800px] h-[800px] rounded-full border-[1px] border-white/10 blur-3xl animate-[spin_60s_linear_infinite]" />
            <div className="absolute bottom-0 left-0 w-full h-[400px] bg-gradient-to-t from-rsg-navy via-rsg-navy/50 to-transparent" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rsg-gold/20 rounded-full blur-[100px] mix-blend-overlay" />
          </div>

          <div className="container relative mx-auto px-6 text-center z-10">
            {/* Logos */}
            <div className="mb-16 flex flex-col items-center justify-center gap-8 md:flex-row md:gap-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center gap-4 opacity-90 hover:opacity-100 transition-all hover:scale-105 duration-500 bg-white/5 py-4 px-8 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
                <Waves className="h-12 w-12 text-white" />
                <span className="text-4xl font-serif font-bold text-white tracking-wide">
                  Red Sea
                </span>
              </div>
              <div className="hidden h-16 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent md:block" />
              <div className="flex items-center gap-4 opacity-90 hover:opacity-100 transition-all hover:scale-105 duration-500 bg-white/5 py-4 px-8 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
                <Building2 className="h-12 w-12 text-rsg-gold" />
                <span className="text-4xl font-sans font-black tracking-tighter text-white">
                  FIRST<span className="text-rsg-gold">FIX</span>
                </span>
              </div>
            </div>

            {/* Main Title */}
            <div className="mb-12 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              <div className="inline-flex items-center border border-rsg-gold/30 bg-rsg-gold/10 px-4 py-1.5 text-sm font-medium text-rsg-gold mb-6 tracking-widest uppercase">
                <span className="flex h-1.5 w-1.5 rounded-full bg-rsg-gold mr-3 animate-pulse"></span>
                Official Project Portal
              </div>
              <h1 className="text-4xl font-light tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="block font-medium mb-2">HW2 Commercial Register</span>
                <span className="text-rsg-gold font-serif italic">Variation Order Log</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-gray-300 md:text-xl font-light leading-relaxed">
                Secure, centralized management system for tracking variations, assessments, and approvals for the Red Sea Project.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-10 text-lg bg-white text-rsg-navy hover:bg-gray-100 rounded-none font-semibold tracking-wide transition-all duration-300 min-w-[200px]">
                  OPEN REGISTER
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features/Stats Grid overlapping headers */}
        <div className="container mx-auto px-6 -mt-20 relative z-10">
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto text-left">
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
              <div key={i} className="group relative overflow-hidden bg-white p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border-t-4 border-rsg-gold">
                <div className="mb-6 inline-flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-rsg-navy" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-rsg-navy">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="h-24"></div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
