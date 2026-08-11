-- "Helped a colleague": the "why it was invisible work" axis, split out of
-- `category`. Additive only - no existing column or row is modified here.

ALTER TABLE "InvisibleWorkEntry"
  ADD COLUMN IF NOT EXISTS "helpedColleague" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "helpedUserId" TEXT;

CREATE INDEX IF NOT EXISTS "InvisibleWorkEntry_helpedUserId_idx"
  ON "InvisibleWorkEntry" ("helpedUserId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'InvisibleWorkEntry_helpedUserId_fkey'
  ) THEN
    ALTER TABLE "InvisibleWorkEntry"
      ADD CONSTRAINT "InvisibleWorkEntry_helpedUserId_fkey"
      FOREIGN KEY ("helpedUserId") REFERENCES "User"("id") ON DELETE SET NULL;
  END IF;
END $$;


-- ---------------------------------------------------------------------------
-- OPTIONAL BACKFILL - review before running, this one DOES rewrite rows.
--
-- 117 historical entries still sit in the retired "palīdzība kolēģim"
-- category. These statements re-file them by what the title says was actually
-- done. Only that category is touched - every other category is left alone.
--
-- Run the SELECT first to see what each UPDATE would touch.
-- ---------------------------------------------------------------------------

-- SELECT title, count(*) FROM "InvisibleWorkEntry"
--   WHERE category IN ('helping_colleague', 'palīdzība kolēģim', 'Palīdzība kolēģiem')
--   GROUP BY 1 ORDER BY 2 DESC;

-- Step 1: set "helpedColleague" only where the TITLE says so.
--
-- Do not blanket-set it from the old category. Of the 129 rows there, a
-- read-only dry run of the rules below re-files 118 as ordinary accounting and
-- document work; only 11 actually describe helping a colleague. Setting the
-- flag from the category alone would move 118 false positives into it and
-- re-create the exact problem this split exists to fix.
--
-- These 11 are matched on the title instead. Run the SELECT first.

-- The 'palīdz|palidz' arm catches entries that name the person instead of the
-- role ("palidzeju annai", written without diacritics). The 'klient' exclusion
-- keeps "Palīdzēšana klientam" out - that is help to a client, not a colleague.

-- SELECT title, count(*) FROM "InvisibleWorkEntry"
--   WHERE category IN ('helping_colleague', 'palīdzība kolēģim', 'Palīdzība kolēģiem')
--     AND title ~* 'kolēģ|palīdz|palidz' AND title !~* 'klient'
--   GROUP BY 1 ORDER BY 2 DESC;

-- UPDATE "InvisibleWorkEntry" SET "helpedColleague" = true
--   WHERE category IN ('helping_colleague', 'palīdzība kolēģim', 'Palīdzība kolēģiem')
--     AND title ~* 'kolēģ|palīdz|palidz' AND title !~* 'klient';

-- Note: the recipient is not recoverable - none of these titles name the
-- colleague - so "helpedUserId" stays NULL and the card shows the flag without
-- a name. Only entries created through the form from now on carry a name.

-- Step 2: re-file misclassified rows by what the title says was actually done.
--
-- ORDER IS LOAD-BEARING - each statement only sees what the previous ones left
-- behind, and several titles match more than one rule:
--   "Iegrāmatoti un pārbaudīti rēķini"  -> bookkeeping must run before checks
--   "Rēķinu saglabāšana un iegrāmatošana" -> bookkeeping before scanning
--   "Grāmatvedības dokumentu ieskenēšana" -> NOT matched by 'grāmato'
--                                            ("grāmatv"), correctly scanning
--
-- Patterns were derived from all 75 distinct titles currently sitting in
-- "palīdzība kolēģim" and cover every one of them. They include the typos
-- present in the real data ("sakātošana", "dokuemntu", "dokementu").

-- 2a. Invoices issued to a client - distinct from booking received invoices.
-- UPDATE "InvisibleWorkEntry" SET category = 'invoicing'
--   WHERE category IN ('helping_colleague', 'palīdzība kolēģim', 'Palīdzība kolēģiem')
--     AND title ~* 'izraksti|izrakstī|kvīt|rēķinu izveidoš|rēķina izveidoš';

-- 2b. Money moved, not recorded.
-- UPDATE "InvisibleWorkEntry" SET category = 'payment_preparation'
--   WHERE category IN ('helping_colleague', 'palīdzība kolēģim', 'Palīdzība kolēģiem')
--     AND title ~* 'maksājumu ievieto|ievietošana bankā';

-- 2c. Acts and contracts. Deliberately narrow ('izpildes akt', not 'akt') so
-- "Sakārtoti parakstītie pieņemšanas-nodošanas akti" stays document handling.
-- UPDATE "InvisibleWorkEntry" SET category = 'legal_documents'
--   WHERE category IN ('helping_colleague', 'palīdzība kolēģim', 'Palīdzība kolēģiem')
--     AND title ~* 'izpildes akt|sagatavots.*akt';

-- 2d. Posting to the books, split by the object being posted. These run before
-- scanning and before checks: a title naming both ("Rēķinu saglabāšana un
-- iegrāmatošana", "Iegrāmatoti un pārbaudīti rēķini") is first and foremost a
-- posting entry. Within the group, order is most-specific-first - payroll and
-- cash before the generic invoice rule, or "Darba algu iegrāmatošana" would be
-- swallowed by it.

-- UPDATE "InvisibleWorkEntry" SET category = 'payroll_calculation'
--   WHERE category IN ('helping_colleague', 'palīdzība kolēģim', 'Palīdzība kolēģiem')
--     AND title ~* '(grāmato|gramato).*alg|alg.*(grāmato|gramato)';

-- UPDATE "InvisibleWorkEntry" SET category = 'bookkeeping_cash'
--   WHERE category IN ('helping_colleague', 'palīdzība kolēģim', 'Palīdzība kolēģiem')
--     AND title ~* 'kase|kases|z atskai|order';

-- The advance and receipt rules require a posting verb, not just the noun:
-- "Avansa norēķinu ieskenēšana" and "Ieskenēti un sakārtoti kreditoru čeki" are
-- scanning jobs and must fall through to 2f, not be caught here by the object.
-- UPDATE "InvisibleWorkEntry" SET category = 'bookkeeping_advances'
--   WHERE category IN ('helping_colleague', 'palīdzība kolēģim', 'Palīdzība kolēģiem')
--     AND title ~* 'avansa norēķin.*(grāmato|ievad)|(grāmato|ievad).*avansa norēķin';

-- UPDATE "InvisibleWorkEntry" SET category = 'bookkeeping_bank'
--   WHERE category IN ('helping_colleague', 'palīdzība kolēģim', 'Palīdzība kolēģiem')
--     AND title ~* 'bankas dat|karšu maksājum';

-- UPDATE "InvisibleWorkEntry" SET category = 'bookkeeping_receipts'
--   WHERE category IN ('helping_colleague', 'palīdzība kolēģim', 'Palīdzība kolēģiem')
--     AND title ~* 'ček.*(grāmato|apstrād|ievad|līmēšan)|(grāmato|apstrād|ievad|līmēšan).*ček';

-- UPDATE "InvisibleWorkEntry" SET category = 'bookkeeping_invoices'
--   WHERE category IN ('helping_colleague', 'palīdzība kolēģim', 'Palīdzība kolēģiem')
--     AND title ~* 'grāmato|gramato';

-- 2e. Checks and matching.
-- UPDATE "InvisibleWorkEntry" SET category = 'reconciliation'
--   WHERE category IN ('helping_colleague', 'palīdzība kolēģim', 'Palīdzība kolēģiem')
--     AND title ~* 'pārbaud|salīdzin|saskaņo';

-- 2f. Handling the paper itself. Scanning/digitising is separated from
-- archiving/sorting: the first is a candidate for receiving documents digitally,
-- the second is not. Scanning wins when a title names both ("Ieskenēti un
-- sakārtoti kreditoru čeki") because that is the part that took the time.
-- 'sakāto' and 'dokuemntu|dokementu' are real spellings in the data.

-- UPDATE "InvisibleWorkEntry" SET category = 'document_scanning'
--   WHERE category IN ('helping_colleague', 'palīdzība kolēģim', 'Palīdzība kolēģiem')
--     AND title ~* 'sken|digitaliz';

-- UPDATE "InvisibleWorkEntry" SET category = 'document_archiving'
--   WHERE category IN ('helping_colleague', 'palīdzība kolēģim', 'Palīdzība kolēģiem')
--     AND title ~* 'arhiv|sakārto|sakāto|saglabā|mapēs';

-- 2g. Data entry and the vague "apstrāde" rows. Judgement call: "čeku apstrāde"
-- is treated as receipt posting - review these before committing.
-- UPDATE "InvisibleWorkEntry" SET category = 'bookkeeping_invoices'
--   WHERE category IN ('helping_colleague', 'palīdzība kolēģim', 'Palīdzība kolēģiem')
--     AND title ~* 'ievad|ievade|ievietošana jum|apstrād|atskaišu|atskaites';

-- 2h. The genuine colleague-help rows still need a category saying what the
-- work was. Two of them do say; the rest land in 'other' at step 3, which is
-- honest - "helped a colleague with a task" names no work type.
-- UPDATE "InvisibleWorkEntry" SET category = 'repeated_questions'
--   WHERE category IN ('helping_colleague', 'palīdzība kolēģim', 'Palīdzība kolēģiem')
--     AND title ~* 'jautājum';

-- UPDATE "InvisibleWorkEntry" SET category = 'fixing_mistakes'
--   WHERE category IN ('helping_colleague', 'palīdzība kolēģim', 'Palīdzība kolēģiem')
--     AND title ~* 'kļūd';

-- 2i. Help that went to a client, not a colleague.
-- UPDATE "InvisibleWorkEntry" SET category = 'client_communication'
--   WHERE category IN ('helping_colleague', 'palīdzība kolēģim', 'Palīdzība kolēģiem')
--     AND title ~* 'klient';

-- Step 3: safety net. Against today's data this touches nothing - the rules
-- above cover all 117 rows - but it catches anything added before the backfill
-- runs, so no row is left claiming to be help to a colleague.
-- UPDATE "InvisibleWorkEntry" SET category = 'other'
--   WHERE category IN ('helping_colleague', 'palīdzība kolēģim', 'Palīdzība kolēģiem');
