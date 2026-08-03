'use client';

import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Download,
  ExternalLink,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import { StatusChip } from '@/components/register/status-chip';
import { EmptyState } from '@/components/register/page-header';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { Input, Select } from '@/components/ui/field';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { formatDate, money } from '@/lib/domain/money';
import {
  SUBMISSION_TYPES,
  VARIATION_STATUSES,
  VARIATION_STATUS_META,
  type Variation,
  type VariationStatus,
} from '@/lib/domain/types';
import { cn, downloadBlob, matches, toCsv } from '@/lib/utils';

type SortKey =
  | 'serial'
  | 'voNumber'
  | 'subject'
  | 'aconexDate'
  | 'submissionDate'
  | 'proposalValue'
  | 'clientAssessment'
  | 'agreedValue'
  | 'status';

interface Column {
  key: SortKey | 'owner' | 'links' | 'remarks' | 'refs';
  label: string;
  numeric?: boolean;
  sortable?: boolean;
  defaultVisible: boolean;
  width?: string;
}

const COLUMNS: Column[] = [
  { key: 'serial', label: '#', sortable: true, defaultVisible: true, width: 'w-12' },
  { key: 'voNumber', label: 'VO', sortable: true, defaultVisible: true, width: 'w-24' },
  { key: 'subject', label: 'Subject', sortable: true, defaultVisible: true },
  { key: 'status', label: 'Status', sortable: true, defaultVisible: true, width: 'w-44' },
  { key: 'aconexDate', label: 'Raised', sortable: true, defaultVisible: true, width: 'w-28' },
  { key: 'submissionDate', label: 'Submitted', sortable: true, defaultVisible: false, width: 'w-28' },
  { key: 'proposalValue', label: 'Cost proposal', numeric: true, sortable: true, defaultVisible: true, width: 'w-36' },
  { key: 'clientAssessment', label: 'RSG assessment', numeric: true, sortable: true, defaultVisible: false, width: 'w-36' },
  { key: 'agreedValue', label: 'Agreed value', numeric: true, sortable: true, defaultVisible: true, width: 'w-36' },
  { key: 'refs', label: 'References', defaultVisible: false },
  { key: 'remarks', label: 'Latest remark', defaultVisible: false },
  { key: 'owner', label: 'Owner', defaultVisible: false, width: 'w-28' },
  { key: 'links', label: '', defaultVisible: true, width: 'w-10' },
];

const PAGE_SIZES = [25, 50, 100, 250];

export function VariationTable({
  variations,
  currency,
}: {
  variations: Variation[];
  currency: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState<VariationStatus | 'all'>(
    (searchParams.get('status') as VariationStatus) ?? 'all',
  );
  const [type, setType] = React.useState<string>('all');
  const [owner, setOwner] = React.useState<string>('all');
  const [valued, setValued] = React.useState<'all' | 'valued' | 'unvalued'>('all');
  const [sort, setSort] = React.useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'serial',
    dir: 'asc',
  });
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(50);
  const [visible, setVisible] = React.useState<Set<string>>(
    () => new Set(COLUMNS.filter((column) => column.defaultVisible).map((column) => column.key)),
  );

  const owners = React.useMemo(
    () => Array.from(new Set(variations.map((v) => v.owner).filter(Boolean))).sort() as string[],
    [variations],
  );

  const filtered = React.useMemo(() => {
    const rows = variations.filter((variation) => {
      if (status !== 'all' && variation.status !== status) return false;
      if (type !== 'all' && variation.submissionType !== type) return false;
      if (owner !== 'all' && variation.owner !== owner) return false;
      if (valued === 'valued' && variation.agreedValue === null) return false;
      if (valued === 'unvalued' && variation.agreedValue !== null) return false;
      if (!query) return true;
      return (
        matches(variation.voNumber, query) ||
        matches(variation.subject, query) ||
        matches(variation.vorRef, query) ||
        matches(variation.dvoRef, query) ||
        matches(variation.dvoReference, query) ||
        matches(variation.submissionRef, query) ||
        matches(variation.responseRef, query) ||
        matches(variation.contractorRemarks, query) ||
        matches(variation.clientRemarks, query) ||
        matches(variation.owner, query)
      );
    });

    const direction = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const left = a[sort.key];
      const right = b[sort.key];
      if (left === right) return a.serial - b.serial;
      if (left === null || left === undefined) return 1;
      if (right === null || right === undefined) return -1;
      if (typeof left === 'number' && typeof right === 'number') {
        return (left - right) * direction;
      }
      return String(left).localeCompare(String(right)) * direction;
    });
  }, [variations, status, type, owner, valued, query, sort]);

  const totals = React.useMemo(
    () => ({
      proposal: filtered.reduce((sum, v) => sum + (v.proposalValue ?? 0), 0),
      assessment: filtered.reduce((sum, v) => sum + (v.clientAssessment ?? 0), 0),
      agreed: filtered.reduce((sum, v) => sum + (v.agreedValue ?? 0), 0),
    }),
    [filtered],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  /** Changing the status also rewrites the URL, so the view stays shareable. */
  const changeStatus = (next: VariationStatus | 'all') => {
    setStatus(next);
    setPage(0);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (next === 'all') params.delete('status');
    else params.set('status', next);
    const query = params.toString();
    router.replace(query ? `/variations?${query}` : '/variations', { scroll: false });
  };

  /** Any other filter change invalidates the current page offset. */
  const withPageReset =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      setPage(0);
    };

  const toggleSort = (key: SortKey) =>
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: key === 'serial' || key === 'voNumber' ? 'asc' : 'desc' },
    );

  const exportCsv = () => {
    const csv = toCsv(
      filtered.map((variation) => ({
        '#': variation.serial,
        'VO number': variation.voNumber ?? '',
        Subject: variation.subject,
        Status: variation.status ? VARIATION_STATUS_META[variation.status].label : '',
        'Raised (Aconex)': variation.aconexDate ?? '',
        Submitted: variation.submissionDate ?? '',
        Type: variation.submissionType ?? '',
        'Submission ref': variation.submissionRef ?? '',
        'VOR ref': variation.vorRef ?? '',
        'DVO ref': variation.dvoRef ?? '',
        [`Cost proposal (${currency})`]: variation.proposalValue ?? '',
        [`RSG assessment (${currency})`]: variation.clientAssessment ?? '',
        [`Agreed value (${currency})`]: variation.agreedValue ?? '',
        'FFC remarks': variation.contractorRemarks ?? '',
        'RSG remarks': variation.clientRemarks ?? '',
        Owner: variation.owner ?? '',
      })),
      [
        '#',
        'VO number',
        'Subject',
        'Status',
        'Raised (Aconex)',
        'Submitted',
        'Type',
        'Submission ref',
        'VOR ref',
        'DVO ref',
        `Cost proposal (${currency})`,
        `RSG assessment (${currency})`,
        `Agreed value (${currency})`,
        'FFC remarks',
        'RSG remarks',
        'Owner',
      ],
    );
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'hw2c05-vo-log.csv');
  };

  const hasFilters =
    query !== '' || status !== 'all' || type !== 'all' || owner !== 'all' || valued !== 'all';

  const show = (key: string) => visible.has(key);

  return (
    <div className="space-y-3">
      {/* Filters — one row above the table */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => withPageReset(setQuery)(event.target.value)}
            placeholder="Search subject, references, remarks…"
            className="pl-9"
            aria-label="Search variations"
          />
        </div>

        <Select
          value={status}
          onChange={(event) => changeStatus(event.target.value as VariationStatus | 'all')}
          className="w-auto min-w-[170px]"
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {VARIATION_STATUSES.map((value) => (
            <option key={value} value={value}>
              {VARIATION_STATUS_META[value].label}
            </option>
          ))}
        </Select>

        <Select
          value={type}
          onChange={(event) => withPageReset(setType)(event.target.value)}
          className="w-auto min-w-[120px]"
          aria-label="Filter by submission type"
        >
          <option value="all">All types</option>
          {SUBMISSION_TYPES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>

        {owners.length > 0 ? (
          <Select
            value={owner}
            onChange={(event) => withPageReset(setOwner)(event.target.value)}
            className="w-auto min-w-[120px]"
            aria-label="Filter by owner"
          >
            <option value="all">Any owner</option>
            {owners.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        ) : null}

        <Select
          value={valued}
          onChange={(event) => withPageReset(setValued)(event.target.value as 'all' | 'valued' | 'unvalued')}
          className="w-auto min-w-[140px]"
          aria-label="Filter by valuation"
        >
          <option value="all">Valued or not</option>
          <option value="valued">Has agreed value</option>
          <option value="unvalued">Not yet valued</option>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Columns3 className="size-3.5" /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
            <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {COLUMNS.filter((column) => column.label).map((column) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={visible.has(column.key)}
                onCheckedChange={(checked) =>
                  setVisible((current) => {
                    const next = new Set(current);
                    if (checked) next.add(column.key);
                    else next.delete(column.key);
                    return next;
                  })
                }
                onSelect={(event) => event.preventDefault()}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5">
          <Download className="size-3.5" /> CSV
        </Button>

        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              changeStatus('all');
              setType('all');
              setOwner('all');
              setValued('all');
              setPage(0);
            }}
            className="gap-1.5"
          >
            <X className="size-3.5" /> Clear
          </Button>
        ) : null}
      </div>

      {/* Result summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <SlidersHorizontal className="size-3" />
          {filtered.length} of {variations.length} variations
          {hasFilters ? ' matching the filters' : ''}
        </p>
        <p className="tnum">
          Cost proposals {money(totals.proposal)} · Agreed {money(totals.agreed)} {currency}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No variations match these filters"
          description="Try clearing the search box or widening the status filter."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
          <div className="data-scroll max-h-[70vh] overflow-y-auto">
            <Table>
              <THead>
                <TR className="hover:bg-transparent">
                  {COLUMNS.filter((column) => show(column.key)).map((column) => (
                    <TH key={column.key} numeric={column.numeric} className={column.width}>
                      {column.sortable ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(column.key as SortKey)}
                          className={cn(
                            'inline-flex cursor-pointer items-center gap-1 transition-colors hover:text-foreground',
                            sort.key === column.key && 'text-foreground',
                          )}
                        >
                          {column.label}
                          <ArrowDownUp
                            className={cn(
                              'size-3 opacity-40',
                              sort.key === column.key && 'opacity-100',
                            )}
                          />
                        </button>
                      ) : (
                        column.label
                      )}
                    </TH>
                  ))}
                </TR>
              </THead>
              <TBody>
                {rows.map((variation) => (
                  <TR key={variation.id}>
                    {show('serial') ? (
                      <TD className="text-2xs text-muted-foreground">{variation.serial}</TD>
                    ) : null}
                    {show('voNumber') ? (
                      <TD>
                        <Link
                          href={`/variations/${variation.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {variation.voNumber ?? '—'}
                        </Link>
                      </TD>
                    ) : null}
                    {show('subject') ? (
                      <TD className="max-w-md">
                        <Link
                          href={`/variations/${variation.id}`}
                          className="line-clamp-2 hover:underline"
                          title={variation.subject}
                        >
                          {variation.subject}
                        </Link>
                        {variation.submissionType ? (
                          <span className="ml-1.5 text-2xs text-muted-foreground">
                            {variation.submissionType}
                          </span>
                        ) : null}
                      </TD>
                    ) : null}
                    {show('status') ? (
                      <TD>
                        <StatusChip status={variation.status} kind="variation" short />
                      </TD>
                    ) : null}
                    {show('aconexDate') ? (
                      <TD className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatDate(variation.aconexDate)}
                      </TD>
                    ) : null}
                    {show('submissionDate') ? (
                      <TD className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatDate(variation.submissionDate)}
                      </TD>
                    ) : null}
                    {show('proposalValue') ? (
                      <TD numeric>{variation.proposalValue === null ? '—' : money(variation.proposalValue)}</TD>
                    ) : null}
                    {show('clientAssessment') ? (
                      <TD numeric>
                        {variation.clientAssessment === null ? '—' : money(variation.clientAssessment)}
                      </TD>
                    ) : null}
                    {show('agreedValue') ? (
                      <TD
                        numeric
                        className={cn(
                          'font-medium',
                          (variation.agreedValue ?? 0) < 0 && 'text-destructive',
                        )}
                      >
                        {variation.agreedValue === null ? '—' : money(variation.agreedValue)}
                      </TD>
                    ) : null}
                    {show('refs') ? (
                      <TD className="text-2xs text-muted-foreground">
                        {[variation.vorRef, variation.dvoRef].filter(Boolean).join(' · ') || '—'}
                      </TD>
                    ) : null}
                    {show('remarks') ? (
                      <TD className="max-w-sm">
                        <span className="line-clamp-2 text-2xs text-muted-foreground">
                          {variation.contractorRemarks ?? variation.clientRemarks ?? '—'}
                        </span>
                      </TD>
                    ) : null}
                    {show('owner') ? (
                      <TD className="text-xs text-muted-foreground">{variation.owner ?? '—'}</TD>
                    ) : null}
                    {show('links') ? (
                      <TD>
                        {variation.aconexLink ? (
                          <a
                            href={variation.aconexLink}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-muted-foreground transition-colors hover:text-primary"
                            title="Open in Aconex"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        ) : null}
                      </TD>
                    ) : null}
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-3 py-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Rows</span>
              <Select
                value={String(pageSize)}
                onChange={(event) => withPageReset(setPageSize)(Number(event.target.value))}
                className="h-7 w-auto py-0 text-xs"
                aria-label="Rows per page"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="tnum">
                {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, filtered.length)} of{' '}
                {filtered.length}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setPage((value) => Math.max(0, value - 1))}
                disabled={currentPage === 0}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
                disabled={currentPage >= pageCount - 1}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
