'use client';

import { AlertTriangle, CheckCircle2, FileUp, Loader2, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { resetToWorkbook } from '@/lib/actions';
import { importWorkbook, type ImportOutcome } from '@/lib/import-action';
import { cn } from '@/lib/utils';

export function ImportPanel({ sourceWorkbook }: { sourceWorkbook: string | null }) {
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [outcome, setOutcome] = React.useState<ImportOutcome | null>(null);
  const [resetting, setResetting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (!file) return;
    setBusy(true);
    setOutcome(null);
    const formData = new FormData();
    formData.set('workbook', file);
    const result = await importWorkbook(formData);
    setBusy(false);
    setOutcome(result);
    if (result.ok) {
      toast.success(result.message);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  const reset = async () => {
    setResetting(true);
    const result = await resetToWorkbook();
    setResetting(false);
    if (result.ok) {
      toast.success(result.message ?? 'Register restored.');
      router.refresh();
    } else {
      toast.error(result.message ?? 'Could not restore the register.');
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Import the source workbook</CardTitle>
          <CardDescription>
            Upload the latest “Pay Reg &amp; VO LOG” workbook. The VO log and payment register
            sheets are read and replace the whole register — contract particulars in the register
            header are picked up too.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const dropped = event.dataTransfer.files?.[0];
              if (dropped) setFile(dropped);
            }}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors',
              dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-ring',
            )}
          >
            <FileUp className="size-6 text-muted-foreground" />
            <span className="text-sm font-medium">
              {file ? file.name : 'Drop the .xlsx here, or click to choose'}
            </span>
            <span className="text-2xs text-muted-foreground">
              {file
                ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                : 'Sheets “VO LOG (2)” and “Payment Register” · up to 15 MB'}
            </span>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="sr-only"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={submit} disabled={!file || busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
              Import workbook
            </Button>
            {file ? (
              <Button
                variant="ghost"
                onClick={() => {
                  setFile(null);
                  if (inputRef.current) inputRef.current.value = '';
                }}
              >
                Clear
              </Button>
            ) : null}
          </div>

          {outcome ? (
            <div
              className={cn(
                'space-y-1 rounded-md border px-3 py-2 text-xs',
                outcome.ok
                  ? 'border-good/25 bg-good/10 text-good'
                  : 'border-destructive/25 bg-destructive/10 text-destructive',
              )}
            >
              <p className="flex items-center gap-1.5 font-medium">
                {outcome.ok ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  <AlertTriangle className="size-3.5" />
                )}
                {outcome.message}
              </p>
              {outcome.warnings?.length ? (
                <ul className="list-disc space-y-0.5 pl-5 text-muted-foreground">
                  {outcome.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export &amp; restore</CardTitle>
          <CardDescription>
            The export mirrors the register in the project’s reporting style — a summary sheet, the
            VO log and the payment register, with totals and filters already applied.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <a href="/api/export?format=xlsx">Styled workbook (.xlsx)</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/api/export?format=csv&sheet=variations">VO log (.csv)</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/api/export?format=csv&sheet=payments">Payment register (.csv)</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/api/summary">Summary (JSON)</a>
            </Button>
          </div>

          <div className="rounded-md border border-border bg-muted/40 px-3 py-2.5">
            <p className="text-xs font-medium">Restore the shipped extract</p>
            <p className="mt-0.5 text-2xs text-muted-foreground">
              Puts the register back to {sourceWorkbook ?? 'the checked-in workbook extract'} —
              84 variations and 33 certificates. Any edits made here are discarded.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="mt-2 gap-1.5">
                  <RotateCcw className="size-3.5" /> Restore
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Restore the register?</DialogTitle>
                  <DialogDescription>
                    Every variation and certificate is replaced with the checked-in workbook
                    extract. Edits made in the app since then will be lost.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="destructive" onClick={reset} disabled={resetting}>
                    {resetting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <RotateCcw className="size-4" />
                    )}
                    Restore now
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
