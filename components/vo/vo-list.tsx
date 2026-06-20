'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VOTable } from './vo-table';
import { VOFilters } from './vo-filters';
import { VOPagination } from './vo-pagination';
import { ExportDialog } from './export-dialog';
import { useVOs, VO } from '@/lib/hooks/use-vos';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@clerk/nextjs';
import { DemoDisclaimer } from '@/components/ui/demo-disclaimer';
import { realDemoVOs } from '@/lib/data/demo-records';
import Link from 'next/link';

interface VOListProps {
  isAdmin?: boolean;
}

export function VOList({ isAdmin = false }: VOListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { isSignedIn, isLoaded } = useUser();

  // Demo mode check
  const isDemo = isLoaded && !isSignedIn;
  const demoVOs = realDemoVOs;

  // Initialize state from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [submissionType, setSubmissionType] = useState(searchParams.get('submissionType') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'submissionDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  );
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch VOs (only if signed in)
  const { data, isLoading } = useVOs({
    search: debouncedSearch || undefined,
    status: status && status !== 'all' ? (status as any) : undefined,
    submissionType: submissionType && submissionType !== 'all' ? (submissionType as any) : undefined,
    sortBy,
    sortOrder,
    page,
    limit: 20,
  }, { enabled: isLoaded && isSignedIn === true });

  // Filter the embedded real dataset (used for guests and as an empty-DB fallback)
  const filteredDemoVOs = useMemo(() => {
    let filtered = [...demoVOs];

    // Apply search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(vo =>
        vo.subject.toLowerCase().includes(searchLower) ||
        vo.vorReference?.toLowerCase().includes(searchLower) ||
        vo.remarks?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (status && status !== 'all') {
      filtered = filtered.filter(vo => vo.status === status);
    }

    // Apply submission type filter
    if (submissionType && submissionType !== 'all') {
      filtered = filtered.filter(vo => vo.submissionType === submissionType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'subject':
          comparison = a.subject.localeCompare(b.subject);
          break;
        case 'proposalValue':
          comparison = (a.proposalValue || 0) - (b.proposalValue || 0);
          break;
        case 'approvedAmount':
          comparison = (a.approvedAmount || 0) - (b.approvedAmount || 0);
          break;
        default:
          comparison = new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [isDemo, demoVOs, debouncedSearch, status, submissionType, sortBy, sortOrder]);

  // Always render data: live DB rows for signed-in users when present,
  // otherwise the embedded real dataset. Never block the page on Clerk
  // finishing — only show a skeleton while a signed-in fetch is genuinely
  // in flight and has no data yet.
  const liveVOs = data?.data || [];
  const activeVOs = isSignedIn && liveVOs.length > 0 ? liveVOs : filteredDemoVOs;
  const activeLoading = isSignedIn === true && isLoading && liveVOs.length === 0;

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (status && status !== 'all') params.set('status', status);
    if (submissionType && submissionType !== 'all') params.set('submissionType', submissionType);
    if (sortBy) params.set('sortBy', sortBy);
    if (sortOrder) params.set('sortOrder', sortOrder);
    if (page > 1) params.set('page', String(page));

    const newUrl = params.toString() ? `?${params.toString()}` : '/vos';
    router.replace(newUrl, { scroll: false });
  }, [debouncedSearch, status, submissionType, sortBy, sortOrder, page, router]);

  const handleSort = useCallback(
    (field: string) => {
      if (sortBy === field) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(field);
        setSortOrder('desc');
      }
    },
    [sortBy, sortOrder]
  );

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setStatus('');
    setSubmissionType('');
    setPage(1);
  }, []);

  return (
    <div className="space-y-6">
      {/* Demo Mode Disclaimer */}
      {isDemo && <DemoDisclaimer type="card" />}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Variation Orders</h1>
          <p className="text-muted-foreground text-sm">
            {isDemo ? 'Demo mode - viewing sample data' : 'Manage and track all variation orders for your project'}
          </p>
        </div>
        {isAdmin && !isDemo && (
          <ExportDialog
            searchParams={{
              search: debouncedSearch,
              status: status && status !== 'all' ? status : undefined,
              submissionType: submissionType && submissionType !== 'all' ? submissionType : undefined,
              sortBy,
              sortOrder,
            }}
          />
        )}
      </div>

      <VOFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        submissionType={submissionType}
        onSubmissionTypeChange={(value) => {
          setSubmissionType(value);
          setPage(1);
        }}
        onClearFilters={handleClearFilters}
      />

      <VOTable
        vos={activeVOs}
        isLoading={activeLoading}
        isAdmin={isAdmin}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {!isDemo && data && data.pagination.totalPages > 1 && (
        <VOPagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          total={data.pagination.total}
          limit={data.pagination.limit}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
