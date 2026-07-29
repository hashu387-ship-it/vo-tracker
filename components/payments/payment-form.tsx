'use client';

import { Loader2, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { deletePayment, savePayment } from '@/lib/actions';
import { money } from '@/lib/domain/money';
import { PAYMENT_STATUSES, PAYMENT_STATUS_META, type Payment } from '@/lib/domain/types';

const MONEY_FIELDS = [
  { name: 'grossCertified', label: 'Gross certified', hint: 'work executed' },
  { name: 'advanceRecovery', label: 'Advance payment recovery', hint: 'negative' },
  { name: 'backCharge', label: 'Back charge', hint: 'negative' },
  { name: 'retention', label: 'Retention', hint: 'negative, or positive on release' },
  { name: 'vatOnAdvanceRecovery', label: 'VAT on advance recovery', hint: 'negative' },
  { name: 'vat', label: 'VAT 15%', hint: '' },
] as const;

export function PaymentForm({ payment, currency }: { payment?: Payment; currency: string }) {
  const router = useRouter();
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  // Live net-certified preview so the arithmetic is visible while typing.
  const [amounts, setAmounts] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(
      MONEY_FIELDS.map((field) => [field.name, (payment?.[field.name] as number) ?? 0]),
    ),
  );
  const [overrideNet, setOverrideNet] = React.useState(false);

  const derivedNet = React.useMemo(
    () =>
      Math.round(
        MONEY_FIELDS.reduce((sum, field) => sum + (amounts[field.name] || 0), 0) * 100,
      ) / 100,
    [amounts],
  );

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    const formData = new FormData(event.currentTarget);
    if (!overrideNet) formData.delete('netCertified');
    const result = await savePayment(payment?.id ?? null, formData);
    setSaving(false);

    if (!result.ok) {
      setErrors(result.errors ?? {});
      toast.error(result.message ?? 'Could not save.');
      return;
    }
    toast.success(result.message ?? 'Saved.');
    router.push(result.id ? `/payments/${result.id}` : '/payments');
    router.refresh();
  };

  const onDelete = async () => {
    if (!payment) return;
    setDeleting(true);
    const result = await deletePayment(payment.id);
    setDeleting(false);
    if (!result.ok) {
      toast.error(result.message ?? 'Could not delete.');
      return;
    }
    toast.success(result.message ?? 'Deleted.');
    router.push('/payments');
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Certificate</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Reference" hint="e.g. IPA 31" error={errors.ref}>
              <Input name="ref" required defaultValue={payment?.ref ?? ''} placeholder="IPA 00" />
            </Field>

            <Field label="Certificate type" error={errors.kind}>
              <Select name="kind" defaultValue={payment?.kind ?? 'interim'}>
                <option value="interim">Interim payment application</option>
                <option value="advance">Advance payment</option>
              </Select>
            </Field>

            <Field
              label="Claim period"
              hint="e.g. Jun 25th 2026 – Jul 25th 2026"
              error={errors.period}
              className="sm:col-span-2"
            >
              <Input
                name="period"
                defaultValue={payment?.period ?? ''}
                placeholder="Mon 00th YYYY – Mon 00th YYYY"
              />
            </Field>

            <Field label="Submitted" hint="YYYY-MM-DD" error={errors.submittedDate}>
              <Input type="date" name="submittedDate" defaultValue={payment?.submittedDate ?? ''} />
            </Field>

            <Field label="Tax invoice" hint="YYYY-MM-DD" error={errors.taxInvoiceDate}>
              <Input
                type="date"
                name="taxInvoiceDate"
                defaultValue={payment?.taxInvoiceDate ?? ''}
              />
            </Field>

            <Field label="Due" hint="YYYY-MM-DD" error={errors.dueDate}>
              <Input type="date" name="dueDate" defaultValue={payment?.dueDate ?? ''} />
            </Field>

            <Field label="Collected" hint="YYYY-MM-DD" error={errors.collectedDate}>
              <Input type="date" name="collectedDate" defaultValue={payment?.collectedDate ?? ''} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Certificate status" error={errors.status}>
              <Select name="status" defaultValue={payment?.status ?? 'draft'}>
                {PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {PAYMENT_STATUS_META[status].label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Payment note" hint="free text" error={errors.paymentNote}>
              <Input
                name="paymentNote"
                defaultValue={payment?.paymentNote ?? ''}
                placeholder="Tax invoice sent on…"
              />
            </Field>

            <Field label={`Received (${currency})`} error={errors.received}>
              <Input
                type="number"
                step="0.01"
                name="received"
                defaultValue={payment?.received ?? ''}
                placeholder="Leave blank if not collected"
              />
            </Field>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Valuation ({currency})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MONEY_FIELDS.map((field) => (
              <Field
                key={field.name}
                label={field.label}
                hint={field.hint}
                error={errors[field.name]}
              >
                <Input
                  type="number"
                  step="0.01"
                  name={field.name}
                  defaultValue={(payment?.[field.name] as number | undefined) ?? 0}
                  onChange={(event) =>
                    setAmounts((current) => ({
                      ...current,
                      [field.name]: Number(event.target.value) || 0,
                    }))
                  }
                />
              </Field>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-muted/50 px-4 py-3">
            <div>
              <p className="eyebrow">Net certified</p>
              <p className="tnum text-lg font-semibold">{money(derivedNet)}</p>
              <p className="text-2xs text-muted-foreground">
                Gross + advance recovery + back charge + retention + VAT adjustments
              </p>
            </div>

            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={overrideNet}
                onChange={(event) => setOverrideNet(event.target.checked)}
                className="size-3.5 accent-[hsl(var(--primary))]"
              />
              Override
            </label>

            {overrideNet ? (
              <Input
                type="number"
                step="0.01"
                name="netCertified"
                defaultValue={payment?.netCertified ?? derivedNet}
                className="max-w-[200px]"
                aria-label="Net certified override"
              />
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions outstanding</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Contractor action" error={errors.contractorAction}>
            <Textarea name="contractorAction" defaultValue={payment?.contractorAction ?? ''} />
          </Field>
          <Field label="Employer action" error={errors.clientAction}>
            <Textarea name="clientAction" defaultValue={payment?.clientAction ?? ''} />
          </Field>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {payment ? 'Save changes' : 'Add certificate'}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={payment ? `/payments/${payment.id}` : '/payments'}>Cancel</Link>
        </Button>

        {payment ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="ghost" className="ml-auto text-destructive">
                <Trash2 className="size-4" /> Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete {payment.ref}?</DialogTitle>
                <DialogDescription>
                  Removing a certificate changes work done, retention and cash position. The change
                  is recorded in the activity log.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="destructive" onClick={onDelete} disabled={deleting}>
                  {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  Delete permanently
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>
    </form>
  );
}
