import { Header } from '@/components/layout/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0B1120] relative overflow-hidden font-sans selection:bg-rsg-gold/20 text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* Ambient Frosty Glows - Light Mode */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50/60 blur-[120px] pointer-events-none opacity-80 mix-blend-multiply dark:hidden" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-50/60 blur-[120px] pointer-events-none opacity-80 mix-blend-multiply dark:hidden" />
      <div className="fixed top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-purple-50/40 blur-[100px] pointer-events-none opacity-50 mix-blend-multiply dark:hidden" />

      {/* Ambient Cosmic Glows - Dark Mode */}
      <div className="hidden dark:block fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none opacity-40 mix-blend-screen" />
      <div className="hidden dark:block fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-900/10 blur-[120px] pointer-events-none opacity-30 mix-blend-screen" />

      {/* Subtle Grid Texture */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-[0.015] dark:opacity-[0.03] pointer-events-none invert dark:invert-0" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container py-6 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
