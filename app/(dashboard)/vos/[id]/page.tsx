import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { VODetails } from '@/components/vo/vo-details';
import { SubmissionType, VOStatus } from '@/lib/validations/vo';

interface VOPageProps {
  params: Promise<{ id: string }>;
}

export default async function VOPage({ params }: VOPageProps) {
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
    submissionType: vo.submissionType as SubmissionType,
    submissionReference: vo.submissionReference,
    responseReference: vo.responseReference,
    submissionDate: vo.submissionDate.toISOString(),
    assessmentValue: vo.assessmentValue,
    proposalValue: vo.proposalValue,
    approvedAmount: vo.approvedAmount,
    status: vo.status as VOStatus,
    vorReference: vo.vorReference,
    dvoReference: vo.dvoReference,
    dvoIssuedDate: vo.dvoIssuedDate?.toISOString() || null,
    remarks: vo.remarks,
    actionNotes: vo.actionNotes,
    createdAt: vo.createdAt.toISOString(),
    updatedAt: vo.updatedAt.toISOString(),
  };

  return <VODetails vo={voData} isAdmin={true} />;
}
