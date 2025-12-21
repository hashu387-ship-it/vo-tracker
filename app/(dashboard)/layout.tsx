import { Header } from '@/components/layout/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-rsg-gold/30">
      <div className="relative z-10">
        <Header />
        <main className="container py-8 max-w-[1600px]">{children}</main>
      </div>
    </div>
  );
}
