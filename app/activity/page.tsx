import {
  FileSpreadsheet,
  PlusCircle,
  Receipt,
  RefreshCw,
  Settings2,
  Trash2,
  Upload,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { EmptyState, PageHeader } from '@/components/register/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { getActivity, getProject } from '@/lib/db/queries';
import type { ActivityEntry } from '@/lib/domain/types';

export const metadata: Metadata = { title: 'Activity' };

const ACTION_ICON = {
  created: PlusCircle,
  updated: RefreshCw,
  deleted: Trash2,
  imported: Upload,
  exported: FileSpreadsheet,
} as const;

const ENTITY_ICON = {
  variation: FileSpreadsheet,
  payment: Receipt,
  project: Settings2,
  system: Upload,
} as const;

function href(entry: ActivityEntry): string | null {
  if (!entry.entityId) return null;
  if (entry.entity === 'variation') return `/variations/${entry.entityId}`;
  if (entry.entity === 'payment') return `/payments/${entry.entityId}`;
  return null;
}

function when(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function ActivityPage() {
  const [entries, project] = await Promise.all([getActivity(120), getProject()]);

  // Group by calendar day so the log reads as a diary.
  const days = entries.reduce((map, entry) => {
    const day = entry.at.slice(0, 10);
    map.set(day, [...(map.get(day) ?? []), entry]);
    return map;
  }, new Map<string, ActivityEntry[]>());

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        eyebrow={`${project.code} · audit trail`}
        title="Activity"
        description="Every change made through the app — status moves, edits, imports and deletions — with what changed and when."
      />

      {entries.length === 0 ? (
        <EmptyState
          title="Nothing recorded yet"
          description="Changes made in the register will appear here."
        />
      ) : (
        <div className="space-y-5">
          {Array.from(days.entries()).map(([day, dayEntries]) => (
            <section key={day}>
              <h2 className="eyebrow mb-2">
                {new Date(`${day}T00:00:00Z`).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  timeZone: 'UTC',
                })}
              </h2>
              <Card>
                <CardContent className="p-0">
                  <ul className="divide-y divide-border">
                    {dayEntries.map((entry) => {
                      const ActionIcon = ACTION_ICON[entry.action] ?? RefreshCw;
                      const EntityIcon = ENTITY_ICON[entry.entity] ?? Settings2;
                      const link = href(entry);
                      const body = (
                        <div className="flex items-start gap-3 px-4 py-3">
                          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                            <ActionIcon className="size-3.5 text-muted-foreground" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{entry.summary}</p>
                            {entry.detail ? (
                              <p className="text-xs text-muted-foreground">{entry.detail}</p>
                            ) : null}
                            <p className="mt-0.5 flex items-center gap-1.5 text-2xs text-muted-foreground">
                              <EntityIcon className="size-3" />
                              {entry.actor} · {when(entry.at)}
                            </p>
                          </div>
                        </div>
                      );

                      return (
                        <li key={entry.id}>
                          {link ? (
                            <Link href={link} className="block transition-colors hover:bg-muted/40">
                              {body}
                            </Link>
                          ) : (
                            body
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
