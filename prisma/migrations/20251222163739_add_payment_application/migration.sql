-- CreateTable
CREATE TABLE "variation_orders" (
    "id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "submissionType" TEXT NOT NULL,
    "submissionReference" TEXT,
    "responseReference" TEXT,
    "submissionDate" TIMESTAMP(3) NOT NULL,
    "assessmentValue" DOUBLE PRECISION,
    "proposalValue" DOUBLE PRECISION,
    "approvedAmount" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'PendingWithFFC',
    "vorReference" TEXT,
    "dvoReference" TEXT,
    "dvoIssuedDate" TIMESTAMP(3),
    "proposedFileUrl" TEXT,
    "assessmentFileUrl" TEXT,
    "approvalFileUrl" TEXT,
    "dvoFileUrl" TEXT,
    "remarks" TEXT,
    "actionNotes" TEXT,
    "ffcRsgProposedFile" TEXT,
    "rsgAssessedFile" TEXT,
    "dvoRrApprovedFile" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isExcludedFromStats" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "variation_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_applications" (
    "id" SERIAL NOT NULL,
    "paymentNo" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "grossAmount" DOUBLE PRECISION NOT NULL,
    "advancePaymentRecovery" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "retention" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vatRecovery" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vat" DOUBLE PRECISION NOT NULL,
    "netPayment" DOUBLE PRECISION NOT NULL,
    "submittedDate" TIMESTAMP(3),
    "invoiceDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_applications_pkey" PRIMARY KEY ("id")
);
