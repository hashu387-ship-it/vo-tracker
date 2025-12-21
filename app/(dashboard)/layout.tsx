import { Header } from '@/components/layout/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-rsg-gold/30">
      {/* Ambient Background Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-rsg-gold/5 blur-[100px]" />
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] rounded-full bg-rsg-navy/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-blue-100/40 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Header />
        <main className="container py-8 max-w-[1600px]">{children}</main>
      </div>
    </div>
  );
}
