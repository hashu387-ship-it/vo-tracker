'use client';

import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { NAV_SECTIONS, isActive } from '@/components/shell/nav';
import { cn } from '@/lib/utils';

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {NAV_SECTIONS.map((section) => (
        <div key={section.title}>
          <p className="px-2 pb-1.5 text-2xs font-semibold uppercase tracking-[0.14em] text-navy-300/70">
            {section.title}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item, pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group flex min-h-10 items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors',
                      active
                        ? 'bg-lagoon-600/20 text-white'
                        : 'text-navy-100/80 hover:bg-white/5 hover:text-white',
                    )}
                  >
                    <Icon
                      className={cn(
                        'size-4 shrink-0 transition-colors',
                        active ? 'text-lagoon-300' : 'text-navy-300 group-hover:text-navy-100',
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                    {active ? (
                      <span aria-hidden className="ml-auto h-4 w-0.5 rounded-full bg-lagoon-400" />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link href="/" onClick={onNavigate} className="flex items-center gap-2.5 px-4 py-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white/95 p-1.5">
        <Image
          src="/rsg-logo.png"
          alt=""
          width={40}
          height={40}
          className="h-full w-full object-contain"
          priority
        />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold leading-tight text-white">
          HW2C05 Register
        </span>
        <span className="block truncate text-2xs text-navy-300">Shura West Hotel 02 · MEP</span>
      </span>
    </Link>
  );
}

function Footer({ contractor, asOf }: { contractor: string; asOf: string }) {
  return (
    <div className="border-t border-white/10 px-4 py-3">
      <p className="text-2xs text-navy-300">
        {contractor} · commercial team
      </p>
      <p className="text-2xs text-navy-400">Data as of {asOf}</p>
    </div>
  );
}

export function Sidebar({ contractor, asOf }: { contractor: string; asOf: string }) {
  return (
    <aside className="no-print sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-white/10 bg-navy-800 lg:flex">
      <Brand />
      <NavList />
      <Footer contractor={contractor} asOf={asOf} />
    </aside>
  );
}

export function MobileNav({ contractor, asOf }: { contractor: string; asOf: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="no-print lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="relative flex h-full w-64 animate-fade-up flex-col bg-navy-800">
            <div className="flex items-center justify-between pr-2">
              <Brand onNavigate={() => setOpen(false)} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-2 text-navy-200 hover:bg-white/10 hover:text-white"
                aria-label="Close navigation"
              >
                <X className="size-4" />
              </button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
            <Footer contractor={contractor} asOf={asOf} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
