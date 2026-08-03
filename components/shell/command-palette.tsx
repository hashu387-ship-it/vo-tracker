'use client';

import { ArrowRight, CornerDownLeft, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { compactMoney } from '@/lib/domain/money';
import { ALL_NAV_ITEMS } from '@/components/shell/nav';
import { cn, matches } from '@/lib/utils';

export interface PaletteEntry {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  group: 'Go to' | 'Variation orders' | 'Payment certificates';
  keywords: string;
  value?: number | null;
}

/**
 * ⌘K / Ctrl-K palette over the whole register — every VO, every certificate and
 * every page. Search is plain substring matching; with a few hundred records
 * that is instant and behaves predictably.
 */
export function CommandPalette({ entries }: { entries: PaletteEntry[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [highlighted, setHighlighted] = React.useState(0);
  const listRef = React.useRef<HTMLUListElement>(null);

  const navEntries: PaletteEntry[] = React.useMemo(
    () =>
      ALL_NAV_ITEMS.map((item) => ({
        id: `nav-${item.href}`,
        href: item.href,
        title: item.label,
        subtitle: item.description,
        group: 'Go to' as const,
        keywords: `${item.label} ${item.description}`,
      })),
    [],
  );

  const results = React.useMemo(() => {
    const pool = [...navEntries, ...entries];
    const filtered = query
      ? pool.filter((entry) => matches(entry.keywords, query))
      : pool.filter((entry) => entry.group === 'Go to');
    return filtered.slice(0, 40);
  }, [entries, navEntries, query]);

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === '/' && !open) {
        const target = event.target as HTMLElement | null;
        const typing =
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable);
        if (!typing) {
          event.preventDefault();
          setOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  const go = React.useCallback(
    (entry: PaletteEntry | undefined) => {
      if (!entry) return;
      setOpen(false);
      setQuery('');
      router.push(entry.href);
    },
    [router],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      go(results[highlighted]);
    }
  };

  React.useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>('[data-highlighted="true"]');
    node?.scrollIntoView({ block: 'nearest' });
  }, [highlighted]);

  let lastGroup = '';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="no-print flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background text-sm text-muted-foreground transition-colors hover:border-ring hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-52 sm:justify-start sm:px-3 xl:w-72"
      >
        <Search className="size-3.5" />
        <span className="hidden flex-1 text-left sm:inline">Search the register…</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-2xs sm:inline">
          ⌘K
        </kbd>
        <span className="sr-only sm:hidden">Search the register</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          hideClose
          className="top-[15%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (event.currentTarget as HTMLElement).querySelector('input')?.focus();
          }}
        >
          <DialogTitle className="sr-only">Search the commercial register</DialogTitle>
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setHighlighted(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Search VOs, certificates, references, subjects…"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <ul ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
            {results.length === 0 ? (
              <li className="px-3 py-8 text-center text-sm text-muted-foreground">
                Nothing matches “{query}”.
              </li>
            ) : (
              results.map((entry, index) => {
                const showGroup = entry.group !== lastGroup;
                lastGroup = entry.group;
                return (
                  <React.Fragment key={entry.id}>
                    {showGroup ? (
                      <li className="px-3 pb-1 pt-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground first:pt-1">
                        {entry.group}
                      </li>
                    ) : null}
                    <li>
                      <button
                        type="button"
                        data-highlighted={index === highlighted}
                        onMouseEnter={() => setHighlighted(index)}
                        onClick={() => go(entry)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors',
                          index === highlighted ? 'bg-muted' : 'hover:bg-muted/60',
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{entry.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{entry.subtitle}</p>
                        </div>
                        {entry.value !== undefined && entry.value !== null ? (
                          <span className="tnum shrink-0 text-xs text-muted-foreground">
                            {compactMoney(entry.value)}
                          </span>
                        ) : null}
                        <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                      </button>
                    </li>
                  </React.Fragment>
                );
              })
            )}
          </ul>

          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-2xs text-muted-foreground">
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border px-1">↑</kbd>
                <kbd className="rounded border border-border px-1">↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="size-3" /> open
              </span>
            </span>
            <span>{results.length} result{results.length === 1 ? '' : 's'}</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
