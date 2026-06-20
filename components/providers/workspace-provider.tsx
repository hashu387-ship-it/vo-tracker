'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface RecentItem {
  id: string;
  title: string;
  href: string;
  kind: 'vo' | 'payment' | 'page';
  at: number;
}

interface WorkspaceContextValue {
  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;
  togglePalette: () => void;
  assistantOpen: boolean;
  setAssistantOpen: (v: boolean) => void;
  toggleAssistant: () => void;
  assistantSeed: string | null;
  askAssistant: (q: string) => void;
  clearSeed: () => void;
  recents: RecentItem[];
  pushRecent: (item: Omit<RecentItem, 'at'>) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const RECENTS_KEY = 'vo-workspace-recents';

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantSeed, setAssistantSeed] = useState<string | null>(null);
  const [recents, setRecents] = useState<RecentItem[]>([]);

  // hydrate recents
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENTS_KEY);
      if (raw) setRecents(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const pushRecent = useCallback((item: Omit<RecentItem, 'at'>) => {
    setRecents((prev) => {
      const next = [{ ...item, at: Date.now() }, ...prev.filter((r) => r.id !== item.id)].slice(0, 8);
      try {
        localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const togglePalette = useCallback(() => setPaletteOpen((v) => !v), []);
  const toggleAssistant = useCallback(() => setAssistantOpen((v) => !v), []);

  const askAssistant = useCallback((q: string) => {
    setAssistantSeed(q);
    setAssistantOpen(true);
    setPaletteOpen(false);
  }, []);

  const clearSeed = useCallback(() => setAssistantSeed(null), []);

  // global keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (meta && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setAssistantOpen((v) => !v);
      } else if (e.key === '/' && !isTyping(e)) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      paletteOpen,
      setPaletteOpen,
      togglePalette,
      assistantOpen,
      setAssistantOpen,
      toggleAssistant,
      assistantSeed,
      askAssistant,
      clearSeed,
      recents,
      pushRecent,
    }),
    [paletteOpen, assistantOpen, assistantSeed, recents, togglePalette, toggleAssistant, askAssistant, clearSeed, pushRecent],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

function isTyping(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  const tag = t.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable;
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
