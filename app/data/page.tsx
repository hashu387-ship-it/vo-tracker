import { AlertTriangle, Database, HardDrive, Info } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { ImportPanel } from '@/components/data/import-panel';
import { ProjectForm } from '@/components/data/project-form';
import { DefinitionRow, PageHeader, Section } from '@/components/register/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { storageMode } from '@/lib/db/client';
import { getRegister } from '@/lib/db/queries';
import { formatDate, money } from '@/lib/domain/money';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Data & contract' };

const STORAGE_LABEL = {
  remote: 'Hosted libSQL database — shared between instances and durable.',
  local: 'Local database file beside the project — durable on this machine.',
  ephemeral:
    'Temporary storage. This host mounts the deployment read-only, so the register lives in the instance’s temp directory: edits are visible here but are not shared between instances and are lost when the instance restarts. Set TURSO_DATABASE_URL (and TURSO_AUTH_TOKEN) to make changes permanent.',
} as const;

export default async function DataPage() {
  const { project, variations, payments, asOf, issues, paymentPosition, variationPosition } =
    await getRegister();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${project.code} · data management`}
        title="Data & contract"
        description="Import the source workbook, export the register, and keep the contract particulars that drive every derived figure."
      />

      <div
        className={cn(
          'flex items-start gap-2.5 rounded-lg border px-4 py-3',
          storageMode === 'ephemeral'
            ? 'border-warning/30 bg-warning/5'
            : 'border-border bg-card shadow-card',
        )}
      >
        <HardDrive
          className={cn(
            'mt-0.5 size-4 shrink-0',
            storageMode === 'ephemeral' ? 'text-warning' : 'text-muted-foreground',
          )}
        />
        <div className="min-w-0">
          <p className="text-xs font-medium">
            Storage ·{' '}
            {storageMode === 'remote'
              ? 'hosted'
              : storageMode === 'local'
                ? 'local file'
                : 'temporary'}
          </p>
          <p className="text-2xs leading-relaxed text-muted-foreground">
            {STORAGE_LABEL[storageMode]}
          </p>
        </div>
      </div>

      <ImportPanel sourceWorkbook={project.sourceWorkbook} />

      <ProjectForm project={project} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Section id="quality" title="Data quality" description="Notes carried over from the source workbook">
          <Card>
            <CardContent className="pt-5">
              {issues.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  Nothing to flag — every certificate reconciles and every variation has a status.
                </p>
              ) : (
                <ul className="space-y-2">
                  {issues.map((issue, index) => (
                    <li
                      key={`${issue.entity}-${issue.id}-${index}`}
                      className={cn(
                        'flex gap-2 rounded-md border px-3 py-2',
                        issue.severity === 'warning'
                          ? 'border-warning/25 bg-warning/5'
                          : 'border-border bg-muted/40',
                      )}
                    >
                      {issue.severity === 'warning' ? (
                        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" />
                      ) : (
                        <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0">
                        <Link
                          href={
                            issue.entity === 'variation'
                              ? `/variations/${issue.id}`
                              : `/payments/${issue.id}`
                          }
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          {issue.label}
                        </Link>
                        <p className="text-2xs leading-relaxed text-muted-foreground">
                          {issue.message}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-2xs text-muted-foreground">
                The register keeps the source data exactly as issued rather than silently correcting
                it — these notes exist so nothing is lost in translation.
              </p>
            </CardContent>
          </Card>
        </Section>

        <Section title="Register contents" description="What is currently loaded">
          <Card>
            <CardContent className="pt-5">
              <DefinitionRow label="Source workbook" value={project.sourceWorkbook ?? '—'} />
              <DefinitionRow label="Data as of" value={formatDate(asOf)} />
              <DefinitionRow label="Variations" value={String(variations.length)} />
              <DefinitionRow label="Payment certificates" value={String(payments.length)} />
              <DefinitionRow
                label="Total submitted variations"
                value={money(variationPosition.totalValue)}
              />
              <DefinitionRow label="Work done" value={money(paymentPosition.totalWorkDone)} />
              <DefinitionRow label="Cash received" value={money(paymentPosition.cashReceivedTotal)} />
              <DefinitionRow label="Outstanding" value={money(paymentPosition.outstanding)} emphasise />
            </CardContent>
          </Card>
        </Section>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="size-4 text-primary" />
            API
          </CardTitle>
          <CardDescription>
            Everything the app renders is available over HTTP, so the register can feed a report,
            a spreadsheet or another system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="data-scroll">
            <table className="w-full text-xs">
              <tbody className="divide-y divide-border">
                {[
                  ['GET', '/api/summary', 'The whole commercial position as JSON'],
                  ['GET', '/api/variations?status=&q=', 'The VO log, filtered'],
                  ['POST', '/api/variations', 'Create a variation'],
                  ['GET PATCH DELETE', '/api/variations/{id}', 'Read, update or remove one'],
                  ['GET', '/api/payments?outstanding=true', 'Certificates, filtered'],
                  ['POST', '/api/payments', 'Raise a certificate'],
                  ['GET PATCH DELETE', '/api/payments/{id}', 'Read, update or remove one'],
                  ['GET', '/api/export?format=xlsx', 'Styled workbook'],
                  ['GET', '/api/export?format=csv&sheet=payments', 'CSV of either register'],
                ].map(([method, path, description]) => (
                  <tr key={path + method}>
                    <td className="whitespace-nowrap py-2 pr-3 font-mono text-2xs text-muted-foreground">
                      {method}
                    </td>
                    <td className="whitespace-nowrap py-2 pr-3 font-mono text-2xs">{path}</td>
                    <td className="py-2 text-muted-foreground">{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
