import { Header } from '@/components/layout/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDFDFD] relative overflow-hidden font-sans selection:bg-rsg-gold/20 text-slate-900">

      {/* Ambient Frosty Glows - Subtle & High End */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50/60 blur-[120px] pointer-events-none opacity-80 mix-blend-multiply" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-50/60 blur-[120px] pointer-events-none opacity-80 mix-blend-multiply" />
      <div className="fixed top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-purple-50/40 blur-[100px] pointer-events-none opacity-50 mix-blend-multiply" />

      {/* Subtle Grid Texture */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-[0.015] pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container py-8 max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
