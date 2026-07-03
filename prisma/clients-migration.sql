CREATE TABLE IF NOT EXISTS "Client" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "freeMinutesPerMonth" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Client_organizationId_name_key"
  ON "Client"("organizationId", "name");

CREATE INDEX IF NOT EXISTS "Client_organizationId_idx"
  ON "Client"("organizationId");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Client_organizationId_fkey'
  ) THEN
    ALTER TABLE "Client"
      ADD CONSTRAINT "Client_organizationId_fkey"
      FOREIGN KEY ("organizationId")
      REFERENCES "Organization"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
