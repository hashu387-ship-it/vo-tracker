import { SignIn } from '@clerk/nextjs';
import { Building2, Waves } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">

      {/* Logos Section */}
      <div className="mb-8 flex flex-col items-center gap-6 md:flex-row md:gap-12">
        {/* Red Sea Logo Placeholder */}
        <div className="flex items-center gap-2">
          <Waves className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-serif font-bold text-slate-800 tracking-wide">
            Red Sea
          </span>
        </div>

        <div className="hidden h-12 w-px bg-slate-300 md:block"></div>

        {/* Firstfix Logo Placeholder */}
        <div className="flex items-center gap-2">
          <Building2 className="h-8 w-8 text-orange-500" />
          <span className="text-2xl font-sans font-black tracking-tighter text-slate-900">
            FIRST<span className="text-orange-500">FIX</span>
          </span>
        </div>
      </div>

      {/* Main Heading */}
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 md:text-4xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          HW2 Commercial Register
        </h1>
        <p className="text-sm text-slate-500 uppercase tracking-widest font-medium">
          Variation Order Management System
        </p>
      </div>

      {/* Clerk Sign In Component */}
      <div className="w-full max-w-[480px]">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto w-full',
              card: 'shadow-xl border-t-4 border-t-blue-600 rounded-xl',
              headerTitle: 'hidden',
              headerSubtitle: 'text-slate-500',
              formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300',
            }
          }}
        />
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-[10px] text-slate-400 italic">
          Designed by Mohamed Roomy Mohamed Hassan
        </p>
      </div>
    </div>
  );
}
