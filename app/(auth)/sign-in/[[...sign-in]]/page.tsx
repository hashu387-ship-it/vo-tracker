import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex min-h-screen flex-row relative overflow-hidden bg-rsg-navy">
      {/* Left Side - Hero Image (Desktop) */}
      <div className="hidden lg:block w-3/5 h-full relative overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-rsg-navy/40 to-rsg-navy/80 mix-blend-multiply" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-rsg-navy via-transparent to-transparent opacity-80" />
        <img
          src="/rsg-new-hero.png"
          alt="Red Sea Project"
          className="h-full w-full object-cover object-center scale-105 transition-transform duration-[20s] hover:scale-110"
        />
        {/* Caption */}
        <div className="absolute bottom-12 left-12 z-20 text-white max-w-lg">
          <div className="h-1 w-20 bg-rsg-gold mb-6" />
          <h1 className="text-4xl font-serif font-bold leading-tight mb-4">
            Building for a <br />Sustainable Future.
          </h1>
          <p className="text-white/80 font-light tracking-wide text-lg">
            Variation Order Management System
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 relative bg-white sm:bg-slate-50 lg:bg-white min-h-screen">

        {/* Mobile Background (Absolute) */}
        <div className="absolute inset-0 lg:hidden z-0">
          <img src="/rsg-new-hero.png" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-rsg-navy/90 mix-blend-multiply" />
        </div>

        <div className="z-10 w-full max-w-[400px] flex flex-col gap-8">
          {/* Logos */}
          <div className="flex items-center gap-6 mb-4">
            <img src="/rsg-logo.png" alt="RSG" className="h-12 w-auto lg:brightness-100 lg:invert-0 brightness-0 invert" />
            <div className="h-10 w-px bg-slate-300 lg:bg-slate-200" />
            <img src="/firstfix-v2.png" alt="FirstFix" className="h-8 w-auto lg:brightness-100 lg:invert-0 brightness-0 invert" />
          </div>

          <div className="mb-2">
            <h2 className="text-2xl font-bold text-rsg-navy lg:text-slate-800 text-white mb-2 font-serif">Welcome Back</h2>
            <p className="text-slate-400 lg:text-slate-500 text-sm">Sign in to access your dashboard</p>
          </div>

          <SignIn
            appearance={{
              layout: { socialButtonsPlacement: "bottom" },
              elements: {
                rootBox: "w-full",
                card: "bg-white shadow-none p-0 border-none w-full",
                headerTitle: "hidden", // We built our own header
                headerSubtitle: "hidden",
                formButtonPrimary: "bg-rsg-gold hover:bg-[#B08D55] text-white transition-all h-12 rounded-none uppercase tracking-widest text-xs font-bold shadow-sm",
                formFieldInput: "rounded-none border-slate-200 focus:border-rsg-gold focus:ring-0 bg-slate-50 h-11",
                formFieldLabel: "uppercase text-xs font-bold text-slate-500 tracking-wider mb-1.5",
                footerActionLink: "text-rsg-gold hover:text-rsg-navy font-semibold",
                socialButtonsBlockButton: "border-slate-200 rounded-none hover:bg-slate-50 h-11 text-slate-600 font-medium",
                dividerLine: "bg-slate-100",
                dividerText: "text-slate-400 capitalize"
              }
            }}
          />

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              Restricted Access System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
