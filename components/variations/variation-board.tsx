'use client';

import { GripVertical, Plus } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { updateVariationStatus } from '@/lib/actions';
import { compactMoney, money } from '@/lib/domain/money';
import {
  VARIATION_STATUSES,
  VARIATION_STATUS_META,
  toneClasses,
  type Variation,
  type VariationStatus,
} from '@/lib/domain/types';
import { cn, matches } from '@/lib/utils';

/**
 * Status board. Drag-and-drop uses the native HTML5 API — no dependency, and it
 * degrades to a status menu on the card for touch devices and keyboard users.
 */
export function VariationBoard({
  variations,
  currency,
}: {
  variations: Variation[];
  currency: string;
}) {
  const [query, setQuery] = React.useState('');
  const [dragging, setDragging] = React.useState<string | null>(null);
  const [over, setOver] = React.useState<VariationStatus | null>(null);
  const [pending, startTransition] = React.useTransition();

  /**
   * The card moves the instant it is dropped; React discards the optimistic
   * value when the server action's revalidation delivers the real rows, so a
   * rejected move snaps back on its own.
   */
  const [rows, applyMove] = React.useOptimistic(
    variations,
    (state: Variation[], move: { id: string; status: VariationStatus }) =>
      state.map((row) => (row.id === move.id ? { ...row, status: move.status } : row)),
  );

  const filtered = React.useMemo(
    () =>
      rows.filter(
        (variation) =>
          matches(variation.subject, query) ||
          matches(variation.voNumber, query) ||
          matches(variation.vorRef, query),
      ),
    [rows, query],
  );

  const move = React.useCallback(
    (id: string, status: VariationStatus) => {
      const current = variations.find((row) => row.id === id);
      if (!current || current.status === status) return;

      startTransition(async () => {
        applyMove({ id, status });
        const result = await updateVariationStatus(id, status);
        if (!result.ok) {
          toast.error(result.message ?? 'Could not move that variation.');
          return;
        }
        toast.success(
          `${current.voNumber ?? `#${current.serial}`} → ${VARIATION_STATUS_META[status].label}`,
        );
      });
    },
    [variations, applyMove],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter the board…"
          className="max-w-xs"
          aria-label="Filter variations"
        />
        <span className="text-xs text-muted-foreground">
          {filtered.length} card{filtered.length === 1 ? '' : 's'}
          {pending ? ' · saving…' : ''}
        </span>
        <Button asChild size="sm" className="ml-auto gap-1.5">
          <Link href="/variations/new">
            <Plus className="size-3.5" /> New variation
          </Link>
        </Button>
      </div>

      {/* The scroller owns the horizontal overflow; min-w-0 stops the
          min-w-max track inside it from widening the page instead. */}
      <div className="data-scroll min-w-0 pb-2">
        <div className="flex min-w-max gap-3">
          {VARIATION_STATUSES.map((status) => {
            const meta = VARIATION_STATUS_META[status];
            const tone = toneClasses(meta.tone);
            const cards = filtered.filter((variation) => variation.status === status);
            const total = cards.reduce((sum, card) => sum + (card.agreedValue ?? 0), 0);

            return (
              <section
                key={status}
                onDragOver={(event) => {
                  event.preventDefault();
                  setOver(status);
                }}
                onDragLeave={() => setOver((current) => (current === status ? null : current))}
                onDrop={(event) => {
                  event.preventDefault();
                  setOver(null);
                  if (dragging) move(dragging, status);
                  setDragging(null);
                }}
                className={cn(
                  'flex w-72 shrink-0 flex-col rounded-lg border bg-card/60 transition-colors',
                  over === status ? 'border-primary bg-primary/5' : 'border-border',
                )}
              >
                <header className="border-b border-border px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <span aria-hidden className={cn('size-2 rounded-full', tone.dot)} />
                      {meta.label}
                    </span>
                    <span className="tnum rounded bg-muted px-1.5 py-0.5 text-2xs font-medium">
                      {cards.length}
                    </span>
                  </div>
                  <p className="tnum mt-1 text-2xs text-muted-foreground">
                    {compactMoney(total)} {currency}
                  </p>
                </header>

                <ul className="flex-1 space-y-2 overflow-y-auto p-2" style={{ maxHeight: '62vh' }}>
                  {cards.length === 0 ? (
                    <li className="rounded border border-dashed border-border px-3 py-6 text-center text-2xs text-muted-foreground">
                      Drop a variation here
                    </li>
                  ) : (
                    cards.map((variation) => (
                      <li
                        key={variation.id}
                        draggable
                        onDragStart={() => setDragging(variation.id)}
                        onDragEnd={() => {
                          setDragging(null);
                          setOver(null);
                        }}
                        className={cn(
                          'group cursor-grab rounded-md border border-border bg-card p-2.5 shadow-card transition-shadow active:cursor-grabbing',
                          dragging === variation.id && 'opacity-40',
                        )}
                      >
                        <div className="flex items-start gap-1.5">
                          <GripVertical
                            aria-hidden
                            className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/50"
                          />
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/variations/${variation.id}`}
                              className="text-xs font-semibold text-primary hover:underline"
                            >
                              {variation.voNumber ?? `#${variation.serial}`}
                            </Link>
                            <p className="mt-0.5 line-clamp-3 text-2xs leading-relaxed text-muted-foreground">
                              {variation.subject}
                            </p>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <span className="tnum text-2xs font-medium">
                                {variation.agreedValue !== null
                                  ? money(variation.agreedValue)
                                  : variation.proposalValue !== null
                                    ? `${money(variation.proposalValue)} proposed`
                                    : 'Not priced'}
                              </span>
                              {variation.owner ? (
                                <span
                                  className="flex size-5 items-center justify-center rounded-full bg-muted text-[9px] font-semibold uppercase text-muted-foreground"
                                  title={variation.owner}
                                >
                                  {variation.owner.slice(0, 2)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {/* Keyboard / touch fallback for the drag interaction. */}
                        <label className="mt-2 block">
                          <span className="sr-only">
                            Move {variation.voNumber ?? variation.subject} to another status
                          </span>
                          <select
                            value={status}
                            onChange={(event) =>
                              move(variation.id, event.target.value as VariationStatus)
                            }
                            className="w-full cursor-pointer rounded border border-input bg-background px-1.5 py-1.5 text-2xs text-muted-foreground opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100 [@media(pointer:coarse)]:opacity-100"
                          >
                            {VARIATION_STATUSES.map((value) => (
                              <option key={value} value={value}>
                                {VARIATION_STATUS_META[value].label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </li>
                    ))
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
