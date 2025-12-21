'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from './status-badge';
import { DeleteVODialog } from './delete-vo-dialog';
import { VO, useDeleteVO } from '@/lib/hooks/use-vos';
import { formatCurrency, formatDate } from '@/lib/utils';
import { submissionTypeConfig, VOStatus, SubmissionType } from '@/lib/validations/vo';
import { useToast } from '@/components/ui/use-toast';

interface VODetailsProps {
  vo: VO;
  isAdmin?: boolean;
}

export function VODetails({ vo, isAdmin }: VODetailsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showDelete, setShowDelete] = useState(false);
  const deleteMutation = useDeleteVO();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(vo.id);
      toast({
        title: 'VO deleted',
        description: 'The Variation Order has been deleted successfully.',
      });
      router.push('/vos');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete VO',
        variant: 'destructive',
      });
    }
  };

  const DetailRow = ({
    label,
    value,
    className = '',
  }: {
    label: string;
    value: React.ReactNode;
    className?: string;
  }) => (
    <div className={`space-y-1 ${className}`}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value || '-'}</p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/vos" className="mt-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">VO #{vo.id}</h1>
              <StatusBadge status={vo.status as VOStatus} />
            </div>
            <p className="text-sm text-muted-foreground break-words leading-relaxed pr-2">{vo.subject}</p>
          </div>
        </div>

        {isAdmin && (
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex">
            <Link href={`/vos/${vo.id}/edit`} className="w-full sm:w-auto">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button
              variant="outline"
              className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground w-full sm:w-auto"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <DetailRow label="Subject" value={vo.subject} className="sm:col-span-2" />
            <DetailRow
              label="Submission Type"
              value={
                submissionTypeConfig[vo.submissionType as SubmissionType]?.label ||
                vo.submissionType
              }
            />
            <DetailRow label="Status" value={<StatusBadge status={vo.status as VOStatus} />} />
            <DetailRow label="Submission Reference" value={vo.submissionReference} />
            <DetailRow label="Response Reference" value={vo.responseReference} />
            <DetailRow label="Submission Date" value={formatDate(vo.submissionDate)} />
            <DetailRow label="Created At" value={formatDate(vo.createdAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <DetailRow
              label="Assessment Value"
              value={
                <span className="font-mono">{formatCurrency(vo.assessmentValue)}</span>
              }
            />
            <DetailRow
              label="Proposal Value"
              value={
                <span className="font-mono">{formatCurrency(vo.proposalValue)}</span>
              }
            />
            <DetailRow
              label="Approved Amount"
              value={
                <span className="font-mono text-green-600 dark:text-green-400">
                  {formatCurrency(vo.approvedAmount)}
                </span>
              }
              className="sm:col-span-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reference & Tracking</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <DetailRow label="VOR Reference" value={vo.vorReference} />
            <DetailRow label="DVO Reference" value={vo.dvoReference} />
            <DetailRow label="DVO Issued Date" value={formatDate(vo.dvoIssuedDate)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow
              label="Remarks"
              value={vo.remarks || 'No remarks'}
            />
            <Separator />
            <DetailRow
              label="Action Notes"
              value={vo.actionNotes || 'No action notes'}
            />
          </CardContent>
        </Card>
      </div>

      <DeleteVODialog
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </motion.div>
  );
}
