import { StatsOverview } from '@/components/dashboard/stats-overview';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of all Variation Orders and their current status
          </p>
        </div>
        <Link href="/vos/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New VO
          </Button>
        </Link>
      </div>

      <StatsOverview />

      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/vos">
            <Button variant="outline">View All VOs</Button>
          </Link>
          <Link href="/vos?status=Pending">
            <Button variant="outline">View Pending VOs</Button>
          </Link>
          <Link href="/vos?status=Approved">
            <Button variant="outline">View Approved VOs</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
