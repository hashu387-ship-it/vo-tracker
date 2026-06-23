'use client';

import { motion } from 'framer-motion';
import {
  Boxes,
  ScanText,
  Users,
  MessageSquareText,
  LineChart,
  ShieldCheck,
  FileOutput,
  WifiOff,
} from 'lucide-react';
import { ProjectProvider, useProject } from '@/components/shell/project-provider';
import { AppShell } from '@/components/shell/app-shell';
import { commercialSummary, formatCompact } from '@/lib/data/commercial';

export default function PlatformPage() {
  return (
    <ProjectProvider>
      <AppShell>
        <PlatformContent />
      </AppShell>
    </ProjectProvider>
  );
}

const FEATURES = [
  { icon: ScanText, title: 'AI Document Parsing', desc: 'Drag-drop SIs / RFIs / FIDIC → auto Draft VO cards (Vision + NLP).', status: 'Needs OPENAI_API_KEY' },
  { icon: Users, title: 'Multiplayer CRDT', desc: 'Live co-editing with cursors & presence (Liveblocks/Yjs).', status: 'Scaffolded' },
  { icon: WifiOff, title: 'Offline-First PWA', desc: 'IndexedDB caching for poor-connectivity sites.', status: 'Planned' },
  { icon: MessageSquareText, title: 'Chat with Project (RAG)', desc: 'Ask the register anything — grounded answers.', status: 'Live (key-gated)' },
  { icon: Boxes, title: '3D BIM / IFC Linkage', desc: 'Click a VO → highlight the element in 3D (web-ifc).', status: 'Scaffolded' },
  { icon: LineChart, title: 'Predictive Final Account', desc: 'Forecast outturn cost & cash flow over 6 months.', status: 'In data layer' },
  { icon: ShieldCheck, title: 'Cryptographic Audit Trail', desc: 'Immutable SHA-256 hash chain on every status change.', status: 'Live (schema)' },
  { icon: FileOutput, title: 'RICS / FIDIC Export', desc: 'One-click branded PDF + Excel of VOs & IPAs.', status: 'Live (Excel)' },
];

function PlatformContent() {
  const { project } = useProject();
  const s = commercialSummary;
  const kpis = project.live
    ? [
        { label: 'Revised Contract', value: formatCompact(s.revisedContract) },
        { label: 'Work Completed', value: `${Math.round(s.workDonePct * 100)}%` },
        { label: 'Cash Received', value: formatCompact(s.received) },
        { label: 'VO Exposure', value: formatCompact(s.totalSubmittedVOValue) },
      ]
    : [
        { label: 'Revised Contract', value: '—' },
        { label: 'Work Completed', value: '—' },
        { label: 'Cash Received', value: '—' },
        { label: 'VO Exposure', value: '—' },
      ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-bronze">
          Enterprise Hub · 2026
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {project.name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {project.live
            ? 'Live commercial intelligence — Liquid-Glass UI on the Bronze & Charcoal design system.'
            : 'This contract is provisioned and ready to be backed by the enterprise database.'}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 26 }}
            className="liquid-glass rounded-3xl p-5"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {k.label}
            </div>
            <div className="mt-2 text-2xl font-semibold text-foreground">{k.value}</div>
          </motion.div>
        ))}
      </div>

      {/* God-Mode feature grid */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Platform Capabilities</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 240, damping: 26 }}
              className="group rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl transition-all hover:shadow-liquid"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bronze/12 text-bronze">
                  <f.icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <span className="rounded-full bg-tan/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-charcoal/70 dark:bg-secondary dark:text-foreground/70">
                  {f.status}
                </span>
              </div>
              <h3 className="mt-4 text-[15px] font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
