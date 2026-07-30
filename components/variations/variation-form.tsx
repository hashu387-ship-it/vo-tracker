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
import { deleteVariation, saveVariation } from '@/lib/actions';
import {
  SUBMISSION_TYPES,
  VARIATION_STATUSES,
  VARIATION_STATUS_META,
  type Variation,
} from '@/lib/domain/types';

export function VariationForm({
  variation,
  currency,
}: {
  variation?: Variation;
  currency: string;
}) {
  const router = useRouter();
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    const formData = new FormData(event.currentTarget);
    const result = await saveVariation(variation?.id ?? null, formData);
    setSaving(false);

    if (!result.ok) {
      setErrors(result.errors ?? {});
      toast.error(result.message ?? 'Could not save.');
      return;
    }
    toast.success(result.message ?? 'Saved.');
    router.push(result.id ? `/variations/${result.id}` : '/variations');
    router.refresh();
  };

  const onDelete = async () => {
    if (!variation) return;
    setDeleting(true);
    const result = await deleteVariation(variation.id);
    setDeleting(false);
    if (!result.ok) {
      toast.error(result.message ?? 'Could not delete.');
      return;
    }
    toast.success(result.message ?? 'Deleted.');
    router.push('/variations');
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>The change</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="VO number" hint="e.g. VO-42" error={errors.voNumber} className="sm:col-span-1">
              <Input name="voNumber" defaultValue={variation?.voNumber ?? ''} placeholder="VO-00" />
            </Field>

            <Field label="Submission type" error={errors.submissionType}>
              <Select name="submissionType" defaultValue={variation?.submissionType ?? ''}>
                <option value="">Not set</option>
                {SUBMISSION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Subject" error={errors.subject} className="sm:col-span-2">
              <Textarea
                name="subject"
                required
                defaultValue={variation?.subject ?? ''}
                placeholder="Describe the change in the words used on the VOR"
                className="min-h-[64px]"
              />
            </Field>

            <Field label="Raised in Aconex" hint="YYYY-MM-DD" error={errors.aconexDate}>
              <Input type="date" name="aconexDate" defaultValue={variation?.aconexDate ?? ''} />
            </Field>

            <Field label="Cost proposal submitted" hint="YYYY-MM-DD" error={errors.submissionDate}>
              <Input type="date" name="submissionDate" defaultValue={variation?.submissionDate ?? ''} />
            </Field>

            <Field label="Submission reference" error={errors.submissionRef}>
              <Input
                name="submissionRef"
                defaultValue={variation?.submissionRef ?? ''}
                placeholder="FFC06HW2-GENCORR-000000"
              />
            </Field>

            <Field label="Response reference" error={errors.responseRef}>
              <Input name="responseRef" defaultValue={variation?.responseRef ?? ''} />
            </Field>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status &amp; ownership</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Status" error={errors.status}>
                <Select name="status" defaultValue={variation?.status ?? ''}>
                  <option value="">No status</option>
                  {VARIATION_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {VARIATION_STATUS_META[status].label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Owner" hint="who is driving it" error={errors.owner}>
                <Input name="owner" defaultValue={variation?.owner ?? ''} placeholder="Name" />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Values ({currency})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field
                label="Cost proposal value"
                hint="as priced by the contractor"
                error={errors.proposalValue}
              >
                <Input
                  type="number"
                  step="0.01"
                  name="proposalValue"
                  defaultValue={variation?.proposalValue ?? ''}
                />
              </Field>

              <Field
                label="RSG assessment"
                hint="the Employer's valuation"
                error={errors.clientAssessment}
              >
                <Input
                  type="number"
                  step="0.01"
                  name="clientAssessment"
                  defaultValue={variation?.clientAssessment ?? ''}
                />
              </Field>

              <Field
                label="Agreed value"
                hint="carried to the summary"
                error={errors.agreedValue}
              >
                <Input
                  type="number"
                  step="0.01"
                  name="agreedValue"
                  defaultValue={variation?.agreedValue ?? ''}
                />
              </Field>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>References &amp; remarks</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="VOR reference" error={errors.vorRef}>
            <Input
              name="vorRef"
              defaultValue={variation?.vorRef ?? ''}
              placeholder="R06-HW2C05-TRS-VOR-CM-0000"
            />
          </Field>

          <Field label="DVO reference" error={errors.dvoRef}>
            <Input
              name="dvoRef"
              defaultValue={variation?.dvoRef ?? ''}
              placeholder="R06-HW2C05-TRS-DVO-CM-0000"
            />
          </Field>

          <Field label="DVO short reference" error={errors.dvoReference}>
            <Input name="dvoReference" defaultValue={variation?.dvoReference ?? ''} placeholder="DVO-CM-0000" />
          </Field>

          <Field label="Aconex link" error={errors.aconexLink}>
            <Input name="aconexLink" type="url" defaultValue={variation?.aconexLink ?? ''} placeholder="https://" />
          </Field>

          <Field label="Submission link" error={errors.submissionLink} className="sm:col-span-2">
            <Input
              name="submissionLink"
              type="url"
              defaultValue={variation?.submissionLink ?? ''}
              placeholder="https://"
            />
          </Field>

          <Field label="Contractor remarks" error={errors.contractorRemarks}>
            <Textarea name="contractorRemarks" defaultValue={variation?.contractorRemarks ?? ''} />
          </Field>

          <Field label="Employer remarks" error={errors.clientRemarks}>
            <Textarea name="clientRemarks" defaultValue={variation?.clientRemarks ?? ''} />
          </Field>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {variation ? 'Save changes' : 'Add variation'}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={variation ? `/variations/${variation.id}` : '/variations'}>Cancel</Link>
        </Button>

        {variation ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="ghost" className="ml-auto text-destructive">
                <Trash2 className="size-4" /> Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete {variation.voNumber ?? 'this variation'}?</DialogTitle>
                <DialogDescription>
                  It will be removed from the register and from every total. The change is recorded
                  in the activity log.
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
