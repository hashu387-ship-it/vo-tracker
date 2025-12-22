import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col relative overflow-hidden text-white font-sans">

      {/* Background Image with Overlay (Same as Cover Page) */}
      <div className="absolute inset-0 z-0">
        <img
          src="/rsg-new-hero.png"
          alt="Red Sea Project"
          className="h-full w-full object-cover object-center scale-105 animate-[pulse-subtle_15s_ease-in-out_infinite]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rsg-navy via-rsg-navy/70 to-rsg-navy/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 mixed-blend-overlay" />
      </div>

      {/* Abstract Animated Elements */}
      <div className="absolute inset-0 opacity-30 pointer-events-none z-0">
        <div className="absolute -top-24 -right-24 w-[300px] h-[300px] md:w-[800px] md:h-[800px] rounded-full border-[1px] border-white/10 blur-3xl animate-[spin_60s_linear_infinite]" />
      </div>

      {/* Nav / Back Button */}
      <nav className="absolute top-0 left-0 w-full p-6 z-50">
        <Link href="/">
          <Button variant="ghost" className="text-white hover:text-rsg-gold hover:bg-white/10 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </nav>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">

        {/* Logos (Same as Cover Page) */}
        <div className="mb-8 flex flex-col items-center justify-center gap-6 md:flex-row md:gap-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center justify-center bg-white/5 py-3 px-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
            <img src="/rsg-logo.png" alt="Red Sea Global" className="h-10 md:h-12 w-auto brightness-0 invert" />
          </div>
          <div className="hidden h-12 w-px bg-white/30 md:block" />
          <div className="flex items-center justify-center bg-white/5 py-3 px-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
            <img src="/firstfix-v2.png" alt="FirstFix" className="h-9 md:h-11 w-auto brightness-0 invert" />
          </div>
        </div>

        {/* Title */}
        <div className="mb-10 text-center space-y-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <h1 className="text-2xl font-light tracking-tight text-white sm:text-3xl">
            Sign in to <span className="text-rsg-gold font-serif italic">VO Registry</span>
          </h1>
          <p className="text-white/60 font-light text-sm">Restricted Access - Internal Commercial Team Only</p>
        </div>

        {/* Sign In Component */}
        <div className="animate-in fade-in zoom-in-95 duration-700 delay-200 w-full max-w-[400px]">
          <SignIn
            appearance={{
              layout: { socialButtonsPlacement: "bottom" },
              elements: {
                rootBox: "w-full",
                card: "bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 md:p-8",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                formButtonPrimary: "bg-rsg-gold hover:bg-[#B08D55] text-white transition-all h-10 shadow-lg font-bold tracking-wide uppercase text-xs w-full",
                formFieldInput: "bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:border-rsg-gold focus:ring-rsg-gold/50 rounded-lg",
                formFieldLabel: "text-white/70 text-xs uppercase tracking-wider font-semibold",
                footerActionLink: "text-rsg-gold hover:text-white transition-colors",
                socialButtonsBlockButton: "bg-white text-rsg-navy hover:bg-white/90 border-none transition-colors",
                dividerLine: "bg-white/10",
                dividerText: "text-white/40",
                formFieldAction: "text-rsg-gold hover:text-white"
              }
            }}
          />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-[10px] text-white/30 tracking-widest uppercase">
            © 2025 VO Tracker | by Mohamed Roomy Mohamed Hassan
          </p>
        </div>
      </div>
    </div>
  );
}
