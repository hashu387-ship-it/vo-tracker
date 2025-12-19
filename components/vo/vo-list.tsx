'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VOTable } from './vo-table';
import { VOFilters } from './vo-filters';
import { VOPagination } from './vo-pagination';
import { useVOs } from '@/lib/hooks/use-vos';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface VOListProps {
  isAdmin?: boolean;
}

export function VOList({ isAdmin = false }: VOListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Initialize state from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [submissionType, setSubmissionType] = useState(searchParams.get('submissionType') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'submissionDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  );
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [isExporting, setIsExporting] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch VOs
  const { data, isLoading } = useVOs({
    search: debouncedSearch || undefined,
    status: status && status !== 'all' ? (status as any) : undefined,
    submissionType: submissionType && submissionType !== 'all' ? (submissionType as any) : undefined,
    sortBy,
    sortOrder,
    page,
    limit: 20,
  });

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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (status && status !== 'all') params.set('status', status);
      if (submissionType && submissionType !== 'all') params.set('submissionType', submissionType);
      if (sortBy) params.set('sortBy', sortBy);
      if (sortOrder) params.set('sortOrder', sortOrder);

      const response = await fetch(`/api/export?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VO_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export successful',
        description: 'Your Excel file has been downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Variation Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all variation orders for your project
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button variant="outline" onClick={handleExport} disabled={isExporting} className="gap-2">
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
              <Link href="/vos/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New VO
                </Button>
              </Link>
            </>
          )}
        </div>
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
        vos={data?.data || []}
        isLoading={isLoading}
        isAdmin={isAdmin}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {data && data.pagination.totalPages > 1 && (
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
