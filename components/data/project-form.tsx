'use client';

import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/field';
import { saveProject } from '@/lib/actions';
import type { Project } from '@/lib/domain/types';

export function ProjectForm({ project }: { project: Project }) {
  const router = useRouter();
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    const result = await saveProject(new FormData(event.currentTarget));
    setSaving(false);
    if (!result.ok) {
      setErrors(result.errors ?? {});
      toast.error(result.message ?? 'Could not save.');
      return;
    }
    toast.success(result.message ?? 'Saved.');
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Contract particulars</CardTitle>
          <CardDescription>
            These drive the derived figures — percentage complete, the retention cap and the advance
            payment balance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Project code" error={errors.code}>
              <Input name="code" defaultValue={project.code} required />
            </Field>
            <Field label="Project name" error={errors.name}>
              <Input name="name" defaultValue={project.name} required />
            </Field>
            <Field label="Currency" error={errors.currency}>
              <Input name="currency" defaultValue={project.currency} required />
            </Field>
            <Field label="Contractor" error={errors.contractor}>
              <Input name="contractor" defaultValue={project.contractor} required />
            </Field>
            <Field label="Employer" error={errors.client}>
              <Input name="client" defaultValue={project.client} required />
            </Field>
            <Field label="Contract date" hint="YYYY-MM-DD" error={errors.contractDate}>
              <Input type="date" name="contractDate" defaultValue={project.contractDate ?? ''} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label={`Original contract value (${project.currency})`} error={errors.originalContractValue}>
              <Input
                type="number"
                step="0.01"
                name="originalContractValue"
                defaultValue={project.originalContractValue}
              />
            </Field>
            <Field label={`Revised contract value (${project.currency})`} error={errors.revisedContractValue}>
              <Input
                type="number"
                step="0.01"
                name="revisedContractValue"
                defaultValue={project.revisedContractValue}
              />
            </Field>
            <Field label={`Advance payment (${project.currency})`} error={errors.advancePaymentTotal}>
              <Input
                type="number"
                step="0.01"
                name="advancePaymentTotal"
                defaultValue={project.advancePaymentTotal}
              />
            </Field>
            <Field
              label="Advance payment rate"
              hint="0.30 = 30%"
              error={errors.advancePaymentPercent}
            >
              <Input
                type="number"
                step="0.01"
                name="advancePaymentPercent"
                defaultValue={project.advancePaymentPercent}
              />
            </Field>
            <Field
              label="Retention cap"
              hint="0.05 = 5% of the revised contract"
              error={errors.retentionCapPercent}
            >
              <Input
                type="number"
                step="0.01"
                name="retentionCapPercent"
                defaultValue={project.retentionCapPercent}
              />
            </Field>
            <Field label="VAT rate" hint="0.15 = 15%" error={errors.vatRate}>
              <Input type="number" step="0.01" name="vatRate" defaultValue={project.vatRate} />
            </Field>
            <Field label="Data as of" hint="YYYY-MM-DD" error={errors.dataAsOf}>
              <Input type="date" name="dataAsOf" defaultValue={project.dataAsOf ?? ''} />
            </Field>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save particulars
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
