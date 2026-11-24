-- Komandas vadība, step 3: quick to-dos, absences (vacation / sick / busy)
-- and reports without a deadline.
-- Additive only: two new tables with their foreign keys, and one column with a
-- default on ClientTask (a module table the deployed code does not query by it).
-- Apply to every production database BEFORE merging the code that uses it.
BEGIN;

ALTER TABLE "ClientTask" ADD COLUMN IF NOT EXISTS "hasDeadline" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "QuickTask" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "clientId" TEXT,
    "text" VARCHAR(300) NOT NULL,
    "dueDate" DATE,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuickTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Absence" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "substituteId" TEXT,
    "type" VARCHAR(20) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "startTime" VARCHAR(5),
    "endTime" VARCHAR(5),
    "status" VARCHAR(20) NOT NULL DEFAULT 'planned',
    "approvedById" TEXT,
    "note" VARCHAR(300),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Absence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuickTask_organizationId_idx" ON "QuickTask"("organizationId");

-- CreateIndex
CREATE INDEX "QuickTask_assigneeId_done_idx" ON "QuickTask"("assigneeId", "done");

-- CreateIndex
CREATE INDEX "Absence_organizationId_startDate_idx" ON "Absence"("organizationId", "startDate");

-- CreateIndex
CREATE INDEX "Absence_substituteId_idx" ON "Absence"("substituteId");

-- AddForeignKey
ALTER TABLE "QuickTask" ADD CONSTRAINT "QuickTask_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuickTask" ADD CONSTRAINT "QuickTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuickTask" ADD CONSTRAINT "QuickTask_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuickTask" ADD CONSTRAINT "QuickTask_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_substituteId_fkey" FOREIGN KEY ("substituteId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


COMMIT;
