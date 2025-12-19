'use client';

import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  statusConfig,
  submissionTypeConfig,
  VOStatus,
  SubmissionType,
} from '@/lib/validations/vo';

interface VOFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  submissionType: string;
  onSubmissionTypeChange: (value: string) => void;
  onClearFilters: () => void;
}

export function VOFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  submissionType,
  onSubmissionTypeChange,
  onClearFilters,
}: VOFiltersProps) {
  const hasFilters = search || status || submissionType;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search VOs..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(Object.keys(statusConfig) as VOStatus[]).map((key) => (
              <SelectItem key={key} value={key}>
                {statusConfig[key].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={submissionType} onValueChange={onSubmissionTypeChange}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {(Object.keys(submissionTypeConfig) as SubmissionType[]).map((key) => (
              <SelectItem key={key} value={key}>
                {submissionTypeConfig[key].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="ghost" onClick={onClearFilters} className="gap-2">
          <X className="h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
