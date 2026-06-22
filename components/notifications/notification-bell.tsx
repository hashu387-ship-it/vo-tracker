'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, Check } from 'lucide-react';
import { recentUpdates, lastUpdated, formatDateTime, formatDateShort } from '@/lib/data/commercial';

const SEEN_KEY = 'vo-notif-seen-version';

/**
 * Notification bell + dropdown of recent register activity, derived live from
 * the commercial dataset. The dropdown header shows the last-updated date/time.
 * `tone="cream"` styles the trigger for the cream landing header; the default
 * tone matches the app header chrome.
 */
export function NotificationBell({ tone = 'default' }: { tone?: 'default' | 'cream' }) {
  const items = useMemo(() => recentUpdates(8), []);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(true); // assume seen until storage read (avoids SSR flash)
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setSeen(localStorage.getItem(SEEN_KEY) === lastUpdated);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const markSeen = () => {
    if (typeof window !== 'undefined') localStorage.setItem(SEEN_KEY, lastUpdated);
    setSeen(true);
  };

  const toggle = () =>
    setOpen((o) => {
      const next = !o;
      if (next) markSeen();
      return next;
    });

  const unread = !seen ? items.length : 0;

  const triggerCream: React.CSSProperties = {
    position: 'relative',
    width: 40,
    height: 40,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,.7)',
    background: 'rgba(255,255,255,.5)',
    backdropFilter: 'blur(20px) saturate(150%)',
    WebkitBackdropFilter: 'blur(20px) saturate(150%)',
    color: '#5b4a36',
    cursor: 'pointer',
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={toggle}
        {...(tone === 'cream'
          ? { style: triggerCream }
          : {
              className:
                'relative inline-flex w-9 h-9 items-center justify-center rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:border-rsg-gold/50 hover:bg-rsg-gold/5 transition-colors',
            })}
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.9} />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#b0512f] px-1 text-[10px] font-bold leading-none text-white shadow"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-[70] mt-2 w-[320px] max-w-[88vw] overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/95"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-zinc-800">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</div>
              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400">
                <Check className="h-3 w-3 text-emerald-500" />
                Last updated {formatDateTime(lastUpdated)}
              </div>
            </div>
            <span className="rounded-full bg-[#b0512f]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#b0512f]">
              {items.length}
            </span>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {items.map((it) => (
              <Link
                key={it.id}
                href={it.href}
                onClick={() => setOpen(false)}
                className="flex gap-3 border-b border-slate-50 px-4 py-3 transition-colors last:border-0 hover:bg-slate-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/50"
              >
                <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: it.hex }} />
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold text-slate-800 dark:text-zinc-100">
                    {it.title}
                  </div>
                  <div className="line-clamp-2 text-[12px] leading-snug text-slate-500 dark:text-zinc-400">
                    {it.subtitle}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-400 dark:text-zinc-500">
                    {formatDateShort(it.date)}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/intelligence"
            onClick={() => setOpen(false)}
            className="block border-t border-slate-100 px-4 py-2.5 text-center text-[12px] font-semibold text-[#b0512f] hover:bg-[#b0512f]/5 dark:border-zinc-800"
          >
            Open Command Center
          </Link>
        </div>
      )}
    </div>
  );
}
