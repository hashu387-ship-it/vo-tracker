import { Header } from '@/components/layout/header';
import { WorkspaceProvider } from '@/components/providers/workspace-provider';
import { CommandPalette } from '@/components/command/command-palette';
import { AssistantSidebar } from '@/components/ai/assistant-sidebar';
import { FloatingDock } from '@/components/ai/floating-dock';
import { AuroraBackground } from '@/components/ui/aurora-background';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 relative overflow-hidden font-sans selection:bg-primary/20 text-slate-900 dark:text-white transition-colors duration-300">
        {/* Aurora ambient background */}
        <AuroraBackground />

        {/* Subtle Grid Texture */}
        <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-[0.015] dark:opacity-[0.03] pointer-events-none" />

        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 py-6 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>

        {/* Workspace overlays */}
        <CommandPalette />
        <AssistantSidebar />
        <FloatingDock />
      </div>
    </WorkspaceProvider>
  );
}
