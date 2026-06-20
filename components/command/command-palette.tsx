'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  FileText,
  CreditCard,
  Sparkles,
  Plus,
  Command as CommandIcon,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Clock,
  Bot,
  FileBarChart,
  Gauge,
} from 'lucide-react';
import { useWorkspace } from '@/components/providers/workspace-provider';
import { globalSearch } from '@/lib/intelligence/engine';
import { cn } from '@/lib/utils';

interface Cmd {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const { paletteOpen, setPaletteOpen, recents, askAssistant, pushRecent } = useWorkspace();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (paletteOpen) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [paletteOpen]);

  const go = (href: string, recent?: { id: string; title: string; kind: 'vo' | 'payment' | 'page' }) => {
    if (recent) pushRecent({ ...recent, href });
    router.push(href);
    setPaletteOpen(false);
  };

  const baseCommands: Cmd[] = useMemo(
    () => [
      { id: 'nav-intel', label: 'Command Center', hint: 'Intelligence', group: 'Navigate', icon: Gauge, run: () => go('/intelligence', { id: 'page-intel', title: 'Command Center', kind: 'page' }) },
      { id: 'nav-dash', label: 'Dashboard', group: 'Navigate', icon: LayoutDashboard, run: () => go('/dashboard', { id: 'page-dash', title: 'Dashboard', kind: 'page' }) },
      { id: 'nav-vos', label: 'Variation Orders', group: 'Navigate', icon: FileText, run: () => go('/vos', { id: 'page-vos', title: 'Variation Orders', kind: 'page' }) },
      { id: 'nav-pay', label: 'Payments', group: 'Navigate', icon: CreditCard, run: () => go('/payments', { id: 'page-pay', title: 'Payments', kind: 'page' }) },
      { id: 'act-new-vo', label: 'New Variation Order', group: 'Actions', icon: Plus, run: () => go('/vos/new') },
      { id: 'act-ai', label: 'Ask the AI Assistant', hint: '⌘J', group: 'Actions', icon: Bot, run: () => askAssistant('') },
      { id: 'act-report', label: 'Generate commercial report', group: 'Actions', icon: FileBarChart, run: () => askAssistant('Give me a commercial status report') },
      { id: 'act-forecast', label: 'Forecast next payments', group: 'Actions', icon: Sparkles, run: () => askAssistant('Forecast the next payments') },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const searchHits = useMemo(() => (query.trim() ? globalSearch(query, 6) : []), [query]);

  // Build flat list for keyboard nav
  const flat: Cmd[] = useMemo(() => {
    const q = query.toLowerCase().trim();
    const filteredBase = q
      ? baseCommands.filter((c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q))
      : baseCommands;

    const hitCmds: Cmd[] = searchHits.map((h) => ({
      id: h.id,
      label: h.title,
      hint: h.subtitle,
      group: h.kind === 'vo' ? 'Variation Orders' : 'Payments',
      icon: h.kind === 'vo' ? FileText : CreditCard,
      run: () => {
        if (h.kind === 'vo') {
          // Open the assistant with this VO — always resolvable from the dataset.
          askAssistant(h.title);
        } else {
          go('/payments', { id: h.id, title: h.title, kind: 'payment' });
        }
      },
    }));

    const askCmd: Cmd[] = q
      ? [
          {
            id: 'ask-this',
            label: `Ask AI: “${query.trim()}”`,
            group: 'Assistant',
            icon: Bot,
            run: () => askAssistant(query.trim()),
          },
        ]
      : [];

    return [...filteredBase, ...hitCmds, ...askCmd];
  }, [query, baseCommands, searchHits]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setActive(0);
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Cmd[]>();
    for (const c of flat) {
      if (!map.has(c.group)) map.set(c.group, []);
      map.get(c.group)!.push(c);
    }
    return Array.from(map.entries());
  }, [flat]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      flat[active]?.run();
    }
  };

  let runningIndex = -1;

  return (
    <Dialog.Root open={paletteOpen} onOpenChange={setPaletteOpen}>
      <AnimatePresence>
        {paletteOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-md"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount onKeyDown={onKeyDown}>
              <motion.div
                initial={{ opacity: 0, y: -16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className="fixed left-1/2 top-[12vh] z-[101] w-[92vw] max-w-2xl -translate-x-1/2 overflow-hidden rounded-2xl border border-white/15 bg-white/85 shadow-2xl shadow-black/40 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/85"
              >
                <Dialog.Title className="sr-only">Command palette</Dialog.Title>
                <Dialog.Description className="sr-only">
                  Search, navigate, and ask the AI assistant
                </Dialog.Description>

                {/* Search input */}
                <div className="flex items-center gap-3 border-b border-slate-200/70 px-4 py-3.5 dark:border-white/10">
                  <Search className="h-5 w-5 shrink-0 text-slate-400" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search VOs, payments, actions… or ask the AI"
                    className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                  />
                  <kbd className="hidden items-center gap-1 rounded-md border border-slate-300 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 sm:flex dark:border-white/15 dark:text-zinc-400">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[52vh] overflow-y-auto scrollbar-modern p-2">
                  {flat.length === 0 && (
                    <div className="px-4 py-10 text-center text-sm text-slate-400">
                      No results for “{query}”.
                    </div>
                  )}

                  {/* Recents (only when empty query) */}
                  {!query && recents.length > 0 && (
                    <Group label="Recently viewed">
                      {recents.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => go(r.href)}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-white/5"
                        >
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className="truncate">{r.title}</span>
                        </button>
                      ))}
                    </Group>
                  )}

                  {grouped.map(([group, items]) => (
                    <Group key={group} label={group}>
                      {items.map((c) => {
                        runningIndex += 1;
                        const idx = runningIndex;
                        const isActive = idx === active;
                        const Icon = c.icon;
                        return (
                          <button
                            key={c.id}
                            onMouseEnter={() => setActive(idx)}
                            onClick={() => c.run()}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                              isActive
                                ? 'bg-gradient-to-r from-rsg-navy/10 to-transparent text-slate-900 dark:from-rsg-gold/15 dark:text-white'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-white/5',
                            )}
                          >
                            <span
                              className={cn(
                                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                                isActive
                                  ? 'bg-rsg-navy text-white dark:bg-rsg-gold dark:text-zinc-900'
                                  : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-zinc-400',
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1 truncate">{c.label}</span>
                            {c.hint && (
                              <span className="shrink-0 truncate text-xs text-slate-400">{c.hint}</span>
                            )}
                            {isActive && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                          </button>
                        );
                      })}
                    </Group>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-200/70 px-4 py-2.5 text-[11px] text-slate-400 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><ArrowUp className="h-3 w-3" /><ArrowDown className="h-3 w-3" /> navigate</span>
                    <span className="flex items-center gap-1"><CornerDownLeft className="h-3 w-3" /> select</span>
                  </div>
                  <span className="flex items-center gap-1">
                    <CommandIcon className="h-3 w-3" /> Command Center
                  </span>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      {children}
    </div>
  );
}
