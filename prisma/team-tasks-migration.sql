-- Komandas vadība: recurring client report tasks.
-- Additive only: one enum, two nullable/defaulted columns, four new tables.
-- Apply to every production database BEFORE merging the code that uses it.
BEGIN;

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'DONE');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "teamTasksEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "responsibleUserId" TEXT;

-- CreateTable
CREATE TABLE "ReportType" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" VARCHAR(40) NOT NULL,
    "dueDay" INTEGER NOT NULL DEFAULT 7,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientReport" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "reportTypeId" TEXT NOT NULL,
    "responsibleUserId" TEXT,
    "frequency" VARCHAR(20) NOT NULL DEFAULT 'monthly',
    "dueDay" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientTask" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "reportTypeId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "period" VARCHAR(7) NOT NULL,
    "dueDate" DATE NOT NULL,
    "originalDueDate" DATE NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completedAt" TIMESTAMP(3),
    "completedById" TEXT,
    "comment" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientMonthNote" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "period" VARCHAR(7) NOT NULL,
    "text" VARCHAR(500) NOT NULL,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientMonthNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportType_organizationId_idx" ON "ReportType"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportType_organizationId_name_key" ON "ReportType"("organizationId", "name");

-- CreateIndex
CREATE INDEX "ClientReport_organizationId_idx" ON "ClientReport"("organizationId");

-- CreateIndex
CREATE INDEX "ClientReport_reportTypeId_idx" ON "ClientReport"("reportTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientReport_clientId_reportTypeId_key" ON "ClientReport"("clientId", "reportTypeId");

-- CreateIndex
CREATE INDEX "ClientTask_organizationId_period_idx" ON "ClientTask"("organizationId", "period");

-- CreateIndex
CREATE INDEX "ClientTask_assigneeId_status_idx" ON "ClientTask"("assigneeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ClientTask_clientId_reportTypeId_period_key" ON "ClientTask"("clientId", "reportTypeId", "period");

-- CreateIndex
CREATE INDEX "ClientMonthNote_organizationId_period_idx" ON "ClientMonthNote"("organizationId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "ClientMonthNote_clientId_period_key" ON "ClientMonthNote"("clientId", "period");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportType" ADD CONSTRAINT "ReportType_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientReport" ADD CONSTRAINT "ClientReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientReport" ADD CONSTRAINT "ClientReport_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientReport" ADD CONSTRAINT "ClientReport_reportTypeId_fkey" FOREIGN KEY ("reportTypeId") REFERENCES "ReportType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientReport" ADD CONSTRAINT "ClientReport_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTask" ADD CONSTRAINT "ClientTask_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTask" ADD CONSTRAINT "ClientTask_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTask" ADD CONSTRAINT "ClientTask_reportTypeId_fkey" FOREIGN KEY ("reportTypeId") REFERENCES "ReportType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTask" ADD CONSTRAINT "ClientTask_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTask" ADD CONSTRAINT "ClientTask_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientMonthNote" ADD CONSTRAINT "ClientMonthNote_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientMonthNote" ADD CONSTRAINT "ClientMonthNote_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientMonthNote" ADD CONSTRAINT "ClientMonthNote_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


COMMIT;
