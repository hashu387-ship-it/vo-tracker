import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/rsg-new-hero.png"
          alt="Red Sea Project"
          className="h-full w-full object-cover object-center scale-105 blur-[2px]"
        />
        <div className="absolute inset-0 bg-rsg-navy/80 mix-blend-multiply" />
      </div>

      {/* Decorative Elements */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-rsg-gold/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-rsg-navy/50 blur-[100px]" />
      </div>

      <div className="z-10 flex w-full max-w-md flex-col items-center gap-8 p-6">
        {/* Logos */}
        <div className="flex items-center gap-8 md:gap-12 bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
          <img src="/rsg-logo.png" alt="RSG" className="h-10 md:h-12 w-auto brightness-0 invert" />
          <div className="h-10 w-px bg-white/20" />
          <img src="/firstfix-v2.png" alt="FirstFix" className="h-8 md:h-10 w-auto brightness-0 invert" />
        </div>

        {/* Sign In Component */}
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-white/95 backdrop-blur-xl border-none shadow-2xl rounded-3xl",
              headerTitle: "text-rsg-navy font-bold text-2xl",
              headerSubtitle: "text-gray-500",
              formButtonPrimary: "bg-rsg-gold hover:bg-[#B08D55] text-white transition-all shadow-md",
              formFieldInput: "rounded-xl border-gray-200 focus:border-rsg-gold focus:ring-rsg-gold/20",
              footerActionLink: "text-rsg-navy hover:text-rsg-gold",
              socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50 text-rsg-navy",
              dividerLine: "bg-gray-200",
              dividerText: "text-gray-400"
            }
          }}
        />

        {/* Footer */}
        <div className="text-center text-xs text-white/40 font-light tracking-wider">
          <p>© 2025 VO Tracker. Restricted Access.</p>
        </div>
      </div>
    </div>
  );
}
