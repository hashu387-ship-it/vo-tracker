import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { VOForm } from '@/components/vo/vo-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EditVOPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVOPage({ params }: EditVOPageProps) {
  const { id } = await params;
  const voId = parseInt(id, 10);

  if (isNaN(voId)) {
    notFound();
  }

  const vo = await prisma.vO.findUnique({
    where: { id: voId },
  });

  if (!vo) {
    notFound();
  }

  // Convert Prisma object to plain object for client component
  const voData = {
    id: vo.id,
    subject: vo.subject,
    submissionType: vo.submissionType,
    submissionReference: vo.submissionReference,
    responseReference: vo.responseReference,
    submissionDate: vo.submissionDate.toISOString(),
    assessmentValue: vo.assessmentValue,
    proposalValue: vo.proposalValue,
    approvedAmount: vo.approvedAmount,
    status: vo.status,
    vorReference: vo.vorReference,
    dvoReference: vo.dvoReference,
    dvoIssuedDate: vo.dvoIssuedDate?.toISOString() || null,
    remarks: vo.remarks,
    actionNotes: vo.actionNotes,
    createdAt: vo.createdAt.toISOString(),
    updatedAt: vo.updatedAt.toISOString(),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/vos/${voId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit VO #{voId}</h1>
          <p className="text-muted-foreground">Update variation order details</p>
        </div>
      </div>

      <VOForm vo={voData} mode="edit" />
    </div>
  );
}
