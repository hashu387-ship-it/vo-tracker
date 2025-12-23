import { Header } from '@/components/layout/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 relative overflow-hidden font-sans selection:bg-primary/20 text-slate-900 dark:text-white transition-colors duration-300">

      {/* Ambient Glows - Light Mode: subtle warm tones, Dark Mode: deep navy tones */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rsg-navy/5 dark:bg-rsg-navy/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rsg-gold/5 dark:bg-rsg-gold/10 blur-[120px] pointer-events-none" />
      <div className="fixed top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-sky-500/5 dark:bg-sky-500/10 blur-[100px] pointer-events-none" />

      {/* Subtle Grid Texture */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-[0.015] dark:opacity-[0.03] pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-6 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
