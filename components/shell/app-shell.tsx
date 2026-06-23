'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileStack,
  CreditCard,
  LineChart,
  Boxes,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  Check,
} from 'lucide-react';
import { PROJECTS } from '@/lib/projects';
import { useProject } from './project-provider';
import { PresenceStack } from './presence';
import { AiChatPanel } from './ai-chat-panel';

const NAV = [
  { label: 'Command Center', href: '/intelligence', icon: LayoutDashboard },
  { label: 'VO Kanban', href: '/vos', icon: FileStack },
  { label: 'Payments (IPA)', href: '/payments', icon: CreditCard },
  { label: 'Forecasting', href: '/forecast', icon: LineChart },
  { label: 'BIM / IFC', href: '/platform', icon: Boxes },
  { label: 'Audit Trail', href: '/platform', icon: ShieldCheck },
];

/**
 * Foundational 2026 enterprise layout shell:
 *  - multi-project sidebar switcher (isolated state via ProjectProvider)
 *  - global RAG "Chat with Project" toggle
 *  - live multiplayer presence indicators
 * Liquid-glass over a neumorphic mesh base, Bronze/Charcoal palette.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { project, projectId, setProjectId } = useProject();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="mesh-bg relative flex min-h-screen text-foreground">
      {/* ------------------------------- Sidebar ------------------------------ */}
      <aside className="liquid-glass sticky top-0 z-30 hidden h-screen w-[268px] flex-col gap-6 p-4 md:flex">
        {/* brand */}
        <Link href="/" className="flex items-center gap-3 px-2 pt-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/rsg-logo.png" alt="Red Sea Global" className="h-7 w-auto" />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Commercial Register
          </span>
        </Link>

        {/* project switcher */}
        <div className="relative">
          <button
            onClick={() => setSwitcherOpen((o) => !o)}
            className="neu flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-left transition-transform hover:-translate-y-0.5"
          >
            <span className="flex items-center gap-2.5">
              <span className="h-7 w-7 rounded-lg" style={{ background: project.accent }} />
              <span>
                <span className="block text-[13px] font-semibold leading-tight text-foreground">
                  {project.short}
                </span>
                <span className="block text-[10px] text-muted-foreground">{project.code}</span>
              </span>
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          {switcherOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="liquid-glass-strong absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-2xl p-1.5"
            >
              {PROJECTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setProjectId(p.id); setSwitcherOpen(false); }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-accent"
                >
                  <span className="h-6 w-6 rounded-md" style={{ background: p.accent }} />
                  <span className="flex-1">
                    <span className="block text-[12.5px] font-medium text-foreground">{p.name}</span>
                    <span className="block text-[10px] text-muted-foreground">
                      {p.code}{p.live ? ' · live data' : ' · provisioning'}
                    </span>
                  </span>
                  {p.id === projectId && <Check className="h-4 w-4 text-bronze" />}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* nav */}
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <n.icon className="h-[18px] w-[18px] text-bronze/80 group-hover:text-bronze" strokeWidth={1.9} />
              {n.label}
            </Link>
          ))}
        </nav>

        {/* presence + chat */}
        <div className="space-y-3 border-t border-border/60 pt-4">
          <PresenceStack compact />
          <button
            onClick={() => setChatOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-bronze px-3 py-2.5 text-[13px] font-semibold text-white shadow-bronze transition-transform hover:-translate-y-0.5"
          >
            <Sparkles className="h-4 w-4" /> Chat with Project
          </button>
        </div>
      </aside>

      {/* ------------------------------- Main -------------------------------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* top bar */}
        <header className="liquid-glass sticky top-0 z-20 flex items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="h-5 w-5 rounded" style={{ background: project.accent }} />
            <span className="font-semibold text-foreground">{project.name}</span>
            <span className="hidden text-muted-foreground sm:inline">· Enterprise Hub</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <PresenceStack />
            </div>
            <button
              onClick={() => setChatOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-bronze px-3 py-2 text-[12.5px] font-semibold text-white shadow-bronze md:hidden"
            >
              <Sparkles className="h-4 w-4" /> AI
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>

      {/* RAG chat panel */}
      <AiChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />

      {/* floating chat button (mobile + always) */}
      <button
        onClick={() => setChatOpen(true)}
        aria-label="Chat with Project"
        className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-bronze text-white shadow-bronze transition-transform hover:scale-105 md:hidden"
      >
        <Sparkles className="h-6 w-6" />
      </button>
    </div>
  );
}
