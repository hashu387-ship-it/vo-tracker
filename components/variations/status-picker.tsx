'use client';

import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import { StatusChip } from '@/components/register/status-chip';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { updatePaymentStatus, updateVariationStatus } from '@/lib/actions';
import {
  PAYMENT_STATUSES,
  PAYMENT_STATUS_META,
  VARIATION_STATUSES,
  VARIATION_STATUS_META,
  type PaymentStatus,
  type VariationStatus,
} from '@/lib/domain/types';

/** Inline status change from a detail page — the most common single edit. */
export function StatusPicker({
  id,
  kind,
  status,
}: {
  id: string;
  kind: 'variation' | 'payment';
  status: VariationStatus | PaymentStatus | null;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const options =
    kind === 'variation'
      ? VARIATION_STATUSES.map((value) => ({ value, label: VARIATION_STATUS_META[value].label }))
      : PAYMENT_STATUSES.map((value) => ({ value, label: PAYMENT_STATUS_META[value].label }));

  const change = async (value: string) => {
    setPending(true);
    const result =
      kind === 'variation'
        ? await updateVariationStatus(id, value as VariationStatus)
        : await updatePaymentStatus(id, value as PaymentStatus);
    setPending(false);
    if (!result.ok) {
      toast.error(result.message ?? 'Could not update the status.');
      return;
    }
    if (result.message) toast.success(result.message);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={pending}>
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <StatusChip status={status} kind={kind} short className="border-0 bg-transparent p-0" />
          )}
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Move to</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuItem key={option.value} onSelect={() => change(option.value)}>
            {option.value === status ? (
              <Check className="size-3.5 text-primary" />
            ) : (
              <span className="size-3.5" />
            )}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
