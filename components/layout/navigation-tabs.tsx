'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Variation Orders',
    href: '/vos',
    icon: FileText,
  },
];

export function NavigationTabs() {
  const pathname = usePathname();

  return (
    <div className="w-full border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-16 z-40">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 -mb-px overflow-x-auto scrollbar-hide py-2">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href ||
              (tab.href === '/vos' && pathname.startsWith('/vos'));
            const Icon = tab.icon;

            return (
              <Link key={tab.href} href={tab.href}>
                <motion.div
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{tab.name}</span>

                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}

          {/* Quick Add Button */}
          <Link href="/vos/new" className="ml-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New VO</span>
            </motion.div>
          </Link>
        </nav>
      </div>
    </div>
  );
}
