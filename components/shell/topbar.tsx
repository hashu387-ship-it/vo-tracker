'use client';

import { AlertTriangle, Download, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { CommandPalette, type PaletteEntry } from '@/components/shell/command-palette';
import { MobileNav } from '@/components/shell/sidebar';
import { ThemeToggle } from '@/components/shell/theme-toggle';
import { ALL_NAV_ITEMS, isActive } from '@/components/shell/nav';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';

export function Topbar({
  entries,
  contractor,
  asOf,
  issueCount,
}: {
  entries: PaletteEntry[];
  contractor: string;
  asOf: string;
  issueCount: number;
}) {
  const pathname = usePathname();
  const current = ALL_NAV_ITEMS.find((item) => isActive(item, pathname));

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border bg-canvas/85 backdrop-blur supports-[backdrop-filter]:bg-canvas/70">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        <MobileNav contractor={contractor} asOf={asOf} />

        <div className="hidden min-w-0 lg:block">
          <p className="truncate text-sm font-semibold">{current?.label ?? 'Commercial register'}</p>
          <p className="truncate text-2xs text-muted-foreground">
            {current?.description ?? 'R06-HW2C05'}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <CommandPalette entries={entries} />

          {issueCount > 0 ? (
            <Link
              href="/data#quality"
              className="hidden items-center gap-1.5 rounded-md border border-warning/30 bg-warning/10 px-2.5 py-1.5 text-2xs font-medium text-warning transition-colors hover:bg-warning/15 sm:flex"
              title="Data-quality notes carried over from the source workbook"
            >
              <AlertTriangle className="size-3.5" />
              {issueCount} note{issueCount === 1 ? '' : 's'}
            </Link>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-sm" title="Export">
                <Download className="size-4" />
                <span className="sr-only">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <a href="/api/export?format=xlsx">Full workbook (.xlsx)</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/api/export?format=csv&sheet=variations">VO log (.csv)</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/api/export?format=csv&sheet=payments">Payment register (.csv)</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/report">Printable report</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" />
                <span className="hidden sm:inline">New</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/variations/new">Variation order</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/payments/new">Payment certificate</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
