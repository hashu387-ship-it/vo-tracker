'use client';

import { Moon, Sun, LayoutDashboard, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UserButton } from '@clerk/nextjs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { setTheme } = useTheme();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 transition-all group-hover:scale-105 group-hover:shadow-primary/30">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">VO Tracker</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/dashboard"
              className={cn(
                "relative text-sm font-medium transition-colors hover:text-primary",
                pathname === "/dashboard"
                  ? "text-foreground after:absolute after:bottom-[-20px] after:left-0 after:h-[2px] after:w-full after:bg-primary after:content-['']"
                  : "text-muted-foreground"
              )}
            >
              Dashboard
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:flex border border-primary/20">
            Admin
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 rounded-xl ring-2 ring-background hover:ring-primary/20 transition-all",
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}
