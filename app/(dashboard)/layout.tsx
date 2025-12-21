import { Header } from '@/components/layout/header';
import { NavigationTabs } from '@/components/layout/navigation-tabs';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans selection:bg-primary/20 text-foreground transition-colors duration-300">

      {/* Ambient Frosty Glows - Light Mode */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none opacity-80 dark:opacity-20" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none opacity-80 dark:opacity-20" />
      <div className="fixed top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none opacity-50 dark:opacity-10" />

      {/* Subtle Grid Texture */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-[0.02] dark:opacity-[0.03] pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <NavigationTabs />
        <main className="flex-1 py-6 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
