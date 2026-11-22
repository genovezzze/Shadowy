-- Komandas vadība, step 2: personal report columns (an employee's own sheet).
-- Additive for data: one nullable column + FK + indexes. The (org, name)
-- unique index is replaced by (org, owner, name) so two employees can each
-- have a "PVN" column. Nothing in the deployed code reads ReportType yet.
-- Apply to every production database BEFORE merging the code that uses it.
BEGIN;

DROP INDEX IF EXISTS "ReportType_organizationId_name_key";

ALTER TABLE "ReportType" ADD COLUMN IF NOT EXISTS "ownerUserId" TEXT;

CREATE INDEX IF NOT EXISTS "ReportType_ownerUserId_idx" ON "ReportType"("ownerUserId");

CREATE UNIQUE INDEX IF NOT EXISTS "ReportType_organizationId_ownerUserId_name_key"
  ON "ReportType"("organizationId", "ownerUserId", "name");

ALTER TABLE "ReportType" ADD CONSTRAINT "ReportType_ownerUserId_fkey"
  FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
