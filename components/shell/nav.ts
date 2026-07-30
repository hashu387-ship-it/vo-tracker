import {
  Activity,
  BarChart3,
  Columns3,
  Database,
  FileSpreadsheet,
  LayoutDashboard,
  Receipt,
  TrendingUp,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  description: string;
  /** Highlights the section for nested routes. */
  match?: (pathname: string) => boolean;
}

export const NAV_SECTIONS: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Overview',
    items: [
      {
        href: '/',
        label: 'Command centre',
        icon: LayoutDashboard,
        description: 'Contract position at a glance',
        match: (pathname) => pathname === '/',
      },
      {
        href: '/cashflow',
        label: 'Cash flow',
        icon: TrendingUp,
        description: 'Certified vs collected, ageing and forecast',
      },
      {
        href: '/analytics',
        label: 'Analytics',
        icon: BarChart3,
        description: 'Variation and payment analysis',
      },
    ],
  },
  {
    title: 'Registers',
    items: [
      {
        href: '/variations',
        label: 'Variation orders',
        icon: FileSpreadsheet,
        description: 'The VO log',
        match: (pathname) => pathname.startsWith('/variations') && pathname !== '/variations/board',
      },
      {
        href: '/variations/board',
        label: 'VO board',
        icon: Columns3,
        description: 'Kanban by status',
        match: (pathname) => pathname === '/variations/board',
      },
      {
        href: '/payments',
        label: 'Payment register',
        icon: Receipt,
        description: 'Advance payments and IPAs',
        match: (pathname) => pathname.startsWith('/payments'),
      },
    ],
  },
  {
    title: 'Record',
    items: [
      {
        href: '/activity',
        label: 'Activity',
        icon: Activity,
        description: 'Who changed what, and when',
      },
      {
        href: '/data',
        label: 'Data & contract',
        icon: Database,
        description: 'Import, export and contract particulars',
      },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);

export function isActive(item: NavItem, pathname: string): boolean {
  if (item.match) return item.match(pathname);
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
