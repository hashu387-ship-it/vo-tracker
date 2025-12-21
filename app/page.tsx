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
          <div className="flex items-center gap-4">
            {/* Navbar Logos */}
            <img src="/rsg-logo.png" alt="RSG" className="h-10 w-auto brightness-0 invert filter invert-[0.2] sepia-[0.3] saturate-[0.5] hue-rotate-[180deg]" />
            {/* Note: RSG logo is white, we need to invert it for white navbar or use a dark version. 
                 Since I only have the white one (brightness-0 invert makes it black if it was white, wait. 
                 The downloaded RSG logo is likely white text? 
                 Let's check the prev usage: className="h-16 w-auto brightness-0 invert" 
                 If it was white, invert makes it black. If it was colored, brightness-0 makes it black.
                 Actually, let's just use the image directly and adjust classes. 
                 The FirstFix logo is likely colored. 
             */}
            <div className="h-6 w-px bg-gray-200" />
            <img src="/firstfix-v2.png" alt="FirstFix" className="h-8 w-auto" />
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
        <div className="relative pt-24 pb-40 overflow-hidden min-h-screen flex flex-col justify-center">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/rsg-hero.jpg"
              alt="Red Sea Project"
              className="h-full w-full object-cover object-center scale-105 animate-[pulse-subtle_10s_ease-in-out_infinite]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-rsg-navy via-rsg-navy/80 to-rsg-navy/70 mix-blend-multiply" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 mixed-blend-overlay" />
          </div>

          {/* Abstract Animated Elements */}
          <div className="absolute inset-0 opacity-30 pointer-events-none z-0">
            <div className="absolute -top-24 -right-24 w-[800px] h-[800px] rounded-full border-[1px] border-white/10 blur-3xl animate-[spin_60s_linear_infinite]" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rsg-gold/20 rounded-full blur-[100px] mix-blend-overlay" />
          </div>

          <div className="container relative mx-auto px-6 text-center z-10">
            {/* Logos */}
            <div className="mb-16 flex flex-col items-center justify-center gap-8 md:flex-row md:gap-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center justify-center opacity-90 hover:opacity-100 transition-all hover:scale-105 duration-500 bg-white/5 py-4 px-8 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
                <img src="/rsg-logo.png" alt="Red Sea Global" className="h-16 w-auto brightness-0 invert" />
              </div>
              <div className="hidden h-16 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent md:block" />
              <div className="flex items-center justify-center opacity-90 hover:opacity-100 transition-all hover:scale-105 duration-500 bg-white/5 py-4 px-8 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
                <img src="/firstfix-v2.png" alt="FirstFix" className="h-12 w-auto brightness-0 invert" />
              </div>
            </div>

            {/* Main Title */}
            <div className="mb-12 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              <h1 className="text-4xl font-light tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="block font-medium mb-2">HW2 Commercial Register</span>
                <span className="text-rsg-gold font-serif italic">Variation Order LOG</span>
              </h1>
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
    </div>
  );
}
