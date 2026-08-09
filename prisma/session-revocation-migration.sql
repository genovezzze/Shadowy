-- Session revocation for stateless JWT sessions.
--
-- Any session token issued before "sessionsValidFrom" is rejected on the server,
-- so changing a password (or pressing "sign out everywhere") invalidates tokens
-- that were already handed out — including stolen ones.
--
-- Additive and nullable: existing sessions keep working until their owner
-- changes a password or signs out everywhere.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "sessionsValidFrom" TIMESTAMP(3);
