import { useQuery } from '@tanstack/react-query';

interface VOStats {
  counts: {
    total: number;
    pendingWithFFC: number;
    pendingWithRSG: number;
    pendingWithRSGFFC: number;
    approvedAwaitingDVO: number;
    dvoRRIssued: number;
  };
  financials: {
    totalSubmittedValue: number;
    totalApprovedValue: number;
  };
  statusBreakdown: {
    status: string;
    label: string;
    count: number;
    amount: number;
    color: string;
    gradient: string;
  }[];
}

async function fetchVOStats(): Promise<VOStats> {
  const response = await fetch('/api/vo/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch VO stats');
  }
  const json = await response.json();
  return json.data;
}

export function useVOStats() {
  return useQuery({
    queryKey: ['vo-stats'],
    queryFn: fetchVOStats,
  });
}
